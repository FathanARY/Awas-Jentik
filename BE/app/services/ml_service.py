import os
import sys

MODEL_DIR_ABS = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")
)
sys.path.insert(0, MODEL_DIR_ABS)

import json
import joblib
import numpy as np
import pandas as pd

PAPARAN_MAP = {"Rendah": 0, "Sedang": 1, "Tinggi": 2}

_habitat_model = None
_mobility_model = None
_meta = None


def _load():
    global _habitat_model, _mobility_model, _meta
    model_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")
    )
    if _habitat_model is None:
        _habitat_model = joblib.load(os.path.join(model_dir, "habitat_model.pkl"))
    if _mobility_model is None:
        _mobility_model = joblib.load(os.path.join(model_dir, "mobility_model.pkl"))
    if _meta is None:
        with open(os.path.join(model_dir, "model_metadata.json")) as f:
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
    habitat_model, mobility_model, meta = _load()

    hab_features = meta["habitat_features"]
    mob_features = meta["mobility_features"]

    hab_row = dict(habitat_input)
    hab_row["Air_Tenang_bin"] = 1 if habitat_input.get("Air_Tenang") == "Ya" else 0
    hab_row["Paparan_ord"] = PAPARAN_MAP.get(habitat_input.get("Paparan_Matahari"), 1)

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
