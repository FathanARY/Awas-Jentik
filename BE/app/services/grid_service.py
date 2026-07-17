import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_GRID_INDEX: dict[str, dict] = {}
_GRID_BY_COORD: list[dict] = []

_DATASET_PATH = os.path.normpath(
    os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "AI_Engine",
        "dataset_dummy_malaria_desa_harapan_jaya.xlsx",
    )
)


def _load_grid_desa():
    global _GRID_INDEX, _GRID_BY_COORD
    if _GRID_INDEX:
        return

    if not os.path.exists(_DATASET_PATH):
        logger.info(f"Grid dataset not found, using built-in defaults")
        return

    try:
        import pandas as pd
    except ImportError:
        logger.info("pandas not available, grid lookup uses built-in defaults")
        return

    try:
        df = pd.read_excel(_DATASET_PATH, sheet_name="Grid_Desa")
        for _, row in df.iterrows():
            grid_data = {
                "grid_id": str(row["Grid_ID"]),
                "kolom": int(row.get("Kolom_100m", 0)),
                "baris": int(row.get("Baris_100m", 0)),
                "x_m": float(row.get("X_m", 0)),
                "y_m": float(row.get("Y_m", 0)),
                "lat": float(row.get("Latitude_Dummy", 0)),
                "lng": float(row.get("Longitude_Dummy", 0)),
                "tutupan_lahan": str(row.get("Tutupan_Lahan", "")),
                "penduduk": int(row.get("Estimasi_Penduduk", 0)),
                "risiko_grid": float(row.get("Risiko_Grid_0_100", 0)),
                "kategori": str(row.get("Kategori_Heatmap_4", "")),
                "jarak": {
                    "Jarak_Hutan_m": float(row.get("Jarak_Hutan_m", 0)),
                    "Jarak_Sawah_m": float(row.get("Jarak_Sawah_m", 0)),
                    "Jarak_Sungai_m": float(row.get("Jarak_Sungai_m", 0)),
                    "Jarak_Rawa_m": float(row.get("Jarak_Rawa_m", 0)),
                    "Jarak_Tambang_m": float(row.get("Jarak_Tambang_m", 0)),
                    "Jarak_Permukiman_m": float(row.get("Jarak_Permukiman_m", 0)),
                    "Jarak_Puskesmas_m": float(row.get("Jarak_Puskesmas_m", 0)),
                },
            }
            _GRID_INDEX[str(row["Grid_ID"])] = grid_data
            _GRID_BY_COORD.append(grid_data)

        logger.info(f"Loaded {len(_GRID_INDEX)} grids from dataset")
    except Exception as e:
        logger.warning(f"Failed to load Grid_Desa: {e}")


def get_grid(grid_id: str) -> Optional[dict]:
    _load_grid_desa()
    return _GRID_INDEX.get(grid_id)


def get_all_grids() -> list[dict]:
    _load_grid_desa()
    return [
        {
            "grid_id": g["grid_id"],
            "lat": g["lat"],
            "lng": g["lng"],
            "tutupan_lahan": g["tutupan_lahan"],
            "risiko_grid": g["risiko_grid"],
            "kategori": g["kategori"],
            "penduduk": g["penduduk"],
        }
        for g in _GRID_BY_COORD
    ]


def find_nearest_grid(lat: float, lng: float) -> Optional[dict]:
    _load_grid_desa()
    if not _GRID_BY_COORD:
        return None
    best = min(
        _GRID_BY_COORD,
        key=lambda g: (g["lat"] - lat) ** 2 + (g["lng"] - lng) ** 2,
    )
    return best


def get_jarak_for_grid(grid_id: str) -> dict:
    from app.services.dataset_lookup import JARAK_DEFAULT
    grid = get_grid(grid_id)
    if grid and grid["tutupan_lahan"]:
        return {
            "Jarak_Hutan_m": grid["jarak"]["Jarak_Hutan_m"],
            "Jarak_Sawah_m": grid["jarak"]["Jarak_Sawah_m"],
            "Jarak_Sungai_m": grid["jarak"]["Jarak_Sungai_m"],
            "Jarak_Rawa_m": grid["jarak"]["Jarak_Rawa_m"],
            "Jarak_Tambang_m": grid["jarak"]["Jarak_Tambang_m"],
            "Jarak_Permukiman_m": grid["jarak"]["Jarak_Permukiman_m"],
            "Jarak_Puskesmas_m": grid["jarak"]["Jarak_Puskesmas_m"],
        }
    return JARAK_DEFAULT.get("Permukiman", {})


def get_tutupan_for_grid(grid_id: str) -> str:
    grid = get_grid(grid_id)
    if grid:
        return grid["tutupan_lahan"]
    return "Permukiman"


def get_risk_by_landcover() -> list[dict]:
    from app.services.dataset_lookup import RISK_BY_LANDCOVER
    return RISK_BY_LANDCOVER


def get_monthly_cases() -> list[dict]:
    from app.services.dataset_lookup import MONTHLY_CASES
    return MONTHLY_CASES
