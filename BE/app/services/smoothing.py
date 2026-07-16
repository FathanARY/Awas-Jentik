import datetime
from typing import Optional
from sqlmodel import Session, select, func
from app.models.pcam import RiwayatRisiko

KATEGORI_MAP = [
    (0, "Sangat Rendah"),
    (25, "Rendah"),
    (50, "Sedang"),
    (75, "Tinggi"),
]


def hitung_alpha(n_laporan: int) -> float:
    return max(0.1, 1.0 / (n_laporan + 1))


def skor_ke_kategori(skor: float) -> str:
    for threshold, label in reversed(KATEGORI_MAP):
        if skor >= threshold:
            return label
    return "Sangat Rendah"


def ema_smooth(skor_baru: float, skor_lama: Optional[float], n_laporan: int) -> float:
    if skor_lama is None:
        return skor_baru
    alpha = hitung_alpha(n_laporan)
    return alpha * skor_baru + (1 - alpha) * skor_lama


def kategori_naik(kategori_lama: Optional[str], kategori_baru: str) -> bool:
    if kategori_lama is None:
        return True
    order = {k: i for i, (_, k) in enumerate(KATEGORI_MAP)}
    return order.get(kategori_baru, 0) > order.get(kategori_lama, 0)


def batasi_lompatan(kategori_lama: Optional[str], kategori_baru: str, cluster_darurat: bool = False) -> str:
    if cluster_darurat:
        return kategori_baru
    if kategori_lama is None:
        return kategori_baru
    order = {k: i for i, (_, k) in enumerate(KATEGORI_MAP)}
    idx_lama = order.get(kategori_lama, 0)
    idx_baru = order.get(kategori_baru, 0)
    if idx_baru - idx_lama > 1:
        return KATEGORI_MAP[idx_lama + 1][1]
    return kategori_baru


def simpan_riwayat(
    session: Session,
    grid_id: str,
    skor: float,
    kategori: str,
    sumber: str,
    detail: Optional[str] = None,
):
    record = RiwayatRisiko(
        grid_id=grid_id,
        skor=skor,
        kategori=kategori,
        sumber_perubahan=sumber,
        detail=detail,
    )
    session.add(record)


def hitung_n_laporan(session: Session, grid_id: str) -> int:
    from app.models.laporan import Laporan
    count = session.exec(
        select(func.count(Laporan.id))
    ).one()
    return count


def cek_cluster_darurat(session: Session, grid_id: str) -> bool:
    from app.models.laporan import Laporan
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    count = session.exec(
        select(func.count(Laporan.id)).where(
            Laporan.risiko_gabungan >= 75,
            Laporan.created_at >= cutoff,
        )
    ).one()
    return count >= 3
