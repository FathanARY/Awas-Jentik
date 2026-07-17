"""Canonical feature schema shared by training and serving."""

from __future__ import annotations

from typing import Any


METADATA_COLUMNS = (
    "observation_id",
    "observed_at",
    "grid_id",
    "spatial_zone_id",
    "base_expert_score",
    "applied_rules",
    "mapping_version",
)


def model_feature_columns(config: dict[str, Any]) -> list[str]:
    schema = config["schema"]
    return [
        *schema["numeric_features"],
        *schema["ordinal_features"],
        *schema["boolean_features"],
    ]


def required_training_columns(config: dict[str, Any]) -> list[str]:
    return [
        *METADATA_COLUMNS,
        *model_feature_columns(config),
        config["schema"]["target_column"],
    ]
