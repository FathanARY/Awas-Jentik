import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.pcam import MobilitasGrid, RiwayatRisiko
from app.models.user import User
from app.services.auth import get_current_kader
from app.services.ml_service import predict_risk
from app.services.smoothing import (
    ema_smooth, skor_ke_kategori, kategori_naik, batasi_lompatan,
    simpan_riwayat, hitung_n_laporan, cek_cluster_darurat,
)
from app.routers.notifications import trigger_notifikasi
from app.schemas import MobilitasInput, MobilitasResponse

router = APIRouter(prefix="/api", tags=["mobilitas"])

HABITAT_DEFAULT = {
    "Persentase_Lumut": 50, "Persentase_Vegetasi": 50,
    "Air_Tenang": "Tidak", "Paparan_Matahari": "Sedang",
    "Luas_Genangan_m2": 20, "Curah_Hujan_30_Hari_mm": 300,
    "Jarak_Hutan_m": 200, "Jarak_Sawah_m": 500, "Jarak_Sungai_m": 500,
    "Jarak_Rawa_m": 1000, "Jarak_Tambang_m": 3000,
    "Jarak_Permukiman_m": 200, "Jarak_Puskesmas_m": 2000,
}


def _compute_and_save_risk(session: Session, grid_id: str, mobility_input: dict, sumber: str):
    risk = predict_risk(HABITAT_DEFAULT, mobility_input, kasus_radius_1km=0)

    riwayat_terakhir = session.exec(
        select(RiwayatRisiko)
        .where(RiwayatRisiko.grid_id == grid_id)
        .order_by(RiwayatRisiko.timestamp.desc())
    ).first()

    skor_lama = riwayat_terakhir.skor if riwayat_terakhir else None
    kategori_lama = riwayat_terakhir.kategori if riwayat_terakhir else None

    n = hitung_n_laporan(session, grid_id)
    skor_smoothed = ema_smooth(risk["risiko_gabungan"], skor_lama, n)
    kategori_raw = skor_ke_kategori(skor_smoothed)
    cluster = cek_cluster_darurat(session, grid_id)
    kategori_final = batasi_lompatan(kategori_lama, kategori_raw, cluster)

    simpan_riwayat(session, grid_id, skor_smoothed, kategori_final,
                   sumber=sumber, detail=f"n_laporan={n}")

    if kategori_naik(kategori_lama, kategori_final):
        trigger_notifikasi(session, grid_id, kategori_lama, kategori_final, sumber)

    return risk, skor_smoothed, kategori_final


@router.get("/mobilitas", response_model=list[MobilitasResponse])
async def list_mobilitas(session: Session = Depends(get_session)):
    rows = session.exec(select(MobilitasGrid).order_by(MobilitasGrid.updated_at.desc())).all()
    results = []
    for mg in rows:
        riwayat = session.exec(
            select(RiwayatRisiko)
            .where(RiwayatRisiko.grid_id == mg.grid_id)
            .order_by(RiwayatRisiko.timestamp.desc())
        ).first()
        results.append(MobilitasResponse(
            grid_id=mg.grid_id,
            pendatang_30_hari=mg.pendatang_30_hari,
            pendatang_dari_endemis=mg.pendatang_dari_endemis,
            pekerja_mobil=mg.pekerja_mobil,
            riwayat_perjalanan_endemis=mg.riwayat_perjalanan_endemis,
            mobility_risk_score=mg.mobility_risk_score,
            risiko_gabungan=riwayat.skor if riwayat else None,
            kategori=riwayat.kategori if riwayat else None,
            updated_at=mg.updated_at,
        ))
    return results


@router.get("/mobilitas/{grid_id}", response_model=MobilitasResponse)
async def get_mobilitas(grid_id: str, session: Session = Depends(get_session)):
    mg = session.exec(
        select(MobilitasGrid).where(MobilitasGrid.grid_id == grid_id)
    ).first()
    if not mg:
        raise HTTPException(status_code=404, detail=f"Data mobilitas untuk {grid_id} tidak ditemukan")

    riwayat = session.exec(
        select(RiwayatRisiko)
        .where(RiwayatRisiko.grid_id == grid_id)
        .order_by(RiwayatRisiko.timestamp.desc())
    ).first()

    return MobilitasResponse(
        grid_id=mg.grid_id,
        pendatang_30_hari=mg.pendatang_30_hari,
        pendatang_dari_endemis=mg.pendatang_dari_endemis,
        pekerja_mobil=mg.pekerja_mobil,
        riwayat_perjalanan_endemis=mg.riwayat_perjalanan_endemis,
        mobility_risk_score=mg.mobility_risk_score,
        risiko_gabungan=riwayat.skor if riwayat else None,
        kategori=riwayat.kategori if riwayat else None,
        updated_at=mg.updated_at,
    )


@router.post("/mobilitas/{grid_id}", response_model=MobilitasResponse)
async def upsert_mobilitas(
    grid_id: str,
    body: MobilitasInput,
    session: Session = Depends(get_session),
    kader: User = Depends(get_current_kader),
):
    mg = session.exec(
        select(MobilitasGrid).where(MobilitasGrid.grid_id == grid_id)
    ).first()

    now = datetime.datetime.utcnow()
    if mg:
        mg.pendatang_30_hari = body.pendatang_30_hari
        mg.pendatang_dari_endemis = body.pendatang_dari_endemis
        mg.pekerja_mobil = body.pekerja_mobil
        mg.riwayat_perjalanan_endemis = body.riwayat_perjalanan_endemis
        mg.updated_at = now
    else:
        mg = MobilitasGrid(
            grid_id=grid_id,
            periode_akhir=datetime.date.today(),
            pendatang_30_hari=body.pendatang_30_hari,
            pendatang_dari_endemis=body.pendatang_dari_endemis,
            pekerja_mobil=body.pekerja_mobil,
            riwayat_perjalanan_endemis=body.riwayat_perjalanan_endemis,
        )

    mobility_input = {
        "Pendatang_30_Hari": body.pendatang_30_hari,
        "Pendatang_Dari_Endemis": body.pendatang_dari_endemis,
        "Pekerja_Mobil": body.pekerja_mobil,
        "Riwayat_Perjalanan_Endemis": body.riwayat_perjalanan_endemis,
    }

    risk, skor_smoothed, kategori_final = _compute_and_save_risk(
        session, grid_id, mobility_input, f"Mobilitas: {kader.username}",
    )

    mg.mobility_risk_score = risk["mobility_risk_score"]
    session.add(mg)
    session.commit()
    session.refresh(mg)

    return MobilitasResponse(
        grid_id=mg.grid_id,
        pendatang_30_hari=mg.pendatang_30_hari,
        pendatang_dari_endemis=mg.pendatang_dari_endemis,
        pekerja_mobil=mg.pekerja_mobil,
        riwayat_perjalanan_endemis=mg.riwayat_perjalanan_endemis,
        mobility_risk_score=mg.mobility_risk_score,
        habitat_risk_score=risk["habitat_risk_score"],
        case_score=risk["case_score"],
        risiko_gabungan=skor_smoothed,
        kategori=kategori_final,
        updated_at=mg.updated_at,
    )
