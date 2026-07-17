"""Dataset quality checks and deterministic fingerprints."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Any

import pandas as pd

from src.features.schema import model_feature_columns, required_training_columns


@dataclass(frozen=True)
class ValidationReport:
    rows: int
    columns: int
    fingerprint: str


def dataset_fingerprint(frame: pd.DataFrame) -> str:
    normalized = frame.copy()
    normalized = normalized.sort_index(axis=1).sort_values(
        by="observation_id", kind="stable"
    )
    payload = normalized.to_csv(index=False, lineterminator="\n").encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def validate_training_frame(
    frame: pd.DataFrame, config: dict[str, Any]
) -> ValidationReport:
    required = required_training_columns(config)
    missing = sorted(set(required).difference(frame.columns))
    if missing:
        raise ValueError(f"Kolom wajib tidak tersedia: {missing}")
    if frame.empty:
        raise ValueError("Dataset training kosong")
    if frame["observation_id"].duplicated().any():
        raise ValueError("observation_id duplikat")
    if frame["grid_id"].isna().any() or frame["spatial_zone_id"].isna().any():
        raise ValueError("grid_id atau spatial_zone_id kosong")

    numeric_columns = config["schema"]["numeric_features"] + [
        config["schema"]["target_column"]
    ]
    if (frame[numeric_columns] < 0).any().any():
        raise ValueError("Feature numerik atau target memiliki nilai negatif")
    if (frame[config["schema"]["target_column"]] > 100).any():
        raise ValueError("habitat_risk_score melebihi 100")

    for feature, allowed in config["schema"]["ordinal_categories"].items():
        unexpected = sorted(set(frame[feature].dropna()).difference(allowed))
        if unexpected:
            raise ValueError(f"Kategori tidak valid pada {feature}: {unexpected}")
    if frame["air_tenang"].dropna().map(type).isin({bool}).all() is False:
        raise ValueError("air_tenang harus boolean")

    model_features = set(model_feature_columns(config))
    forbidden = {
        "observation_id",
        "grid_id",
        "spatial_zone_id",
        "base_expert_score",
        "applied_rules",
        "combined_risk_score",
        "mobility_score",
        "case_score",
        config["schema"]["target_column"],
    }
    leakage = model_features.intersection(forbidden)
    if leakage:
        raise ValueError(f"Feature leakage terdeteksi: {sorted(leakage)}")
    if frame[model_feature_columns(config)].isna().any().any():
        raise ValueError("Feature model masih memiliki nilai kosong sebelum preprocessing")

    return ValidationReport(
        rows=len(frame),
        columns=len(frame.columns),
        fingerprint=dataset_fingerprint(frame),
    )
