import logging
from datetime import date
from typing import Optional

import httpx

from app.config import AI_ENGINE_URL, AI_ENGINE_TIMEOUT

logger = logging.getLogger(__name__)

LUMUT_MAP = [
    (0, "Tidak Ada"),
    (33, "Sedikit"),
    (66, "Sedang"),
    (100, "Banyak"),
]

VEGETASI_MAP = [
    (33, "Jarang"),
    (66, "Sedang"),
    (100, "Lebat"),
]

MOBILITY_THRESHOLDS = [
    (3, "Sangat Rendah"),
    (6, "Rendah"),
    (12, "Sedang"),
    (20, "Tinggi"),
    (float("inf"), "Sangat Tinggi"),
]


def _map_lumut(pct: float) -> str:
    for threshold, label in LUMUT_MAP:
        if pct <= threshold:
            return label
    return "Banyak"


def _map_vegetasi(pct: float) -> str:
    for threshold, label in VEGETASI_MAP:
        if pct <= threshold:
            return label
    return "Lebat"


def _map_mobility_level(mobility_input: dict) -> str:
    total = sum(int(v) for v in mobility_input.values())
    for threshold, label in MOBILITY_THRESHOLDS:
        if total <= threshold:
            return label
    return "Sangat Tinggi"


def _map_air_tenang(value: str) -> bool:
    return value.strip().lower() in ("ya", "true", "1", "yes")


def build_ai_engine_payload(
    grid_id: str,
    habitat_input: dict,
    mobility_input: dict,
    include_explanation: bool = False,
) -> dict:
    return {
        "grid_id": grid_id,
        "observed_at": date.today().isoformat(),
        "lumut_level": _map_lumut(float(habitat_input.get("Persentase_Lumut", 0))),
        "vegetasi_level": _map_vegetasi(float(habitat_input.get("Persentase_Vegetasi", 0))),
        "air_tenang": _map_air_tenang(habitat_input.get("Air_Tenang", "Tidak")),
        "paparan_matahari": habitat_input.get("Paparan_Matahari", "Sedang"),
        "luas_genangan_m2": float(habitat_input.get("Luas_Genangan_m2", 0)),
        "mobility_level": _map_mobility_level(mobility_input),
        "include_explanation": include_explanation,
    }


def map_ai_engine_response(response: dict) -> dict:
    habitat_score = float(response.get("habitat_risk_score", 0))
    mobility_score = float(response.get("mobility_score", 0))
    case_score = float(response.get("case_score", 0))
    combined = float(response.get("combined_risk_score", 0))
    heatmap = response.get("heatmap", {})

    from app.services.risk_category import get_heatmap
    habitat_heatmap = get_heatmap(habitat_score)
    combined_heatmap = get_heatmap(combined)

    return {
        "habitat_risk_score": round(habitat_score, 1),
        "habitat_category": habitat_heatmap["category"],
        "mobility_risk_score": round(mobility_score, 1),
        "case_score": round(case_score, 1),
        "risiko_gabungan": round(combined, 1),
        "heatmap_category": combined_heatmap["category"],
        "heatmap_level": combined_heatmap["level_index"],
        "heatmap_color": combined_heatmap["color"],
        "_ai_engine": {
            "assessment_id": response.get("assessment_id", ""),
            "model_version": response.get("model_version", ""),
            "latency_ms": response.get("latency_ms", 0),
            "explanation": response.get("explanation"),
        },
    }


async def predict_via_ai_engine(
    grid_id: str,
    habitat_input: dict,
    mobility_input: dict,
    include_explanation: bool = False,
) -> Optional[dict]:
    if not AI_ENGINE_URL:
        return None

    payload = build_ai_engine_payload(
        grid_id=grid_id,
        habitat_input=habitat_input,
        mobility_input=mobility_input,
        include_explanation=include_explanation,
    )

    try:
        async with httpx.AsyncClient(timeout=AI_ENGINE_TIMEOUT) as client:
            res = await client.post(
                f"{AI_ENGINE_URL.rstrip('/')}/v1/risk-assessments",
                json=payload,
            )
            res.raise_for_status()
            return map_ai_engine_response(res.json())
    except httpx.TimeoutException:
        logger.warning(f"AI Engine timeout for grid {grid_id}")
        return None
    except httpx.HTTPStatusError as e:
        logger.warning(f"AI Engine HTTP {e.response.status_code} for grid {grid_id}: {e.response.text[:200]}")
        return None
    except Exception as e:
        logger.warning(f"AI Engine unavailable for grid {grid_id}: {e}")
        return None
