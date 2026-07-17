"""Regenerate the final, auditable training dataset from the source workbook."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pandas as pd

from src.data.validation import validate_training_frame
from src.features.scoring import calculate_habitat_risk
from src.settings import load_config, project_path


SOURCE_TO_FINAL = {
    "Observasi_ID": "observation_id",
    "Tanggal_Observasi": "observed_at",
    "Grid_ID": "grid_id",
    "Paparan_Matahari": "paparan_matahari",
    "Luas_Genangan_m2": "luas_genangan_m2",
    "Curah_Hujan_30_Hari_mm": "curah_hujan_bulanan_mm",
    "Jarak_Sungai_m": "jarak_sungai_m",
    "Jarak_Rawa_m": "jarak_rawa_m",
    "Jarak_Sawah_m": "jarak_sawah_m",
    "Jarak_Hutan_m": "jarak_hutan_m",
    "Jarak_Tambang_m": "jarak_tambang_m",
}


def _map_percentage(value: float, rules: list[dict[str, Any]]) -> str:
    if not 0 <= float(value) <= 100:
        raise ValueError(f"Persentase di luar rentang 0-100: {value}")
    for rule in rules:
        if float(rule["min_inclusive"]) <= float(value) <= float(rule["max_inclusive"]):
            return str(rule["label"])
    raise ValueError(f"Tidak ada mapping kategori untuk {value}")


def _spatial_zone_id(column_100m: int, row_100m: int) -> str:
    zone_column = (int(column_100m) - 1) // 5 + 1
    zone_row = (int(row_100m) - 1) // 5 + 1
    return f"HJ-Z-{zone_row:02d}-{zone_column:02d}"


def generate_training_dataset(
    workbook_path: Path,
    output_path: Path,
    manifest_path: Path,
    config: dict[str, Any],
) -> pd.DataFrame:
    raw = pd.read_excel(workbook_path, sheet_name="Data_Training")
    grid = pd.read_excel(
        workbook_path,
        sheet_name="Grid_Desa",
        usecols=["Grid_ID", "Kolom_100m", "Baris_100m"],
    )
    zones = grid.assign(
        spatial_zone_id=lambda frame: frame.apply(
            lambda row: _spatial_zone_id(row["Kolom_100m"], row["Baris_100m"]),
            axis=1,
        )
    )[["Grid_ID", "spatial_zone_id"]]

    frame = raw.rename(columns=SOURCE_TO_FINAL).merge(
        zones, left_on="grid_id", right_on="Grid_ID", how="left", validate="many_to_one"
    )
    frame = frame.drop(columns=["Grid_ID"])
    mapping = config["dataset"]["category_mapping"]
    frame["lumut_level"] = raw[mapping["lumut_level"]["source_column"]].map(
        lambda value: _map_percentage(value, mapping["lumut_level"]["rules"])
    )
    frame["vegetasi_level"] = raw[mapping["vegetasi_level"]["source_column"]].map(
        lambda value: _map_percentage(value, mapping["vegetasi_level"]["rules"])
    )
    allowed_sun = set(mapping["paparan_matahari"]["allowed_values"])
    if not set(frame["paparan_matahari"].dropna()).issubset(allowed_sun):
        raise ValueError("Paparan_Matahari sumber mengandung kategori di luar config")
    frame["air_tenang"] = raw["Air_Tenang"].map({"Ya": True, "Tidak": False})
    if frame["air_tenang"].isna().any():
        raise ValueError("Air_Tenang sumber mengandung nilai di luar Ya/Tidak")

    generated = frame.apply(
        lambda row: calculate_habitat_risk(row.to_dict(), config), axis=1
    )
    frame["base_expert_score"] = generated.map(lambda result: result.base_expert_score)
    frame["applied_rules"] = generated.map(
        lambda result: json.dumps(result.applied_rules, ensure_ascii=False)
    )
    frame["habitat_risk_score"] = generated.map(lambda result: result.score)
    frame["mapping_version"] = config["dataset"]["mapping_version"]

    final_columns = [
        "observation_id",
        "observed_at",
        "grid_id",
        "spatial_zone_id",
        "lumut_level",
        "vegetasi_level",
        "air_tenang",
        "paparan_matahari",
        "luas_genangan_m2",
        "curah_hujan_bulanan_mm",
        "jarak_sungai_m",
        "jarak_rawa_m",
        "jarak_sawah_m",
        "jarak_hutan_m",
        "jarak_tambang_m",
        "habitat_risk_score",
        "base_expert_score",
        "applied_rules",
        "mapping_version",
    ]
    final = frame[final_columns].copy()
    report = validate_training_frame(final, config)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    final.to_parquet(output_path, index=False)
    manifest_path.write_text(
        json.dumps(
            {
                "source_workbook": workbook_path.name,
                "mapping_version": config["dataset"]["mapping_version"],
                "rows": report.rows,
                "columns": report.columns,
                "fingerprint": report.fingerprint,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return final


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=project_path("dataset_dummy_malaria_desa_harapan_jaya.xlsx"),
    )
    parser.add_argument(
        "--output", type=Path, default=project_path("data", "processed", "habitat_training.parquet")
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=project_path("data", "processed", "habitat_training.manifest.json"),
    )
    args = parser.parse_args()
    generate_training_dataset(args.source, args.output, args.manifest, load_config())


if __name__ == "__main__":
    main()
