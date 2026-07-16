from fastapi import APIRouter, HTTPException
from app.schemas import PredictRequest, RiskScoreResponse
from app.services import predict_risk

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict", response_model=RiskScoreResponse)
async def predict(req: PredictRequest):
    habitat_input = {
        "Persentase_Lumut": req.habitat.persentase_lumut,
        "Persentase_Vegetasi": req.habitat.persentase_vegetasi,
        "Air_Tenang": req.habitat.air_tenang,
        "Paparan_Matahari": req.habitat.paparan_matahari,
        "Luas_Genangan_m2": req.habitat.luas_genangan_m2,
        "Curah_Hujan_30_Hari_mm": req.habitat.curah_hujan_30_hari_mm,
        "Jarak_Hutan_m": req.habitat.jarak_hutan_m,
        "Jarak_Sawah_m": req.habitat.jarak_sawah_m,
        "Jarak_Sungai_m": req.habitat.jarak_sungai_m,
        "Jarak_Rawa_m": req.habitat.jarak_rawa_m,
        "Jarak_Tambang_m": req.habitat.jarak_tambang_m,
        "Jarak_Permukiman_m": req.habitat.jarak_permukiman_m,
        "Jarak_Puskesmas_m": req.habitat.jarak_puskesmas_m,
    }
    mobility_input = {
        "Pendatang_30_Hari": req.mobility.pendatang_30_hari,
        "Pendatang_Dari_Endemis": req.mobility.pendatang_dari_endemis,
        "Pekerja_Mobil": req.mobility.pekerja_mobil,
        "Riwayat_Perjalanan_Endemis": req.mobility.riwayat_perjalanan_endemis,
    }

    result = predict_risk(habitat_input, mobility_input, req.kasus_radius_1km)
    return RiskScoreResponse(**result)
