from fastapi import APIRouter

from app.services.grid_service import (
    get_all_grids,
    get_risk_by_landcover,
    get_monthly_cases,
)

router = APIRouter(prefix="/api", tags=["grids-stats"])


@router.get("/grids/demo")
def grids_demo():
    grids = get_all_grids()
    return {
        "total_grids": len(grids),
        "grids": grids,
    }


@router.get("/stats/risk-by-landcover")
def stats_risk_by_landcover():
    return get_risk_by_landcover()


@router.get("/stats/monthly-cases")
def stats_monthly_cases():
    return get_monthly_cases()
