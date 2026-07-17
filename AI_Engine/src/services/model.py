"""Lazy loading dan prediksi untuk bundle model pemenang (TabPFN, XGBoost, atau RF)."""

from __future__ import annotations

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from src.models.serialization import verify_model_bundle


class ModelNotReady(RuntimeError):
    pass


class HabitatModelService:
    """Service loading model yang winner-agnostic (TabPFN, XGBoost, atau RF)."""

    def __init__(self, models_dir: Path, cache_dir: Path):
        self._models_dir = models_dir
        self._cache_dir = cache_dir
        self._model = None
        self._preprocessor = None
        self._metadata: dict | None = None

    def is_ready(self) -> bool:
        return (self._models_dir / "compatibility_manifest.json").exists() and (
            self._models_dir / "model_metadata.json"
        ).exists()

    def metadata(self) -> dict:
        metadata_path = self._models_dir / "model_metadata.json"
        if not metadata_path.exists():
            return {}
        return json.loads(metadata_path.read_text(encoding="utf-8"))

    def _get_model_type(self) -> str:
        manifest_path = self._models_dir / "compatibility_manifest.json"
        if not manifest_path.exists():
            return "tabpfn"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        return str(manifest.get("model_type", "tabpfn"))

    def _load(self) -> None:
        if self._model is not None:
            return
        if not self.is_ready():
            raise ModelNotReady("Bundle model belum tersedia atau belum diverifikasi")
        verify_model_bundle(self._models_dir)
        manifest = json.loads(
            (self._models_dir / "compatibility_manifest.json").read_text(encoding="utf-8")
        )
        model_type = str(manifest.get("model_type", "tabpfn"))
        fitted_filename = manifest.get(
            "fitted_filename",
            "hrs_tabpfn_fitted.tabpfn_fit" if model_type == "tabpfn" else "hrs_winner_model.joblib",
        )
        self._preprocessor = joblib.load(self._models_dir / "hrs_preprocessor.joblib")
        if model_type == "tabpfn":
            os.environ["TABPFN_MODEL_CACHE_DIR"] = str(self._cache_dir)
            from tabpfn.model_loading import load_fitted_tabpfn_model
            self._model = load_fitted_tabpfn_model(
                self._models_dir / fitted_filename, device="cuda"
            )
        else:
            self._model = joblib.load(self._models_dir / fitted_filename)
        self._metadata = self.metadata()

    def predict(self, feature_frame: pd.DataFrame) -> float:
        self._load()
        transformed = self._preprocessor.transform(feature_frame)
        prediction = self._model.predict(transformed)
        return float(np.clip(prediction[0], 0, 100))

    @property
    def model(self):
        self._load()
        return self._model

    @property
    def preprocessor(self):
        self._load()
        return self._preprocessor


# Backward-compat alias — masih dipakai di api/main.py dan test yang belum diupdate
TabPFNModelService = HabitatModelService

