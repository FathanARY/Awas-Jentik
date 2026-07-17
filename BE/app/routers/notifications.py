from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional

from app.database import get_session
from app.models.notification import Notification
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api", tags=["notifications"])


def trigger_notifikasi(session: Session, grid_id: str, kategori_lama: Optional[str], kategori_baru: str, sumber: str):
    order = {"Sangat Rendah": 0, "Rendah": 1, "Sedang": 2, "Tinggi": 3}
    idx_lama = order.get(kategori_lama or "Sangat Rendah", 0)
    idx_baru = order.get(kategori_baru, 0)

    if idx_baru <= idx_lama:
        return

    rekomendasi = {
        "Sangat Rendah": "Area ini saat ini berisiko rendah. Tetap pantau secara berkala.",
        "Rendah": "Ada potensi breeding site. Pertimbangkan untuk menguras atau menutup genangan.",
        "Sedang": "Risiko sedang terdeteksi. Hubungi kader kesehatan desa untuk tindak lanjut.",
        "Tinggi": "RISIKO TINGGI. Segera laporkan ke Puskesmas dan hindari area genangan.",
    }

    naik_dari = f"dari {kategori_lama} " if kategori_lama else ""
    message = (
        f"Risiko area {grid_id} naik {naik_dari}ke {kategori_baru}. "
        f"{rekomendasi.get(kategori_baru, '')} "
        f"Sumber: {sumber}"
    )

    notif = Notification(
        grid_id=grid_id,
        message=message.strip(),
        tipe="peringatan" if idx_baru >= 3 else "info",
        user_id=None,
    )
    session.add(notif)


@router.get("/notifications")
def list_notifications(
    limit: int = 20,
    user: Optional[User] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    stmt = select(Notification).order_by(Notification.created_at.desc()).limit(limit)
    return session.exec(stmt).all()


@router.post("/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    user: Optional[User] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    notif = session.get(Notification, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
    notif.dibaca = True
    session.add(notif)
    session.commit()
    return {"status": "ok"}


@router.get("/notifications/unread/count")
def unread_count(
    user: Optional[User] = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    from sqlmodel import func
    count = session.exec(
        select(func.count(Notification.id)).where(Notification.dibaca == False)
    ).one()
    return {"count": count}
