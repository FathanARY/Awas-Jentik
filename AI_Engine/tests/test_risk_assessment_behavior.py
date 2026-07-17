from fastapi.testclient import TestClient
from src.api.main import app

def test_risk_assessment_extreme_scenarios():
    """Menguji respon API pada skenario ekstrem: risiko minimum vs risiko maksimum."""
    with TestClient(app) as client:
        # 1. Skenario Risiko Minimum (Vegetasi jarang, lumut tidak ada, genangan kecil, air mengalir/tidak tenang, matahari terik)
        low_risk_payload = {
            "grid_id": "HJ-G-0001",
            "observed_at": "2026-07-17",
            "lumut_level": "Tidak Ada",
            "vegetasi_level": "Jarang",
            "air_tenang": False,
            "paparan_matahari": "Tinggi",
            "luas_genangan_m2": 0.5,
            "mobility_level": "Sangat Rendah",
            "include_explanation": True
        }
        
        response = client.post("/v1/risk-assessments", json=low_risk_payload)
        assert response.status_code == 200
        res_data = response.json()
        
        # Ekspektasi: Habitat risk score rendah karena air tidak tenang & vegetasi minimal
        assert res_data["habitat_risk_score"] < 40.0
        assert res_data["combined_risk_score"] < 40.0
        assert res_data["heatmap"]["level"] in ["Sangat Rendah", "Rendah"]

        # 2. Skenario Risiko Maksimum (Vegetasi lebat, lumut banyak, genangan luas, air tenang, teduh/rendah matahari)
        high_risk_payload = {
            "grid_id": "HJ-G-0001",
            "observed_at": "2026-07-17",
            "lumut_level": "Banyak",
            "vegetasi_level": "Lebat",
            "air_tenang": True,
            "paparan_matahari": "Rendah",
            "luas_genangan_m2": 35.0,
            "mobility_level": "Sangat Tinggi",
            "include_explanation": True
        }
        
        response = client.post("/v1/risk-assessments", json=high_risk_payload)
        assert response.status_code == 200
        res_data = response.json()
        
        # Ekspektasi: Habitat risk score tinggi karena kondisi breeding site yang ideal
        assert res_data["habitat_risk_score"] > 70.0
        assert res_data["combined_risk_score"] > 70.0
        assert res_data["heatmap"]["level"] in ["Tinggi", "Sangat Tinggi"]
        
        # Verifikasi kontributor SHAP pada kasus risiko tinggi
        explanation = res_data["explanation"]
        assert explanation is not None
        assert "top_contributors" in explanation
        # Air Tenang / Vegetasi / Lumut harusnya menjadi kontributor yang menaikkan risiko
        top_features = [item["feature"] for item in explanation["top_contributors"]]
        assert any(feat in ["Air Tenang", "Vegetasi", "Lumut"] for feat in top_features)


def test_risk_assessment_validation_edge_cases():
    """Menguji API handle input tidak valid atau grid id yang tidak ada."""
    with TestClient(app) as client:
        # 1. Format Grid ID salah
        invalid_grid_payload = {
            "grid_id": "HJ-INVALID-0001",
            "observed_at": "2026-07-17",
            "lumut_level": "Sedang",
            "vegetasi_level": "Lebat",
            "air_tenang": True,
            "paparan_matahari": "Rendah",
            "luas_genangan_m2": 18.5,
            "mobility_level": "Tinggi"
        }
        response = client.post("/v1/risk-assessments", json=invalid_grid_payload)
        assert response.status_code == 422
        assert response.json()["code"] == "validation_error"

        # 2. Grid ID berformat benar tetapi tidak terdaftar di database/sumber
        non_existent_grid_payload = {
            "grid_id": "HJ-G-9999",
            "observed_at": "2026-07-17",
            "lumut_level": "Sedang",
            "vegetasi_level": "Lebat",
            "air_tenang": True,
            "paparan_matahari": "Rendah",
            "luas_genangan_m2": 18.5,
            "mobility_level": "Tinggi"
        }
        response = client.post("/v1/risk-assessments", json=non_existent_grid_payload)
        assert response.status_code == 404
        assert response.json()["code"] == "grid_not_found"

        # 3. Input luas_genangan_m2 negatif (melanggar validation ge=0)
        negative_area_payload = {
            "grid_id": "HJ-G-0001",
            "observed_at": "2026-07-17",
            "lumut_level": "Sedang",
            "vegetasi_level": "Lebat",
            "air_tenang": True,
            "paparan_matahari": "Rendah",
            "luas_genangan_m2": -10.0,
            "mobility_level": "Tinggi"
        }
        response = client.post("/v1/risk-assessments", json=negative_area_payload)
        assert response.status_code == 422
        assert response.json()["code"] == "validation_error"
