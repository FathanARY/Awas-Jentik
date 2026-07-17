import csv
import datetime
import io
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional

from app.database import get_session
from app.models.pcam import MobilitasGrid, RiwayatRisiko, CsvUploadLog
from app.models.user import User
from app.services.auth import get_current_admin
from app.services.ml_service import predict_risk
from app.services.smoothing import (
    ema_smooth, skor_ke_kategori, kategori_naik, batasi_lompatan,
    simpan_riwayat, hitung_n_laporan, cek_cluster_darurat,
)
from app.routers.notifications import trigger_notifikasi
from app.schemas import (
    CsvPreviewRow, CsvPreviewResponse, CsvStagedResponse, CsvUploadResponse,
    ChangeItem, ChangesResponse, StaleAreaItem,
)

router = APIRouter(prefix="/api", tags=["pcem"])

_staging_store: dict[str, dict] = {}

CSV_COLUMNS = [
    "Grid_ID", "Periode_Akhir", "Pendatang_30_Hari",
    "Pendatang_Dari_Endemis", "Pekerja_Mobil", "Riwayat_Perjalanan_Endemis",
]


def validate_csv_content(content: str) -> list[CsvPreviewRow]:
    reader = csv.DictReader(io.StringIO(content))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV kosong atau tidak memiliki header")

    missing = [c for c in CSV_COLUMNS if c not in reader.fieldnames]
    if missing:
        raise HTTPException(status_code=400, detail=f"Kolom tidak lengkap: {missing}. Format: {CSV_COLUMNS}")

    rows: list[CsvPreviewRow] = []
    for i, row in enumerate(reader):
        errors = []
        grid_id = row.get("Grid_ID", "").strip()
        if not grid_id:
            errors.append("Grid_ID kosong")

        try:
            pendatang = int(row.get("Pendatang_30_Hari", "0"))
            endemis = int(row.get("Pendatang_Dari_Endemis", "0"))
            pekerja = int(row.get("Pekerja_Mobil", "0"))
            riwayat = int(row.get("Riwayat_Perjalanan_Endemis", "0"))
        except ValueError:
            errors.append("Nilai numerik tidak valid")

        negatif = []
        if pendatang < 0: negatif.append("Pendatang_30_Hari")
        if endemis < 0: negatif.append("Pendatang_Dari_Endemis")
        if pekerja < 0: negatif.append("Pekerja_Mobil")
        if riwayat < 0: negatif.append("Riwayat_Perjalanan_Endemis")
        if negatif:
            errors.append(f"Nilai negatif: {negatif}")

        if pendatang < endemis:
            errors.append("Pendatang_Dari_Endemis > Pendatang_30_Hari")

        try:
            datetime.date.fromisoformat(row.get("Periode_Akhir", "").strip())
        except ValueError:
            errors.append("Periode_Akhir bukan format YYYY-MM-DD")

        rows.append(CsvPreviewRow(
            grid_id=grid_id,
            pendatang_30_hari=pendatang if not errors else 0,
            pendatang_dari_endemis=endemis if not errors else 0,
            pekerja_mobil=pekerja if not errors else 0,
            riwayat_perjalanan_endemis=riwayat if not errors else 0,
            valid=len(errors) == 0,
            error="; ".join(errors) if errors else None,
        ))

    return rows


@router.post("/upload-csv/preview", response_model=CsvStagedResponse)
async def preview_csv(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File harus berformat .csv")

    content = (await file.read()).decode("utf-8")
    rows = validate_csv_content(content)
    valid = sum(1 for r in rows if r.valid)
    invalid = len(rows) - valid

    changes = sum(1 for r in rows if r.valid)

    upload_id = uuid.uuid4().hex[:12]
    _staging_store[upload_id] = {
        "valid_rows": [r for r in rows if r.valid],
        "all_rows": rows,
        "filename": file.filename,
        "total": len(rows),
    }

    return CsvStagedResponse(
        upload_id=upload_id,
        total_rows=len(rows),
        valid_rows=valid,
        invalid_rows=invalid,
        rows=rows,
        summary=f"{valid} baris valid akan diperbarui. {changes} grid akan dianalisis ulang.",
    )


def _process_csv_rows(session: Session, valid_rows: list, filename: str) -> tuple[int, int]:
    categories_changed = 0
    updated = 0

    for row in valid_rows:
        existing = session.exec(
            select(MobilitasGrid).where(MobilitasGrid.grid_id == row.grid_id)
        ).first()

        if existing:
            existing.pendatang_30_hari = row.pendatang_30_hari
            existing.pendatang_dari_endemis = row.pendatang_dari_endemis
            existing.pekerja_mobil = row.pekerja_mobil
            existing.riwayat_perjalanan_endemis = row.riwayat_perjalanan_endemis
            existing.updated_at = datetime.datetime.utcnow()
            session.add(existing)
        else:
            entry = MobilitasGrid(
                grid_id=row.grid_id,
                periode_akhir=datetime.date.today(),
                pendatang_30_hari=row.pendatang_30_hari,
                pendatang_dari_endemis=row.pendatang_dari_endemis,
                pekerja_mobil=row.pekerja_mobil,
                riwayat_perjalanan_endemis=row.riwayat_perjalanan_endemis,
            )
            session.add(entry)

        mobility_input = {
            "Pendatang_30_Hari": row.pendatang_30_hari,
            "Pendatang_Dari_Endemis": row.pendatang_dari_endemis,
            "Pekerja_Mobil": row.pekerja_mobil,
            "Riwayat_Perjalanan_Endemis": row.riwayat_perjalanan_endemis,
        }
        habitat_default = {
            "Persentase_Lumut": 50, "Persentase_Vegetasi": 50,
            "Air_Tenang": "Tidak", "Paparan_Matahari": "Sedang",
            "Luas_Genangan_m2": 20, "Curah_Hujan_30_Hari_mm": 300,
            "Jarak_Hutan_m": 200, "Jarak_Sawah_m": 500, "Jarak_Sungai_m": 500,
            "Jarak_Rawa_m": 1000, "Jarak_Tambang_m": 3000,
            "Jarak_Permukiman_m": 200, "Jarak_Puskesmas_m": 2000,
        }
        risk = predict_risk(habitat_default, mobility_input, kasus_radius_1km=0)

        riwayat_terakhir = session.exec(
            select(RiwayatRisiko)
            .where(RiwayatRisiko.grid_id == row.grid_id)
            .order_by(RiwayatRisiko.timestamp.desc())
        ).first()

        skor_lama = riwayat_terakhir.skor if riwayat_terakhir else None
        kategori_lama = riwayat_terakhir.kategori if riwayat_terakhir else None

        n = hitung_n_laporan(session, row.grid_id)
        skor_smoothed = ema_smooth(risk["risiko_gabungan"], skor_lama, n)
        kategori_raw = skor_ke_kategori(skor_smoothed)
        cluster = cek_cluster_darurat(session, row.grid_id)
        kategori_final = batasi_lompatan(kategori_lama, kategori_raw, cluster)

        simpan_riwayat(session, row.grid_id, skor_smoothed, kategori_final,
                       sumber=f"CSV: {filename}",
                       detail=f"n_laporan={n}")

        if kategori_naik(kategori_lama, kategori_final):
            categories_changed += 1
            trigger_notifikasi(session, row.grid_id, kategori_lama, kategori_final, f"CSV: {filename}")

        updated += 1

    return updated, categories_changed


@router.post("/upload-csv/{upload_id}/confirm", response_model=CsvUploadResponse)
async def confirm_csv(
    upload_id: str,
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin),
):
    staged = _staging_store.pop(upload_id, None)
    if not staged:
        raise HTTPException(status_code=404, detail="Upload ID tidak ditemukan atau sudah kadaluarsa")

    valid_rows = staged["valid_rows"]
    all_rows = staged["all_rows"]
    filename = staged["filename"] or "unknown.csv"

    updated, categories_changed = _process_csv_rows(session, valid_rows, filename)

    log = CsvUploadLog(
        filename=filename,
        total_rows=staged["total"],
        rows_updated=updated,
        rows_valid=len(valid_rows),
        rows_invalid=len(all_rows) - len(valid_rows),
        status="committed",
    )
    session.add(log)
    session.commit()

    return CsvUploadResponse(
        status="committed",
        total_rows=staged["total"],
        rows_updated=updated,
        categories_changed=categories_changed,
    )


@router.post("/upload-csv/{upload_id}/cancel")
async def cancel_csv(
    upload_id: str,
    admin: User = Depends(get_current_admin),
):
    if upload_id in _staging_store:
        del _staging_store[upload_id]
        return {"status": "cancelled", "upload_id": upload_id}
    raise HTTPException(status_code=404, detail="Upload ID tidak ditemukan atau sudah kadaluarsa")



@router.get("/changes", response_model=ChangesResponse)
async def get_changes(
    limit: int = Query(default=20, le=100),
    session: Session = Depends(get_session),
):
    all_grids = session.exec(
        select(RiwayatRisiko.grid_id).distinct()
    ).all()

    changes: list[ChangeItem] = []
    for grid_id in all_grids:
        riwayat = session.exec(
            select(RiwayatRisiko)
            .where(RiwayatRisiko.grid_id == grid_id)
            .order_by(RiwayatRisiko.timestamp.desc())
            .limit(2)
        ).all()

        if len(riwayat) >= 2:
            baru, lama = riwayat[0], riwayat[1]
            if baru.kategori != lama.kategori:
                changes.append(ChangeItem(
                    grid_id=grid_id,
                    timestamp=baru.timestamp,
                    skor_lama=lama.skor,
                    skor_baru=baru.skor,
                    kategori_lama=lama.kategori,
                    kategori_baru=baru.kategori,
                    sumber_perubahan=baru.sumber_perubahan,
                ))
        elif len(riwayat) == 1:
            baru = riwayat[0]
            if baru.kategori != "Sangat Rendah":
                changes.append(ChangeItem(
                    grid_id=grid_id,
                    timestamp=baru.timestamp,
                    skor_lama=0.0,
                    skor_baru=baru.skor,
                    kategori_lama="Sangat Rendah",
                    kategori_baru=baru.kategori,
                    sumber_perubahan=baru.sumber_perubahan,
                ))

    from app.models.laporan import Laporan
    from app.services.smoothing import skor_ke_kategori

    laporans = session.exec(
        select(Laporan).where(Laporan.lat != None, Laporan.lng != None, Laporan.risiko_gabungan != None)
    ).all()

    laporan_grids = {}
    for l in laporans:
        if l.lat and l.lng:
            gx = int(abs(l.lat) * 100) % 100
            gy = int(abs(l.lng) * 100) % 100
            gid = f"AREA-{gx:02d}{gy:02d}"
            if gid not in all_grids:
                if gid not in laporan_grids or l.created_at > laporan_grids[gid].created_at:
                    laporan_grids[gid] = l

    for gid, l in laporan_grids.items():
        kategori_baru = l.heatmap_category or skor_ke_kategori(l.risiko_gabungan or 0)
        if kategori_baru != "Sangat Rendah":
            changes.append(ChangeItem(
                grid_id=gid,
                timestamp=l.created_at,
                skor_lama=0.0,
                skor_baru=l.risiko_gabungan or 0.0,
                kategori_lama="Sangat Rendah",
                kategori_baru=kategori_baru,
                sumber_perubahan=f"Laporan Baru: {l.kode_laporan}",
            ))

    changes.sort(key=lambda c: c.timestamp, reverse=True)
    return ChangesResponse(changes=changes[:limit], total=len(changes))


@router.get("/areas/stale", response_model=list[StaleAreaItem])
async def get_stale_areas(
    days: int = Query(default=60),
    session: Session = Depends(get_session),
):
    all_grids = session.exec(
        select(RiwayatRisiko.grid_id).distinct()
    ).all()

    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    stale: list[StaleAreaItem] = []

    for grid_id in all_grids:
        terakhir = session.exec(
            select(RiwayatRisiko)
            .where(RiwayatRisiko.grid_id == grid_id)
            .order_by(RiwayatRisiko.timestamp.desc())
        ).first()

        if terakhir and terakhir.timestamp < cutoff:
            days_ago = (datetime.datetime.utcnow() - terakhir.timestamp).days
            stale.append(StaleAreaItem(
                grid_id=grid_id,
                last_updated=terakhir.timestamp,
                days_stale=days_ago,
                current_skor=terakhir.skor,
                current_kategori=terakhir.kategori,
            ))

    return stale
