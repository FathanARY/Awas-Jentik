"""
train_model_v2.py

Retraining pakai dataset dummy yang tim buat sendiri
(dataset_dummy_malaria_desa_harapan_jaya.xlsx, sheet Data_Training, 2400 baris)
-- MENGGANTIKAN generate_synthetic_data.py dari starter kit sebelumnya, karena
dataset tim lebih detail dan sudah tervalidasi (lihat hasil audit sebelumnya).

ARSITEKTUR MENGIKUTI DESAIN TIM (bukan didesain ulang dari nol):
Tim sudah memisahkan 3 komponen dengan formula terdokumentasi di sheet Kodebook:
    Risiko_Gabungan = 0.65 x Habitat_Risk_Score
                     + 0.20 x Mobility_Risk_Score
                     + 0.15 x skor_kasus

Jadi kita training 2 model terpisah (bukan 1 model gabungan langsung):
1. Model HABITAT  -> prediksi Habitat_Risk_Score_0_100 dari fitur lingkungan
2. Model MOBILITAS -> prediksi Mobility_Risk_Score_0_100 dari fitur mobilitas

skor_kasus TIDAK dilatih pakai ML -- direverse-engineer dari data (lihat catatan
di bawah) dan ternyata cuma fungsi sederhana dari jumlah kasus, jadi cukup
diimplementasi sebagai formula langsung, tidak perlu model.

CATATAN PENTING soal skor_kasus (transparansi):
Analisis residual pada dataset tim menunjukkan skor_kasus ~= clip(16 x
Kasus_Malaria_1km_30Hari, 0, 100) dengan noise kecil (std~2). Ini didokumentasikan
di sini secara eksplisit untuk transparansi -- kalau tim sumber data
memformulasikan beda, sesuaikan CASE_SCORE_MULTIPLIER di bawah.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import joblib

DATA_PATH = "data/data_training_raw.csv"

# --- Formula gabungan (persis dari Kodebook tim, sheet Data_Training) ---
W_HABITAT = 0.65
W_MOBILITY = 0.20
W_CASE = 0.15
CASE_SCORE_MULTIPLIER = 16  # hasil reverse-engineering, lihat catatan di atas

HABITAT_FEATURES = [
    "Persentase_Lumut", "Persentase_Vegetasi", "Air_Tenang_bin", "Paparan_ord",
    "Luas_Genangan_m2", "Curah_Hujan_30_Hari_mm",
    "Jarak_Hutan_m", "Jarak_Sawah_m", "Jarak_Sungai_m", "Jarak_Rawa_m",
    "Jarak_Tambang_m", "Jarak_Permukiman_m", "Jarak_Puskesmas_m",
]
# Kasus_Malaria_1km_30Hari SENGAJA tidak dimasukkan ke fitur habitat -- sesuai
# desain tim (Kodebook: Habitat_Risk_Score = "berdasarkan lingkungan dan kondisi
# genangan"), dan terverifikasi korelasinya ~0.006 di data mereka -- memasukkannya
# hanya akan menambah noise, bukan sinyal, ke model habitat.

MOBILITY_FEATURES = [
    "Pendatang_30_Hari", "Pendatang_Dari_Endemis", "Pekerja_Mobil",
    "Riwayat_Perjalanan_Endemis",
]

PAPARAN_MAP = {"Rendah": 0, "Sedang": 1, "Tinggi": 2}


def load_and_encode():
    df = pd.read_csv(DATA_PATH)
    df["Air_Tenang_bin"] = (df["Air_Tenang"] == "Ya").astype(int)
    df["Paparan_ord"] = df["Paparan_Matahari"].map(PAPARAN_MAP)
    return df


def categorize_habitat(score):
    if score <= 20:
        return "Very Low"
    elif score <= 40:
        return "Low"
    elif score <= 60:
        return "Medium"
    elif score <= 80:
        return "High"
    else:
        return "Very High"


def categorize_heatmap4(score):
    if score <= 25:
        return "Sangat Rendah"
    elif score <= 50:
        return "Rendah"
    elif score <= 75:
        return "Sedang"
    else:
        return "Tinggi"


def train_submodel(df, feature_cols, target_col, model_filename, label):
    X = df[feature_cols]
    y = df[target_col]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = RandomForestRegressor(
        n_estimators=300, max_depth=8, min_samples_leaf=5, random_state=42
    )
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    r2 = r2_score(y_test, pred)
    mae = mean_absolute_error(y_test, pred)

    print(f"\n=== Model {label} ===")
    print(f"Fitur       : {feature_cols}")
    print(f"Target      : {target_col}")
    print(f"Test R2     : {r2:.3f}")
    print(f"Test MAE    : {mae:.2f} poin (skala 0-100)")

    importances = pd.Series(model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("Feature importance:")
    print(importances.round(3).to_string())

    joblib.dump(model, model_filename)
    print(f"Model tersimpan ke {model_filename}")
    return model, r2, importances


def main():
    df = load_and_encode()
    print(f"Total data: {len(df)} baris")

    habitat_model, habitat_r2, habitat_imp = train_submodel(
        df, HABITAT_FEATURES, "Habitat_Risk_Score_0_100",
        "models/habitat_model.pkl", "HABITAT"
    )
    mobility_model, mobility_r2, mobility_imp = train_submodel(
        df, MOBILITY_FEATURES, "Mobility_Risk_Score_0_100",
        "models/mobility_model.pkl", "MOBILITAS"
    )

    # --- Validasi end-to-end: bandingkan hasil kombinasi formula dengan
    # Risiko_Gabungan_0_100 asli di dataset tim ---
    df["pred_habitat"] = habitat_model.predict(df[HABITAT_FEATURES])
    df["pred_mobility"] = mobility_model.predict(df[MOBILITY_FEATURES])
    df["pred_case_score"] = np.clip(df["Kasus_Malaria_1km_30Hari"] * CASE_SCORE_MULTIPLIER, 0, 100)
    df["pred_combined"] = (
        W_HABITAT * df["pred_habitat"]
        + W_MOBILITY * df["pred_mobility"]
        + W_CASE * df["pred_case_score"]
    )

    combined_r2 = r2_score(df["Risiko_Gabungan_0_100"], df["pred_combined"])
    combined_mae = mean_absolute_error(df["Risiko_Gabungan_0_100"], df["pred_combined"])
    print(f"\n=== Validasi Risiko_Gabungan (formula tim vs prediksi model) ===")
    print(f"R2 terhadap Risiko_Gabungan_0_100 asli: {combined_r2:.3f}")
    print(f"MAE: {combined_mae:.2f} poin")

    # Sanity check kategori
    df["pred_kategori_habitat"] = df["pred_habitat"].apply(categorize_habitat)
    df["pred_kategori_heatmap"] = df["pred_combined"].apply(categorize_heatmap4)
    habitat_match = (df["pred_kategori_habitat"] == df["Kategori_Habitat_5"]).mean()
    heatmap_match = (df["pred_kategori_heatmap"] == df["Kategori_Heatmap_4"]).mean()
    print(f"Kecocokan kategori habitat (5 kelas): {habitat_match:.1%}")
    print(f"Kecocokan kategori heatmap (4 kelas): {heatmap_match:.1%}")

    # Simpan metadata (dipakai predict_service_v2.py biar tidak hardcode ganda)
    import json
    meta = {
        "w_habitat": W_HABITAT, "w_mobility": W_MOBILITY, "w_case": W_CASE,
        "case_score_multiplier": CASE_SCORE_MULTIPLIER,
        "habitat_features": HABITAT_FEATURES, "mobility_features": MOBILITY_FEATURES,
        "habitat_r2": round(habitat_r2, 3), "mobility_r2": round(mobility_r2, 3),
        "combined_validation_r2": round(combined_r2, 3),
    }
    with open("models/model_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)
    print("\nMetadata tersimpan ke model_metadata.json")


if __name__ == "__main__":
    main()
