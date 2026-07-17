"""Compose automatic features, TabPFN habitat prediction, and transparent rules."""

from __future__ import annotations

import time
from typing import Any

import pandas as pd

from src.features.schema import model_feature_columns
from src.features.scoring import (
    calculate_case_score,
    calculate_combined_risk,
    calculate_mobility_score,
    heatmap_for_score,
)
from src.repositories.cases import CaseRepository
from src.repositories.grid import GridRepository
from src.repositories.rainfall import RainfallProvider
from src.services.explain import explain_tabpfn_prediction


class RiskService:
    def __init__(
        self,
        *,
        config: dict,
        model_service: Any,
        grid_repository: GridRepository,
        rainfall_provider: RainfallProvider,
        case_repository: CaseRepository,
    ):
        self._config = config
        self._model_service = model_service
        self._grid_repository = grid_repository
        self._rainfall_provider = rainfall_provider
        self._case_repository = case_repository

    def assess(self, payload: Any) -> dict[str, Any]:
        started = time.perf_counter()
        automatic = self._grid_repository.habitat_features(payload.grid_id)
        rainfall, rainfall_status = self._rainfall_provider.monthly_mm(
            payload.grid_id, payload.observed_at
        )
        feature_row = {
            "lumut_level": payload.lumut_level,
            "vegetasi_level": payload.vegetasi_level,
            "air_tenang": payload.air_tenang,
            "paparan_matahari": payload.paparan_matahari,
            "luas_genangan_m2": payload.luas_genangan_m2,
            "curah_hujan_bulanan_mm": rainfall,
            **automatic,
        }
        feature_names = model_feature_columns(self._config)
        feature_frame = pd.DataFrame([feature_row])
        habitat = self._model_service.predict(feature_frame)
        mobility = calculate_mobility_score(payload.mobility_level, self._config)
        case_score = calculate_case_score(
            self._case_repository.distances_within_radius_m(
                payload.grid_id, payload.observed_at
            ),
            self._config,
        )
        combined = calculate_combined_risk(
            habitat, mobility, case_score, self._config
        )
        heatmap = heatmap_for_score(combined, self._config)
        explanation = None
        if payload.include_explanation:
            background_path = self._model_service._models_dir / "shap_background.parquet"
            background = pd.read_parquet(background_path)
            explanation = explain_tabpfn_prediction(
                model=self._model_service.model,
                preprocessor=self._model_service.preprocessor,
                background_frame=background,
                request_frame=feature_frame,
                feature_names=feature_names,
                max_evals=int(self._config["api"]["explanation_max_evals"]),
            )
        metadata = self._model_service.metadata()
        return {
            "model_version": metadata.get("model_version", "hrs-tabpfn-v2"),
            "config_version": self._config["api"]["config_version"],
            "habitat_risk_score": round(habitat, 4),
            "mobility_score": mobility,
            "case_score": case_score,
            "combined_risk_score": combined,
            "heatmap": {"level": heatmap.level, "color": heatmap.color},
            "data_sources": {
                "rainfall_source_status": rainfall_status,
                "case_lookback_days": 30,
                "case_radius_m": 1000,
            },
            "explanation": explanation,
            "latency_ms": round((time.perf_counter() - started) * 1000),
        }
