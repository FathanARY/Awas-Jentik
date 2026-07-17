"""Rainfall provider with an explicit synthetic-mode fallback."""

from __future__ import annotations

from datetime import date


class RainfallUnavailable(RuntimeError):
    pass


class RainfallProvider:
    def __init__(self, config: dict):
        self._config = config["providers"]["rainfall"]

    def monthly_mm(self, grid_id: str, observed_at: date) -> tuple[float, str]:
        if not self._config["simulation_mode"]:
            raise RainfallUnavailable("Rainfall provider produksi belum dikonfigurasi")
        return float(self._config["simulation_value_mm"]), "simulation"
