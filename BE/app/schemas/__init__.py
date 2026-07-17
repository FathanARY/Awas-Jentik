from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class HabitatInput(BaseModel):
    persentase_lumut: float = Field(ge=0, le=100)
    persentase_vegetasi: float = Field(ge=0, le=100)
    air_tenang: str
    paparan_matahari: str
    luas_genangan_m2: float = Field(ge=0)
    curah_hujan_30_hari_mm: float = Field(ge=0)
    jarak_hutan_m: float = Field(ge=0)
    jarak_sawah_m: float = Field(ge=0)
    jarak_sungai_m: float = Field(ge=0)
    jarak_rawa_m: float = Field(ge=0)
    jarak_tambang_m: float = Field(ge=0)
    jarak_permukiman_m: float = Field(ge=0)
    jarak_puskesmas_m: float = Field(ge=0)


class MobilityInput(BaseModel):
    pendatang_30_hari: int = Field(ge=0)
    pendatang_dari_endemis: int = Field(ge=0)
    pekerja_mobil: int = Field(ge=0)
    riwayat_perjalanan_endemis: int = Field(ge=0)


class LaporRequest(BaseModel):
    habitat: HabitatInput
    mobility: MobilityInput
    kasus_malaria_1km_30hari: int = Field(default=0, ge=0)
    lat: Optional[float] = None
    lng: Optional[float] = None
    grid_x: Optional[int] = None
    grid_y: Optional[int] = None
    grid_land: Optional[str] = None


class PredictRequest(BaseModel):
    habitat: HabitatInput
    mobility: MobilityInput
    kasus_radius_1km: int = Field(default=0, ge=0)


class RiskScoreResponse(BaseModel):
    habitat_risk_score: float
    habitat_category: str
    mobility_risk_score: float
    case_score: float
    risiko_gabungan: float
    heatmap_category: str
    heatmap_level: int
    heatmap_color: str


class LaporanResponse(BaseModel):
    id: int
    kode_laporan: str
    status: str
    created_at: datetime
    lat: Optional[float] = None
    lng: Optional[float] = None
    alamat: Optional[str] = None
    foto_path: Optional[str] = None
    grid_x: Optional[int] = None
    grid_y: Optional[int] = None
    grid_land: Optional[str] = None
    habitat_risk_score: Optional[float] = None
    habitat_category: Optional[str] = None
    mobility_risk_score: Optional[float] = None
    case_score: Optional[float] = None
    risiko_gabungan: Optional[float] = None
    heatmap_category: Optional[str] = None
    heatmap_level: Optional[int] = None
    heatmap_color: Optional[str] = None
    tindakan: Optional[str] = None
    ditindaklanjuti_pada: Optional[datetime] = None


class LaporanDetailResponse(LaporanResponse):
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


class TindakanRequest(BaseModel):
    tindakan: str = Field(..., min_length=1)
    diverifikasi_oleh: Optional[str] = None


class AreaResponse(BaseModel):
    id: str
    name: str
    region: str
    score: float
    level: str
    reports: int


class StatsResponse(BaseModel):
    total_laporan: int
    laporan_menunggu: int
    laporan_ditindaklanjuti: int
    rata_rata_risiko: float


class CsvPreviewRow(BaseModel):
    grid_id: str
    pendatang_30_hari: int
    pendatang_dari_endemis: int
    pekerja_mobil: int
    riwayat_perjalanan_endemis: int
    valid: bool = True
    error: Optional[str] = None


class CsvPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    rows: list[CsvPreviewRow]
    summary: str


class CsvUploadResponse(BaseModel):
    status: str
    total_rows: int
    rows_updated: int
    categories_changed: int


class ChangeItem(BaseModel):
    grid_id: str
    timestamp: datetime
    skor_lama: float
    skor_baru: float
    kategori_lama: str
    kategori_baru: str
    sumber_perubahan: str


class ChangesResponse(BaseModel):
    changes: list[ChangeItem]
    total: int


class StaleAreaItem(BaseModel):
    grid_id: str
    last_updated: Optional[datetime]
    days_stale: int
    current_skor: Optional[float]
    current_kategori: Optional[str]


class GridRiskResponse(BaseModel):
    grid_id: str
    skor: float
    kategori: str


class MobilitasInput(BaseModel):
    pendatang_30_hari: int = Field(ge=0)
    pendatang_dari_endemis: int = Field(ge=0)
    pekerja_mobil: int = Field(ge=0)
    riwayat_perjalanan_endemis: int = Field(ge=0)


class MobilitasResponse(BaseModel):
    grid_id: str
    pendatang_30_hari: int
    pendatang_dari_endemis: int
    pekerja_mobil: int
    riwayat_perjalanan_endemis: int
    mobility_risk_score: Optional[float] = None
    habitat_risk_score: Optional[float] = None
    case_score: Optional[float] = None
    risiko_gabungan: Optional[float] = None
    kategori: Optional[str] = None
    updated_at: datetime


class CsvStagedResponse(CsvPreviewResponse):
    upload_id: str

