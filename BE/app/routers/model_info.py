from fastapi import APIRouter

from app.services.risk_category import get_heatmap_bands, COMBINED_WEIGHTS

router = APIRouter(prefix="/api", tags=["model-info"])


@router.get("/model-info")
def model_info():
    return {
        "model_version": "v2.0",
        "combined_weights": COMBINED_WEIGHTS,
        "weights_formula": f"{COMBINED_WEIGHTS['habitat']} × Habitat + {COMBINED_WEIGHTS['mobility']} × Mobilitas + {COMBINED_WEIGHTS['case']} × Kasus",
        "heatmap_bands": get_heatmap_bands(),
    }
