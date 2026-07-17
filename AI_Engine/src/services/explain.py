"""Model-agnostic SHAP explanations compatible with TabPFN regression."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


DISPLAY_NAMES = {
    "lumut_level": "Lumut",
    "vegetasi_level": "Vegetasi",
    "air_tenang": "Air Tenang",
    "paparan_matahari": "Paparan Matahari",
    "luas_genangan_m2": "Luas Genangan",
    "curah_hujan_bulanan_mm": "Curah Hujan",
    "jarak_sungai_m": "Jarak Sungai",
    "jarak_rawa_m": "Jarak Rawa",
    "jarak_sawah_m": "Jarak Sawah",
    "jarak_hutan_m": "Jarak Hutan",
    "jarak_tambang_m": "Jarak Tambang",
}


def explain_tabpfn_prediction(
    *,
    model: Any,
    preprocessor: Any,
    background_frame: pd.DataFrame,
    request_frame: pd.DataFrame,
    feature_names: list[str],
    max_evals: int,
) -> dict[str, Any]:
    import shap

    background = preprocessor.transform(background_frame[feature_names])
    request = preprocessor.transform(request_frame[feature_names])
    explainer = shap.PermutationExplainer(model.predict, background)
    values = explainer(request, max_evals=max(max_evals, 2 * len(feature_names) + 1))
    contribution_values = values.values[0]
    ranked = sorted(
        zip(feature_names, contribution_values, request_frame.iloc[0][feature_names]),
        key=lambda item: abs(float(item[1])),
        reverse=True,
    )[:5]
    return {
        "base_value": round(float(np.ravel(values.base_values)[0]), 4),
        "top_contributors": [
            {
                "feature": DISPLAY_NAMES.get(feature, feature),
                "value": value.item() if hasattr(value, "item") else value,
                "shap_value": round(float(shap_value), 4),
                "direction": "menaikkan" if shap_value >= 0 else "menurunkan",
            }
            for feature, shap_value, value in ranked
        ],
        "note": "Kontribusi menjelaskan perilaku model, bukan kausalitas biologis.",
    }
