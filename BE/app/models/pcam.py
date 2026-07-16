import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class MobilitasGrid(SQLModel, table=True):
    __tablename__ = "mobilitas_grid"

    id: Optional[int] = Field(default=None, primary_key=True)
    grid_id: str = Field(index=True, unique=True, max_length=32)
    periode_akhir: datetime.date
    pendatang_30_hari: int = Field(ge=0)
    pendatang_dari_endemis: int = Field(ge=0)
    pekerja_mobil: int = Field(ge=0)
    riwayat_perjalanan_endemis: int = Field(ge=0)

    mobility_risk_score: Optional[float] = None
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)


class RiwayatRisiko(SQLModel, table=True):
    __tablename__ = "riwayat_risiko"

    id: Optional[int] = Field(default=None, primary_key=True)
    grid_id: str = Field(index=True, max_length=32)
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    skor: float
    kategori: str = Field(max_length=32)
    sumber_perubahan: str = Field(max_length=64)
    detail: Optional[str] = None


class CsvUploadLog(SQLModel, table=True):
    __tablename__ = "csv_upload_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    uploaded_by: str = Field(default="admin", max_length=64)
    uploaded_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    filename: str
    total_rows: int
    rows_updated: int
    rows_valid: int
    rows_invalid: int
    status: str = Field(max_length=16)
