"""Persistence dan verifikasi bundle model pemenang (TabPFN, XGBoost, atau RF)."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib

from src.settings import project_path

os.environ.setdefault(
    "TABPFN_MODEL_CACHE_DIR", str(project_path("models", "tabpfn_foundation"))
)

from src.models.tabpfn import sha256_file


# Nama file fitted model di models/ tergantung model_type
_FITTED_FILENAMES: dict[str, str] = {
    "tabpfn": "hrs_tabpfn_fitted.tabpfn_fit",
    "xgboost": "hrs_winner_model.joblib",
    "random_forest": "hrs_winner_model.joblib",
}


def save_model_bundle(
    *,
    model: Any,
    preprocessor: Any,
    metadata: dict[str, Any],
    background_frame: Any,
    models_dir: Path,
    model_type: str = "tabpfn",
) -> dict[str, Path]:
    """Simpan bundle winner model. model_type: 'tabpfn' | 'xgboost' | 'random_forest'."""
    if model_type not in _FITTED_FILENAMES:
        raise ValueError(
            f"model_type tidak dikenal: '{model_type}'. "
            f"Pilihan valid: {list(_FITTED_FILENAMES)}"
        )
    models_dir.mkdir(parents=True, exist_ok=True)
    preprocessor_path = models_dir / "hrs_preprocessor.joblib"
    fitted_filename = _FITTED_FILENAMES[model_type]
    fitted_path = models_dir / fitted_filename
    metadata_path = models_dir / "model_metadata.json"
    manifest_path = models_dir / "compatibility_manifest.json"
    background_path = models_dir / "shap_background.parquet"

    joblib.dump(preprocessor, preprocessor_path)

    if model_type == "tabpfn":
        from tabpfn.model_loading import save_fitted_tabpfn_model
        save_fitted_tabpfn_model(model, fitted_path)
    else:
        joblib.dump(model, fitted_path)

    background_frame.to_parquet(background_path, index=False)
    metadata["model_type"] = model_type
    metadata["fitted_filename"] = fitted_filename
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    artifacts = {
        "preprocessor": preprocessor_path,
        "fitted_model": fitted_path,
        "metadata": metadata_path,
        "shap_background": background_path,
    }
    manifest = {
        "schema_feature_order": metadata["feature_order"],
        "model_version": metadata["model_version"],
        "model_type": model_type,
        "fitted_filename": fitted_filename,
        "artifact_sha256": {
            name: sha256_file(path) for name, path in artifacts.items()
        },
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    artifacts["compatibility_manifest"] = manifest_path
    return artifacts


def verify_model_bundle(models_dir: Path) -> dict[str, Any]:
    """Verifikasi SHA-256 semua artifact bundle. Adaptif terhadap model_type."""
    manifest_path = models_dir / "compatibility_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    fitted_filename = manifest.get(
        "fitted_filename",
        _FITTED_FILENAMES.get(manifest.get("model_type", "tabpfn"), "hrs_tabpfn_fitted.tabpfn_fit"),
    )
    expected_paths = {
        "preprocessor": models_dir / "hrs_preprocessor.joblib",
        "fitted_model": models_dir / fitted_filename,
        "metadata": models_dir / "model_metadata.json",
        "shap_background": models_dir / "shap_background.parquet",
    }
    actual = {name: sha256_file(path) for name, path in expected_paths.items()}
    if actual != manifest["artifact_sha256"]:
        raise RuntimeError("Checksum artifact model tidak cocok dengan manifest")
    return manifest

