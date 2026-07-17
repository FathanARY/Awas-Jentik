"""Pinned local TabPFN v2 construction and runtime preflight."""

from __future__ import annotations

import hashlib
import os
import platform
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from tabpfn import TabPFNRegressor

from src.settings import project_path

os.environ.setdefault(
    "TABPFN_MODEL_CACHE_DIR", str(project_path("models", "tabpfn_foundation"))
)


@dataclass(frozen=True)
class TabPFNRuntime:
    requested_device: str
    active_device: str
    fallback_used: bool
    tabpfn_version: str
    torch_version: str
    cuda_version: str | None
    gpu_name: str | None
    gpu_memory_bytes: int | None
    python_version: str

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def configure_model_cache(config: dict[str, Any], project_root: Path) -> Path:
    cache_dir = project_root / config["tabpfn"]["cache_directory"]
    cache_dir.mkdir(parents=True, exist_ok=True)
    os.environ["TABPFN_MODEL_CACHE_DIR"] = str(cache_dir)
    return cache_dir


def resolve_runtime(config: dict[str, Any]) -> TabPFNRuntime:
    import tabpfn
    import torch

    requested = str(config["tabpfn"]["device"])
    cuda_available = torch.cuda.is_available()
    if requested == "cuda" and cuda_available:
        active = "cuda"
        fallback_used = False
    elif requested == "cuda":
        active = str(config["tabpfn"]["fallback_device"])
        fallback_used = True
    else:
        active = requested
        fallback_used = False

    gpu_name = torch.cuda.get_device_name(0) if cuda_available else None
    gpu_memory = (
        int(torch.cuda.get_device_properties(0).total_memory) if cuda_available else None
    )
    return TabPFNRuntime(
        requested_device=requested,
        active_device=active,
        fallback_used=fallback_used,
        tabpfn_version=tabpfn.__version__,
        torch_version=torch.__version__,
        cuda_version=torch.version.cuda,
        gpu_name=gpu_name,
        gpu_memory_bytes=gpu_memory,
        python_version=platform.python_version(),
    )


def validate_preflight(
    train_rows: int, feature_count: int, config: dict[str, Any], runtime: TabPFNRuntime
) -> None:
    tabpfn_config = config["tabpfn"]
    if train_rows > int(tabpfn_config["max_train_samples"]):
        raise ValueError(
            f"Jumlah training rows {train_rows} melampaui batas "
            f"{tabpfn_config['max_train_samples']}"
        )
    if feature_count > int(tabpfn_config["max_features"]):
        raise ValueError(
            f"Jumlah feature {feature_count} melampaui batas "
            f"{tabpfn_config['max_features']}"
        )
    if runtime.fallback_used and train_rows > 1000:
        raise RuntimeError(
            "CPU fallback dilarang untuk training >1000 row; GPU CUDA harus tersedia"
        )
    if runtime.active_device == "cuda" and (
        runtime.gpu_memory_bytes is None or runtime.gpu_memory_bytes < 4_000_000_000
    ):
        raise RuntimeError("GPU dengan VRAM minimal 4 GB diperlukan untuk konfigurasi PoC")


def create_regressor(config: dict[str, Any], runtime: TabPFNRuntime) -> TabPFNRegressor:
    from tabpfn import TabPFNRegressor
    from tabpfn.constants import ModelVersion

    if config["tabpfn"]["model_version"] != "V2":
        raise ValueError("Model TabPFN yang diizinkan untuk PoC ini hanya V2")
    return TabPFNRegressor.create_default_for_version(
        ModelVersion.V2,
        device=runtime.active_device,
        n_estimators=int(config["tabpfn"]["n_estimators"]),
        fit_mode=str(config["tabpfn"]["fit_mode"]),
        keep_cache_on_device=bool(config["tabpfn"]["keep_cache_on_device"]),
        random_state=int(config["training"]["random_seed"]),
        n_preprocessing_jobs=1,
        show_progress_bar=False,
    )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def checkpoint_inventory(cache_dir: Path) -> list[dict[str, Any]]:
    inventory: list[dict[str, Any]] = []
    for path in sorted(candidate for candidate in cache_dir.rglob("*") if candidate.is_file()):
        inventory.append(
            {
                "path": str(path.relative_to(cache_dir)),
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }
        )
    return inventory
