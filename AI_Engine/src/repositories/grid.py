"""Read-only lookup of environmental distance features by synthetic grid ID."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


GRID_COLUMNS = {
    "Jarak_Sungai_m": "jarak_sungai_m",
    "Jarak_Rawa_m": "jarak_rawa_m",
    "Jarak_Sawah_m": "jarak_sawah_m",
    "Jarak_Hutan_m": "jarak_hutan_m",
    "Jarak_Tambang_m": "jarak_tambang_m",
}


class GridRepository:
    def __init__(self, workbook_path: Path):
        frame = pd.read_excel(
            workbook_path,
            sheet_name="Grid_Desa",
            usecols=["Grid_ID", *GRID_COLUMNS],
        )
        frame = frame.rename(columns={"Grid_ID": "grid_id", **GRID_COLUMNS})
        self._features = frame.set_index("grid_id").to_dict(orient="index")

    def habitat_features(self, grid_id: str) -> dict[str, float]:
        try:
            return {
                feature: float(value)
                for feature, value in self._features[grid_id].items()
            }
        except KeyError as exc:
            raise KeyError(f"grid_id tidak ditemukan: {grid_id}") from exc
