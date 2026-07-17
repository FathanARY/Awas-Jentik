"""
Distance estimation based on grid land type.

When a citizen reports a breeding site, they should not be expected to manually
measure distances to every landmark. This module provides realistic default
distances based on the grid cell's land type, so the Habitat model still sees
meaningful variation between reports.

Rules are derived from the 50×50 grid map defined in MapGrid.ts.
Each grid cell ≈ 400m × 400m (20km range / 50 cells).
"""

from typing import Dict

LAND_DISTANCE_RULES: Dict[str, Dict[str, float]] = {
    "forest": {
        "jarak_hutan_m": 80,
        "jarak_sawah_m": 800,
        "jarak_sungai_m": 400,
        "jarak_rawa_m": 600,
        "jarak_tambang_m": 4000,
        "jarak_permukiman_m": 1200,
        "jarak_puskesmas_m": 2500,
        "curah_hujan_30_hari_mm": 420,
    },
    "plantation": {
        "jarak_hutan_m": 600,
        "jarak_sawah_m": 400,
        "jarak_sungai_m": 500,
        "jarak_rawa_m": 800,
        "jarak_tambang_m": 3000,
        "jarak_permukiman_m": 600,
        "jarak_puskesmas_m": 2000,
        "curah_hujan_30_hari_mm": 380,
    },
    "rice": {
        "jarak_hutan_m": 500,
        "jarak_sawah_m": 30,
        "jarak_sungai_m": 200,
        "jarak_rawa_m": 400,
        "jarak_tambang_m": 3500,
        "jarak_permukiman_m": 150,
        "jarak_puskesmas_m": 1800,
        "curah_hujan_30_hari_mm": 350,
    },
    "residential": {
        "jarak_hutan_m": 1500,
        "jarak_sawah_m": 300,
        "jarak_sungai_m": 400,
        "jarak_rawa_m": 1200,
        "jarak_tambang_m": 5000,
        "jarak_permukiman_m": 30,
        "jarak_puskesmas_m": 800,
        "curah_hujan_30_hari_mm": 280,
    },
    "river": {
        "jarak_hutan_m": 600,
        "jarak_sawah_m": 200,
        "jarak_sungai_m": 20,
        "jarak_rawa_m": 300,
        "jarak_tambang_m": 4000,
        "jarak_permukiman_m": 500,
        "jarak_puskesmas_m": 2500,
        "curah_hujan_30_hari_mm": 400,
    },
    "swamp": {
        "jarak_hutan_m": 200,
        "jarak_sawah_m": 600,
        "jarak_sungai_m": 150,
        "jarak_rawa_m": 30,
        "jarak_tambang_m": 3500,
        "jarak_permukiman_m": 1500,
        "jarak_puskesmas_m": 3000,
        "curah_hujan_30_hari_mm": 500,
    },
    "mining": {
        "jarak_hutan_m": 2000,
        "jarak_sawah_m": 1500,
        "jarak_sungai_m": 800,
        "jarak_rawa_m": 2000,
        "jarak_tambang_m": 50,
        "jarak_permukiman_m": 2000,
        "jarak_puskesmas_m": 4000,
        "curah_hujan_30_hari_mm": 300,
    },
}

FALLBACK_DISTANCES: Dict[str, float] = {
    "jarak_hutan_m": 2000,
    "jarak_sawah_m": 2000,
    "jarak_sungai_m": 2000,
    "jarak_rawa_m": 2000,
    "jarak_tambang_m": 5000,
    "jarak_permukiman_m": 200,
    "jarak_puskesmas_m": 2000,
    "curah_hujan_30_hari_mm": 250,
}


def estimate_distances(grid_land: str | None) -> Dict[str, float]:
    """Return estimated distances + rainfall for a grid cell based on its land type.

    Args:
        grid_land: Lowercase land type key (e.g. 'forest', 'rice', 'residential').
                   If None or unrecognised, fallback values are returned.

    Returns:
        Dict with keys matching the habitat input feature names, plus curah_hujan.
    """
    if grid_land and grid_land in LAND_DISTANCE_RULES:
        return dict(LAND_DISTANCE_RULES[grid_land])

    return dict(FALLBACK_DISTANCES)
