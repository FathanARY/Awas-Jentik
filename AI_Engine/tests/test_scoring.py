from src.features.scoring import (
    calculate_case_score,
    calculate_combined_risk,
    calculate_habitat_risk,
    heatmap_for_score,
)
from src.settings import load_config


def _record(**overrides):
    record = {
        "lumut_level": "Tidak Ada",
        "vegetasi_level": "Jarang",
        "air_tenang": False,
        "paparan_matahari": "Tinggi",
        "luas_genangan_m2": 1,
        "curah_hujan_bulanan_mm": 10,
        "jarak_sungai_m": 1000,
        "jarak_rawa_m": 1000,
        "jarak_sawah_m": 1000,
        "jarak_hutan_m": 1000,
        "jarak_tambang_m": 1000,
    }
    record.update(overrides)
    return record


def test_air_tenang_false_cap_applies():
    config = load_config()
    result = calculate_habitat_risk(
        _record(
            lumut_level="Banyak",
            vegetasi_level="Lebat",
            air_tenang=False,
            paparan_matahari="Rendah",
            luas_genangan_m2=40,
            curah_hujan_bulanan_mm=200,
            jarak_sungai_m=50,
            jarak_rawa_m=50,
            jarak_sawah_m=50,
            jarak_hutan_m=50,
            jarak_tambang_m=50,
        ),
        config,
    )
    assert result.score == 58
    assert "R4" in result.applied_rules


def test_rule_interactions_are_recorded():
    config = load_config()
    result = calculate_habitat_risk(
        _record(
            lumut_level="Banyak",
            vegetasi_level="Lebat",
            air_tenang=True,
            paparan_matahari="Rendah",
            luas_genangan_m2=20,
            curah_hujan_bulanan_mm=200,
            jarak_sungai_m=100,
            jarak_rawa_m=500,
            jarak_tambang_m=50,
        ),
        config,
    )
    assert {"R1", "R2", "R3", "R6"}.issubset(result.applied_rules)


def test_heatmap_boundaries():
    config = load_config()
    assert heatmap_for_score(19.999, config).level == "Sangat Rendah"
    assert heatmap_for_score(20, config).level == "Rendah"
    assert heatmap_for_score(40, config).level == "Sedang"
    assert heatmap_for_score(60, config).level == "Tinggi"
    assert heatmap_for_score(80, config).level == "Sangat Tinggi"


def test_case_score_and_combined_risk():
    config = load_config()
    assert calculate_case_score([100], config) == 100
    assert calculate_case_score([200], config) == 80
    assert calculate_combined_risk(60, 55, 40, config) == 56.0
