"""Aggregated case-distance repository for synthetic-mode serving."""

from __future__ import annotations

from datetime import date


class CaseRepository:
    def __init__(self, config: dict):
        self._config = config["providers"]["cases"]

    def distances_within_radius_m(self, grid_id: str, observed_at: date) -> list[float]:
        if not self._config["simulation_mode"]:
            raise RuntimeError("Case repository produksi belum dikonfigurasi")
        return [float(value) for value in self._config["case_distances_m"]]
