"""
Distance estimation based on grid land type + dataset lookup.

When a citizen reports a breeding site, they should not be expected to manually
measure distances to every landmark. This module provides realistic default
distances based on the grid cell's land type from the Grid_Desa dataset.

Two-level fallback:
  1. Dataset-based lookup (Grid_Desa sheet → JARAK_DEFAULT per Tutupan_Lahan)
  2. Hardcoded estimates (existing LAND_DISTANCE_RULES, English land types)
  3. Generic fallback for unknown grids
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

LAND_TO_ENGLISH = {
    "Hutan": "forest",
    "Sawah": "rice",
    "Rawa": "swamp",
    "Permukiman": "residential",
    "Perkebunan": "plantation",
    "Bekas Tambang": "mining",
    "Belukar/Lahan Terbuka": "river",
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


def estimate_distances(grid_land: str | None, grid_id: str | None = None) -> Dict[str, float]:
    if grid_land and grid_land in LAND_DISTANCE_RULES:
        return dict(LAND_DISTANCE_RULES[grid_land])

    if grid_id:
        try:
            from app.services.grid_service import get_jarak_for_grid, get_tutupan_for_grid
            jarak = get_jarak_for_grid(grid_id)
            if jarak.get("Jarak_Hutan_m", 0) > 0:
                result = {
                    "jarak_hutan_m": jarak["Jarak_Hutan_m"],
                    "jarak_sawah_m": jarak["Jarak_Sawah_m"],
                    "jarak_sungai_m": jarak["Jarak_Sungai_m"],
                    "jarak_rawa_m": jarak["Jarak_Rawa_m"],
                    "jarak_tambang_m": jarak["Jarak_Tambang_m"],
                    "jarak_permukiman_m": jarak["Jarak_Permukiman_m"],
                    "jarak_puskesmas_m": jarak["Jarak_Puskesmas_m"],
                    "curah_hujan_30_hari_mm": 250,
                }
                return result

            tutupan = get_tutupan_for_grid(grid_id)
            en_land = LAND_TO_ENGLISH.get(tutupan)
            if en_land and en_land in LAND_DISTANCE_RULES:
                return dict(LAND_DISTANCE_RULES[en_land])
        except Exception:
            pass

    return dict(FALLBACK_DISTANCES)
