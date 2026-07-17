"""Pydantic request and response schemas that preserve the TDD API contract."""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class RiskAssessmentRequest(BaseModel):
    grid_id: str = Field(pattern=r"^HJ-G-\d{4}$")
    observed_at: date
    lumut_level: Literal["Tidak Ada", "Sedikit", "Sedang", "Banyak"]
    vegetasi_level: Literal["Jarang", "Sedang", "Lebat"]
    air_tenang: bool
    paparan_matahari: Literal["Tinggi", "Sedang", "Rendah"]
    luas_genangan_m2: float = Field(ge=0)
    mobility_level: Literal[
        "Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"
    ]
    photo_document_id: str | None = None
    include_explanation: bool = False


class HeatmapResponse(BaseModel):
    level: str
    color: str


class DataSourcesResponse(BaseModel):
    rainfall_source_status: str
    case_lookback_days: int
    case_radius_m: int


class RiskAssessmentResponse(BaseModel):
    assessment_id: str
    model_version: str
    config_version: str
    habitat_risk_score: float
    mobility_score: float
    case_score: float
    combined_risk_score: float
    heatmap: HeatmapResponse
    data_sources: DataSourcesResponse
    explanation: dict | None
    latency_ms: int
