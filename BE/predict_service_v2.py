"""
predict_service_v2.py

Fungsi wrapper siap pakai untuk backend, versi 2 -- dilatih di atas
dataset_dummy_malaria_desa_harapan_jaya.xlsx (dataset buatan tim, bukan
generator sintetisku). Skema nama kolom & encoding mengikuti dataset tim
supaya langsung nyambung dengan sheet Data_Training/Kodebook yang sudah ada.

Cara pakai:
    from predict_service_v2 import predict_risk
    result = predict_risk(habitat_input, mobility_input, kasus_count)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

_habitat_model = None
_mobility_model = None
_meta = None

PAPARAN_MAP = {"Rendah": 0, "Sedang": 1, "Tinggi": 2}


def _load():
    global _habitat_model, _mobility_model, _meta
    if _habitat_model is None:
        _habitat_model = joblib.load(os.path.join(MODEL_DIR, "habitat_model.pkl"))
    if _mobility_model is None:
        _mobility_model = joblib.load(os.path.join(MODEL_DIR, "mobility_model.pkl"))
    if _meta is None:
        with open(os.path.join(MODEL_DIR, "model_metadata.json")) as f:
            _meta = json.load(f)
    return _habitat_model, _mobility_model, _meta


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


def predict_risk(habitat_input: dict, mobility_input: dict, kasus_radius_1km: int) -> dict:
    """
    habitat_input, dict dengan key:
        Persentase_Lumut (0-100), Persentase_Vegetasi (0-100),
        Air_Tenang ("Ya"/"Tidak"), Paparan_Matahari ("Rendah"/"Sedang"/"Tinggi"),
        Luas_Genangan_m2, Curah_Hujan_30_Hari_mm,
        Jarak_Hutan_m, Jarak_Sawah_m, Jarak_Sungai_m, Jarak_Rawa_m,
        Jarak_Tambang_m, Jarak_Permukiman_m, Jarak_Puskesmas_m

    mobility_input, dict dengan key:
        Pendatang_30_Hari, Pendatang_Dari_Endemis, Pekerja_Mobil,
        Riwayat_Perjalanan_Endemis

    kasus_radius_1km: int, jumlah kasus malaria dalam radius 1km/30 hari

    Return: dict siap jadi JSON response API, contoh:
        {
          "habitat_risk_score": 71.2, "habitat_category": "High",
          "mobility_risk_score": 45.0,
          "case_score": 32.0,
          "risiko_gabungan": 58.9, "heatmap_category": "Sedang"
        }
    """
    habitat_model, mobility_model, meta = _load()

    hab_features = meta["habitat_features"]
    mob_features = meta["mobility_features"]

    hab_row = dict(habitat_input)
    hab_row["Air_Tenang_bin"] = 1 if habitat_input.get("Air_Tenang") == "Ya" else 0
    hab_row["Paparan_ord"] = PAPARAN_MAP.get(habitat_input.get("Paparan_Matahari"), 1)

    missing_hab = [c for c in hab_features if c not in hab_row]
    missing_mob = [c for c in mob_features if c not in mobility_input]
    if missing_hab or missing_mob:
        return {"error": f"Field belum lengkap. Habitat: {missing_hab}, Mobilitas: {missing_mob}"}

    X_hab = pd.DataFrame([hab_row])[hab_features]
    X_mob = pd.DataFrame([mobility_input])[mob_features]

    habitat_score = float(np.clip(habitat_model.predict(X_hab)[0], 0, 100))
    mobility_score = float(np.clip(mobility_model.predict(X_mob)[0], 0, 100))
    case_score = float(np.clip(kasus_radius_1km * meta["case_score_multiplier"], 0, 100))

    combined = (
        meta["w_habitat"] * habitat_score
        + meta["w_mobility"] * mobility_score
        + meta["w_case"] * case_score
    )
    combined = float(np.clip(combined, 0, 100))

    return {
        "habitat_risk_score": round(habitat_score, 1),
        "habitat_category": categorize_habitat(habitat_score),
        "mobility_risk_score": round(mobility_score, 1),
        "case_score": round(case_score, 1),
        "risiko_gabungan": round(combined, 1),
        "heatmap_category": categorize_heatmap4(combined),
    }


if __name__ == "__main__":
    # Contoh pemakaian -- ambil baris pertama dari data training tim sebagai uji
    example_habitat = {
        "Persentase_Lumut": 40, "Persentase_Vegetasi": 46,
        "Air_Tenang": "Ya", "Paparan_Matahari": "Rendah",
        "Luas_Genangan_m2": 17.4, "Curah_Hujan_30_Hari_mm": 339,
        "Jarak_Hutan_m": 0, "Jarak_Sawah_m": 1500, "Jarak_Sungai_m": 1750,
        "Jarak_Rawa_m": 2310, "Jarak_Tambang_m": 3830,
        "Jarak_Permukiman_m": 2100, "Jarak_Puskesmas_m": 3370,
    }
    example_mobility = {
        "Pendatang_30_Hari": 4, "Pendatang_Dari_Endemis": 0,
        "Pekerja_Mobil": 1, "Riwayat_Perjalanan_Endemis": 0,
    }
    result = predict_risk(example_habitat, example_mobility, kasus_radius_1km=0)
    print("Contoh input (baris pertama Data_Training tim, OBS-HJ-00001):")
    print(json.dumps({"habitat": example_habitat, "mobility": example_mobility, "kasus": 0}, indent=2))
    print("\nOutput prediksi:")
    print(json.dumps(result, indent=2))
    print("\nNilai ASLI di dataset tim untuk OBS-HJ-00001 (pembanding):")
    print("Habitat_Risk_Score_0_100 = 62, Mobility_Risk_Score_0_100 = 43, Risiko_Gabungan_0_100 = 49, Kategori_Heatmap_4 = Rendah")
