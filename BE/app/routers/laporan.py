import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel

from app.database import get_session
from app.models.laporan import Laporan
from app.models.pcam import RiwayatRisiko
from app.models.user import User
from app.services.auth import get_current_kader
from app.schemas import LaporRequest, LaporanResponse, LaporanDetailResponse, TindakanRequest
from app.services import predict_risk, reverse_geocode
from app.services.smoothing import (
    ema_smooth, skor_ke_kategori, batasi_lompatan,
    simpan_riwayat, hitung_n_laporan, cek_cluster_darurat,
)
from app.routers.notifications import trigger_notifikasi
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api", tags=["laporan"])


def generate_kode() -> str:
    import datetime
    now = datetime.datetime.utcnow()
    return f"MW-{now.year}-{uuid.uuid4().hex[:6].upper()}"


@router.post("/lapor", response_model=LaporanResponse)
async def submit_laporan(
    persentase_lumut: float = Form(...),
    persentase_vegetasi: float = Form(...),
    air_tenang: str = Form(...),
    paparan_matahari: str = Form(...),
    luas_genangan_m2: float = Form(...),
    curah_hujan_30_hari_mm: float = Form(...),
    jarak_hutan_m: float = Form(...),
    jarak_sawah_m: float = Form(...),
    jarak_sungai_m: float = Form(...),
    jarak_rawa_m: float = Form(...),
    jarak_tambang_m: float = Form(...),
    jarak_permukiman_m: float = Form(...),
    jarak_puskesmas_m: float = Form(...),
    pendatang_30_hari: int = Form(...),
    pendatang_dari_endemis: int = Form(...),
    pekerja_mobil: int = Form(...),
    riwayat_perjalanan_endemis: int = Form(...),
    kasus_malaria_1km_30hari: int = Form(default=0),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    foto: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
):
    habitat_input = {
        "Persentase_Lumut": persentase_lumut,
        "Persentase_Vegetasi": persentase_vegetasi,
        "Air_Tenang": air_tenang,
        "Paparan_Matahari": paparan_matahari,
        "Luas_Genangan_m2": luas_genangan_m2,
        "Curah_Hujan_30_Hari_mm": curah_hujan_30_hari_mm,
        "Jarak_Hutan_m": jarak_hutan_m,
        "Jarak_Sawah_m": jarak_sawah_m,
        "Jarak_Sungai_m": jarak_sungai_m,
        "Jarak_Rawa_m": jarak_rawa_m,
        "Jarak_Tambang_m": jarak_tambang_m,
        "Jarak_Permukiman_m": jarak_permukiman_m,
        "Jarak_Puskesmas_m": jarak_puskesmas_m,
    }
    mobility_input = {
        "Pendatang_30_Hari": pendatang_30_hari,
        "Pendatang_Dari_Endemis": pendatang_dari_endemis,
        "Pekerja_Mobil": pekerja_mobil,
        "Riwayat_Perjalanan_Endemis": riwayat_perjalanan_endemis,
    }

    risk = predict_risk(habitat_input, mobility_input, kasus_malaria_1km_30hari)

    foto_path = None
    if foto and foto.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(foto.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        content = await foto.read()
        with open(filepath, "wb") as f:
            f.write(content)
        foto_path = f"/uploads/{filename}"

    alamat = None
    if lat is not None and lng is not None:
        alamat = await reverse_geocode(lat, lng)

    grid_id = None
    if lat is not None and lng is not None:
        gx = int(abs(lat) * 100) % 100
        gy = int(abs(lng) * 100) % 100
        grid_id = f"AREA-{gx:02d}{gy:02d}"

    laporan = Laporan(
        kode_laporan=generate_kode(),
        status="menunggu",
        lat=lat,
        lng=lng,
        grid_id=grid_id,
        alamat=alamat,
        foto_path=foto_path,
        persentase_lumut=persentase_lumut,
        persentase_vegetasi=persentase_vegetasi,
        air_tenang=air_tenang,
        paparan_matahari=paparan_matahari,
        luas_genangan_m2=luas_genangan_m2,
        curah_hujan_30_hari_mm=curah_hujan_30_hari_mm,
        jarak_hutan_m=jarak_hutan_m,
        jarak_sawah_m=jarak_sawah_m,
        jarak_sungai_m=jarak_sungai_m,
        jarak_rawa_m=jarak_rawa_m,
        jarak_tambang_m=jarak_tambang_m,
        jarak_permukiman_m=jarak_permukiman_m,
        jarak_puskesmas_m=jarak_puskesmas_m,
        pendatang_30_hari=pendatang_30_hari,
        pendatang_dari_endemis=pendatang_dari_endemis,
        pekerja_mobil=pekerja_mobil,
        riwayat_perjalanan_endemis=riwayat_perjalanan_endemis,
        kasus_malaria_1km_30hari=kasus_malaria_1km_30hari,
        habitat_risk_score=risk["habitat_risk_score"],
        habitat_category=risk["habitat_category"],
        mobility_risk_score=risk["mobility_risk_score"],
        case_score=risk["case_score"],
        risiko_gabungan=risk["risiko_gabungan"],
        heatmap_category=risk["heatmap_category"],
    )

    session.add(laporan)
    session.commit()
    session.refresh(laporan)
    return laporan


@router.get("/laporan", response_model=list[LaporanResponse])
async def list_laporan(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(Laporan)
    if status:
        stmt = stmt.where(Laporan.status == status)
    stmt = stmt.order_by(Laporan.created_at.desc()).offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.get("/laporan/{kode_laporan}", response_model=LaporanDetailResponse)
async def get_laporan_detail(kode_laporan: str, session: Session = Depends(get_session)):
    stmt = select(Laporan).where(Laporan.kode_laporan == kode_laporan)
    laporan = session.exec(stmt).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    return laporan


@router.post("/laporan/{kode_laporan}/tindakan", response_model=LaporanResponse)
async def update_tindakan(
    kode_laporan: str,
    body: TindakanRequest,
    session: Session = Depends(get_session),
    kader: User = Depends(get_current_kader),
):
    import datetime

    stmt = select(Laporan).where(Laporan.kode_laporan == kode_laporan)
    laporan = session.exec(stmt).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    laporan.tindakan = body.tindakan
    laporan.diverifikasi_oleh = body.diverifikasi_oleh
    laporan.status = "ditindaklanjuti"
    laporan.ditindaklanjuti_pada = datetime.datetime.utcnow()
    session.add(laporan)
    session.commit()
    session.refresh(laporan)
    return laporan


class VerifyRequest(BaseModel):
    diverifikasi_oleh: Optional[str] = None


@router.post("/laporan/{kode_laporan}/verify", response_model=LaporanResponse)
async def verify_laporan(
    kode_laporan: str,
    body: VerifyRequest,
    session: Session = Depends(get_session),
    kader: User = Depends(get_current_kader),
):
    stmt = select(Laporan).where(Laporan.kode_laporan == kode_laporan)
    laporan = session.exec(stmt).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if laporan.grid_id is None and laporan.lat and laporan.lng:
        gx = int(abs(laporan.lat) * 100) % 100
        gy = int(abs(laporan.lng) * 100) % 100
        laporan.grid_id = f"AREA-{gx:02d}{gy:02d}"

    grid_id = laporan.grid_id or laporan.kode_laporan

    riwayat_terakhir = session.exec(
        select(RiwayatRisiko)
        .where(RiwayatRisiko.grid_id == grid_id)
        .order_by(RiwayatRisiko.timestamp.desc())
    ).first()

    skor_lama = riwayat_terakhir.skor if riwayat_terakhir else None
    kategori_lama = riwayat_terakhir.kategori if riwayat_terakhir else None

    n = hitung_n_laporan(session, grid_id)
    skor_smoothed = ema_smooth(laporan.risiko_gabungan or 50, skor_lama, n)
    kategori_raw = skor_ke_kategori(skor_smoothed)
    cluster = cek_cluster_darurat(session, grid_id)
    kategori_final = batasi_lompatan(kategori_lama, kategori_raw, cluster)

    simpan_riwayat(
        session, grid_id, skor_smoothed, kategori_final,
        sumber=f"Verifikasi: {kode_laporan}",
        detail=f"diverifikasi oleh {body.diverifikasi_oleh or 'kader'}, n={n}",
    )

    from app.services.smoothing import kategori_naik
    if kategori_naik(kategori_lama, kategori_final):
        trigger_notifikasi(session, grid_id, kategori_lama, kategori_final, f"Verifikasi: {kode_laporan}")

    laporan.status = "terverifikasi"
    laporan.diverifikasi_oleh = body.diverifikasi_oleh
    session.add(laporan)
    session.commit()
    session.refresh(laporan)
    return laporan
