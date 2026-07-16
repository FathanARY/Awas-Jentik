from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.database import get_session
from app.models.laporan import Laporan
from app.schemas import AreaResponse, StatsResponse

router = APIRouter(prefix="/api", tags=["dashboard"])


PRIORITY_AREAS = [
    {
        "id": "MW-2023-089",
        "name": "Kab. Asmat",
        "region": "Papua Selatan",
        "score": 92,
        "level": "Kritis",
        "reports": 45,
    },
    {
        "id": "MW-2023-090",
        "name": "Kab. Mimika",
        "region": "Papua Tengah",
        "score": 85,
        "level": "Tinggi",
        "reports": 32,
    },
    {
        "id": "MW-2023-091",
        "name": "Kab. Sumba Timur",
        "region": "Nusa Tenggara Timur",
        "score": 68,
        "level": "Sedang",
        "reports": 12,
    },
]


@router.get("/areas", response_model=list[AreaResponse])
async def list_areas():
    return [AreaResponse(**a) for a in PRIORITY_AREAS]


@router.get("/stats", response_model=StatsResponse)
async def get_stats(session: Session = Depends(get_session)):
    total = session.exec(select(func.count(Laporan.id))).one()
    menunggu = session.exec(
        select(func.count(Laporan.id)).where(Laporan.status == "menunggu")
    ).one()
    ditindaklanjuti = session.exec(
        select(func.count(Laporan.id)).where(Laporan.status == "ditindaklanjuti")
    ).one()
    avg_risk = session.exec(
        select(func.avg(Laporan.risiko_gabungan))
    ).one()

    return StatsResponse(
        total_laporan=total,
        laporan_menunggu=menunggu,
        laporan_ditindaklanjuti=ditindaklanjuti,
        rata_rata_risiko=round(avg_risk or 0, 1),
    )
