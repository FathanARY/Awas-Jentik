from fastapi.testclient import TestClient

from src.api.main import app


def test_health_reports_unready_model_without_hiding_state():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["model_status"] in {"ready", "not_ready"}


def test_grid_lookup_returns_synthetic_environmental_features():
    with TestClient(app) as client:
        response = client.get("/v1/grids/HJ-G-0001")
    assert response.status_code == 200
    assert "jarak_sungai_m" in response.json()["environmental_features"]


def test_assessment_returns_200_with_real_model_bundle():
    """Bundle tersedia → endpoint harus mengembalikan 200 dengan skor nyata."""
    payload = {
        "grid_id": "HJ-G-0001",
        "observed_at": "2026-07-17",
        "lumut_level": "Sedang",
        "vegetasi_level": "Lebat",
        "air_tenang": True,
        "paparan_matahari": "Rendah",
        "luas_genangan_m2": 18.5,
        "mobility_level": "Tinggi",
    }
    with TestClient(app) as client:
        response = client.post("/v1/risk-assessments", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert 0 <= body["habitat_risk_score"] <= 100
    assert 0 <= body["combined_risk_score"] <= 100
    assert body["model_version"].startswith("hrs-")  # winner bisa tabpfn, xgboost, atau rf
    assert body["explanation"] is None  # include_explanation default False


def test_assessment_with_explanation_returns_top_contributors():
    """include_explanation=true → field explanation harus berisi top_contributors."""
    payload = {
        "grid_id": "HJ-G-0001",
        "observed_at": "2026-07-17",
        "lumut_level": "Banyak",
        "vegetasi_level": "Lebat",
        "air_tenang": True,
        "paparan_matahari": "Rendah",
        "luas_genangan_m2": 25.0,
        "mobility_level": "Sangat Tinggi",
        "include_explanation": True,
    }
    with TestClient(app) as client:
        response = client.post("/v1/risk-assessments", json=payload)
    assert response.status_code == 200
    explanation = response.json()["explanation"]
    assert explanation is not None
    assert "top_contributors" in explanation
    assert len(explanation["top_contributors"]) > 0
    assert "shap_value" in explanation["top_contributors"][0]
