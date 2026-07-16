import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class Laporan(SQLModel, table=True):
    __tablename__ = "laporan"

    id: Optional[int] = Field(default=None, primary_key=True)
    kode_laporan: str = Field(index=True, unique=True, max_length=32)
    status: str = Field(default="menunggu", max_length=32)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    lat: Optional[float] = None
    lng: Optional[float] = None
    grid_id: Optional[str] = Field(default=None, index=True, max_length=32)
    alamat: Optional[str] = None
    
    grid_x: Optional[int] = None
    grid_y: Optional[int] = None
    grid_land: Optional[str] = None

    foto_path: Optional[str] = None

    persentase_lumut: Optional[float] = None
    persentase_vegetasi: Optional[float] = None
    air_tenang: Optional[str] = None
    paparan_matahari: Optional[str] = None
    luas_genangan_m2: Optional[float] = None
    curah_hujan_30_hari_mm: Optional[float] = None
    jarak_hutan_m: Optional[float] = None
    jarak_sawah_m: Optional[float] = None
    jarak_sungai_m: Optional[float] = None
    jarak_rawa_m: Optional[float] = None
    jarak_tambang_m: Optional[float] = None
    jarak_permukiman_m: Optional[float] = None
    jarak_puskesmas_m: Optional[float] = None

    pendatang_30_hari: Optional[int] = None
    pendatang_dari_endemis: Optional[int] = None
    pekerja_mobil: Optional[int] = None
    riwayat_perjalanan_endemis: Optional[int] = None
    kasus_malaria_1km_30hari: Optional[int] = None

    habitat_risk_score: Optional[float] = None
    habitat_category: Optional[str] = None
    mobility_risk_score: Optional[float] = None
    case_score: Optional[float] = None
    risiko_gabungan: Optional[float] = None
    heatmap_category: Optional[str] = None

    tindakan: Optional[str] = None
    ditindaklanjuti_pada: Optional[datetime.datetime] = None
    diverifikasi_oleh: Optional[str] = None
