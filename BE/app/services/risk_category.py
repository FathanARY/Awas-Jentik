from typing import List, Tuple

HEATMAP_BANDS: List[Tuple[float, str, int, str]] = [
    (20, "Sangat Rendah", 0, "hijau"),
    (40, "Rendah", 1, "hijau_muda"),
    (60, "Sedang", 2, "kuning"),
    (80, "Tinggi", 3, "oranye"),
    (100, "Sangat Tinggi", 4, "merah"),
]

COMBINED_WEIGHTS = {
    "habitat": 0.65,
    "mobility": 0.20,
    "case": 0.15,
}

BAND_EXPLANATION = {
    0: "Risiko sangat rendah — tidak diperlukan tindakan khusus.",
    1: "Risiko rendah — lakukan pemantauan rutin.",
    2: "Risiko sedang — segera kuras genangan dan laporkan ke puskesmas.",
    3: "Risiko tinggi — fogging terjadwal dan distribusi kelambu.",
    4: "Risiko sangat tinggi — tanggap darurat, fogging massal, dan skrining massal.",
}


def get_heatmap(score: float) -> dict:
    for max_exclusive, level, level_index, color in HEATMAP_BANDS:
        if score < max_exclusive:
            return {
                "category": level,
                "level_index": level_index,
                "color": color,
            }
    return {
        "category": HEATMAP_BANDS[-1][1],
        "level_index": HEATMAP_BANDS[-1][2],
        "color": HEATMAP_BANDS[-1][3],
    }


def get_heatmap_bands() -> list:
    return [
        {
            "max_exclusive": max_exclusive,
            "level": level,
            "level_index": level_index,
            "color": color,
            "explanation": BAND_EXPLANATION.get(level_index, ""),
        }
        for max_exclusive, level, level_index, color in HEATMAP_BANDS
    ]


def get_band_for_score(score: float) -> dict | None:
    for band in get_heatmap_bands():
        if score < band["max_exclusive"]:
            return band
    return get_heatmap_bands()[-1]
