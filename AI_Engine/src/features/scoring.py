"""Transparent HRS, mobility, case, combined-risk, and heatmap rules."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence


@dataclass(frozen=True)
class HabitatScore:
    score: float
    base_expert_score: float
    applied_rules: tuple[str, ...]


@dataclass(frozen=True)
class HeatmapResult:
    level: str
    color: str


def _as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"ya", "true", "1"}:
            return True
        if normalized in {"tidak", "false", "0"}:
            return False
    raise ValueError(f"Nilai boolean tidak valid: {value!r}")


def _band_points(value: float, bands: Sequence[Mapping[str, Any]]) -> float:
    for band in bands:
        if "max_exclusive" in band and value < float(band["max_exclusive"]):
            return float(band["points"])
        if "max_inclusive" in band and value <= float(band["max_inclusive"]):
            return float(band["points"])
        if "max_exclusive" not in band and "max_inclusive" not in band:
            return float(band["points"])
    raise ValueError(f"Tidak ada band score untuk nilai {value}")


def calculate_habitat_risk(
    record: Mapping[str, Any], config: Mapping[str, Any]
) -> HabitatScore:
    habitat = config["scoring"]["habitat"]
    points = habitat["base_points"]
    air_tenang = _as_bool(record["air_tenang"])

    base = (
        float(points["lumut_level"][record["lumut_level"]])
        + float(points["vegetasi_level"][record["vegetasi_level"]])
        + float(points["air_tenang"][air_tenang])
        + float(points["paparan_matahari"][record["paparan_matahari"]])
        + _band_points(float(record["luas_genangan_m2"]), habitat["luas_genangan_bands"])
        + _band_points(
            float(record["curah_hujan_bulanan_mm"]), habitat["curah_hujan_bands"]
        )
    )
    for feature, bands in habitat["distance_points"].items():
        base += _band_points(float(record[feature]), bands)

    rules = habitat["rules"]
    adjusted = base
    applied: list[str] = []
    sungai_dekat = float(record["jarak_sungai_m"]) <= 300
    rawa_dekat = float(record["jarak_rawa_m"]) <= 300
    tambang_dekat = float(record["jarak_tambang_m"]) <= 100
    hujan_moderat = 150 <= float(record["curah_hujan_bulanan_mm"]) < 450
    genangan_bermakna = float(record["luas_genangan_m2"]) >= 10

    if air_tenang and record["vegetasi_level"] == "Lebat":
        adjusted += float(rules["r1_bonus"])
        applied.append("R1")
    if air_tenang and (sungai_dekat or rawa_dekat):
        adjusted += float(rules["r2_bonus"])
        applied.append("R2")
    if hujan_moderat and genangan_bermakna:
        adjusted += float(rules["r3_bonus"])
        applied.append("R3")
    if (
        record["paparan_matahari"] == "Tinggi"
        and record["lumut_level"] == "Tidak Ada"
        and float(record["luas_genangan_m2"]) < 2
    ):
        adjusted -= float(rules["r5_penalty"])
        applied.append("R5")
    if air_tenang and tambang_dekat:
        adjusted += float(rules["r6_bonus"])
        applied.append("R6")

    score = max(0.0, min(100.0, adjusted))
    if not air_tenang:
        capped = min(score, float(rules["r4_air_tenang_false_cap"]))
        if capped != score:
            applied.append("R4")
        score = capped

    return HabitatScore(
        score=round(score, 4),
        base_expert_score=round(base, 4),
        applied_rules=tuple(applied),
    )


def calculate_mobility_score(level: str, config: Mapping[str, Any]) -> float:
    try:
        return float(config["scoring"]["mobility_scores"][level])
    except KeyError as exc:
        raise ValueError(f"Level mobilitas tidak valid: {level}") from exc


def distance_decay_contribution(
    distance_m: float, anchors: Sequence[Mapping[str, Any]]
) -> float:
    if distance_m < 0:
        raise ValueError("Jarak kasus tidak boleh negatif")
    ordered = sorted(anchors, key=lambda item: float(item["distance_m"]))
    if distance_m >= float(ordered[-1]["distance_m"]):
        return float(ordered[-1]["contribution"])
    for left, right in zip(ordered, ordered[1:]):
        left_distance = float(left["distance_m"])
        right_distance = float(right["distance_m"])
        if left_distance <= distance_m <= right_distance:
            left_value = float(left["contribution"])
            right_value = float(right["contribution"])
            ratio = (distance_m - left_distance) / (right_distance - left_distance)
            return left_value + ratio * (right_value - left_value)
    return float(ordered[0]["contribution"])


def calculate_case_score(
    case_distances_m: Sequence[float], config: Mapping[str, Any]
) -> float:
    anchors = config["scoring"]["case_distance_anchors"]
    total = sum(distance_decay_contribution(distance, anchors) for distance in case_distances_m)
    return round(min(100.0, total), 4)


def calculate_combined_risk(
    habitat_score: float,
    mobility_score: float,
    case_score: float,
    config: Mapping[str, Any],
) -> float:
    weights = config["scoring"]["combined_weights"]
    total = (
        float(weights["habitat"]) * habitat_score
        + float(weights["mobility"]) * mobility_score
        + float(weights["case"]) * case_score
    )
    return round(max(0.0, min(100.0, total)), 4)


def heatmap_for_score(score: float, config: Mapping[str, Any]) -> HeatmapResult:
    if not 0 <= score <= 100:
        raise ValueError("Skor heatmap harus berada pada rentang 0-100")
    for band in config["scoring"]["heatmap"]:
        if "max_exclusive" in band and score < float(band["max_exclusive"]):
            return HeatmapResult(level=band["level"], color=band["color"])
        if "max_inclusive" in band and score <= float(band["max_inclusive"]):
            return HeatmapResult(level=band["level"], color=band["color"])
    raise ValueError(f"Tidak ada heatmap band untuk score {score}")
