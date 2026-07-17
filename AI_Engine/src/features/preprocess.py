"""Leakage-safe preprocessing for the TabPFN feature schema."""

from __future__ import annotations

from typing import Any

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder

from src.features.schema import model_feature_columns


def make_preprocessor(config: dict[str, Any]) -> ColumnTransformer:
    schema = config["schema"]
    ordinal_features = schema["ordinal_features"]
    categories = [schema["ordinal_categories"][feature] for feature in ordinal_features]
    numeric_pipeline = Pipeline([("imputer", SimpleImputer(strategy="median"))])
    ordinal_pipeline = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OrdinalEncoder(
                    categories=categories,
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, schema["numeric_features"]),
            ("ordinal", ordinal_pipeline, ordinal_features),
            ("boolean", numeric_pipeline, schema["boolean_features"]),
        ],
        sparse_threshold=0,
        verbose_feature_names_out=False,
    )


def feature_frame(frame, config: dict[str, Any]):
    return frame[model_feature_columns(config)].copy()
