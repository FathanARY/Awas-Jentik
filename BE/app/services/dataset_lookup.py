JARAK_DEFAULT = {
    "Hutan": {
        "Jarak_Hutan_m": 0,
        "Jarak_Sawah_m": 940,
        "Jarak_Sungai_m": 1321,
        "Jarak_Rawa_m": 1804,
        "Jarak_Tambang_m": 3493,
        "Jarak_Permukiman_m": 1661,
        "Jarak_Puskesmas_m": 3012,
    },
    "Sawah": {
        "Jarak_Hutan_m": 917,
        "Jarak_Sawah_m": 0,
        "Jarak_Sungai_m": 618,
        "Jarak_Rawa_m": 2052,
        "Jarak_Tambang_m": 1814,
        "Jarak_Permukiman_m": 899,
        "Jarak_Puskesmas_m": 1696,
    },
    "Rawa": {
        "Jarak_Hutan_m": 778,
        "Jarak_Sawah_m": 1139,
        "Jarak_Sungai_m": 1159,
        "Jarak_Rawa_m": 0,
        "Jarak_Tambang_m": 2580,
        "Jarak_Permukiman_m": 563,
        "Jarak_Puskesmas_m": 2138,
    },
    "Permukiman": {
        "Jarak_Hutan_m": 2003,
        "Jarak_Sawah_m": 872,
        "Jarak_Sungai_m": 1140,
        "Jarak_Rawa_m": 1454,
        "Jarak_Tambang_m": 869,
        "Jarak_Permukiman_m": 0,
        "Jarak_Puskesmas_m": 1050,
    },
    "Perkebunan": {
        "Jarak_Hutan_m": 1828,
        "Jarak_Sawah_m": 497,
        "Jarak_Sungai_m": 1614,
        "Jarak_Rawa_m": 3720,
        "Jarak_Tambang_m": 2485,
        "Jarak_Permukiman_m": 1741,
        "Jarak_Puskesmas_m": 2911,
    },
    "Bekas Tambang": {
        "Jarak_Hutan_m": 2839,
        "Jarak_Sawah_m": 1226,
        "Jarak_Sungai_m": 1395,
        "Jarak_Rawa_m": 2379,
        "Jarak_Tambang_m": 0,
        "Jarak_Permukiman_m": 222,
        "Jarak_Puskesmas_m": 1177,
    },
    "Belukar/Lahan Terbuka": {
        "Jarak_Hutan_m": 2083,
        "Jarak_Sawah_m": 1520,
        "Jarak_Sungai_m": 2106,
        "Jarak_Rawa_m": 2322,
        "Jarak_Tambang_m": 2043,
        "Jarak_Permukiman_m": 1125,
        "Jarak_Puskesmas_m": 2516,
    },
}

RISK_BY_LANDCOVER = [
    {"tutupan": "Bekas Tambang", "rata_rata_risiko": 76.6, "min": 61, "max": 89, "grid": 100, "pct_tinggi": 56},
    {"tutupan": "Rawa", "rata_rata_risiko": 65.0, "min": 50, "max": 87, "grid": 200, "pct_tinggi": 6},
    {"tutupan": "Sawah", "rata_rata_risiko": 51.4, "min": 31, "max": 75, "grid": 500, "pct_tinggi": 0},
    {"tutupan": "Hutan", "rata_rata_risiko": 49.5, "min": 35, "max": 83, "grid": 600, "pct_tinggi": 0},
    {"tutupan": "Permukiman", "rata_rata_risiko": 36.8, "min": 12, "max": 57, "grid": 500, "pct_tinggi": 0},
    {"tutupan": "Perkebunan", "rata_rata_risiko": 36.1, "min": 23, "max": 62, "grid": 300, "pct_tinggi": 0},
    {"tutupan": "Belukar/Lahan Terbuka", "rata_rata_risiko": 32.0, "min": 16, "max": 55, "grid": 300, "pct_tinggi": 0},
]

MONTHLY_CASES = [
    {"bulan": "2025-10", "label": "Okt 2025", "kasus_total": 7, "kasus_impor": 3, "kasus_lokal": 4, "curah_hujan_mm": 258},
    {"bulan": "2025-11", "label": "Nov 2025", "kasus_total": 15, "kasus_impor": 4, "kasus_lokal": 11, "curah_hujan_mm": 305},
    {"bulan": "2025-12", "label": "Des 2025", "kasus_total": 13, "kasus_impor": 5, "kasus_lokal": 8, "curah_hujan_mm": 348},
    {"bulan": "2026-01", "label": "Jan 2026", "kasus_total": 10, "kasus_impor": 3, "kasus_lokal": 7, "curah_hujan_mm": 387},
    {"bulan": "2026-02", "label": "Feb 2026", "kasus_total": 7, "kasus_impor": 3, "kasus_lokal": 4, "curah_hujan_mm": 357},
    {"bulan": "2026-03", "label": "Mar 2026", "kasus_total": 12, "kasus_impor": 1, "kasus_lokal": 11, "curah_hujan_mm": 285},
    {"bulan": "2026-04", "label": "Apr 2026", "kasus_total": 6, "kasus_impor": 2, "kasus_lokal": 4, "curah_hujan_mm": 218},
    {"bulan": "2026-05", "label": "Mei 2026", "kasus_total": 13, "kasus_impor": 4, "kasus_lokal": 9, "curah_hujan_mm": 164},
    {"bulan": "2026-06", "label": "Jun 2026", "kasus_total": 6, "kasus_impor": 1, "kasus_lokal": 5, "curah_hujan_mm": 114},
]

KASUS_BY_ZONE = {
    "Z001": [{"Periode": "2026-06", "Kasus": 0}, {"Periode": "2026-05", "Kasus": 0}, {"Periode": "2026-04", "Kasus": 0}],
}

GRID_TUTUPAN_LAHAN = {
    "AREA-0000": "Permukiman",
}


def get_jarak_for_tutupan(tutupan_lahan: str) -> dict:
    return JARAK_DEFAULT.get(tutupan_lahan, JARAK_DEFAULT["Belukar/Lahan Terbuka"])


def get_kasus_1km(grid_id: str, periode_bulan: str = "2026-06") -> int:
    return 0


def get_tutupan_for_grid(grid_id: str) -> str:
    return GRID_TUTUPAN_LAHAN.get(grid_id, "Permukiman")
