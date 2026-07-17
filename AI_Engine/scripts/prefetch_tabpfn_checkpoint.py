"""Prefetch and inventory the licensed TabPFN V2 checkpoint for local use."""

from __future__ import annotations

import json
import os

import numpy as np

from src.features.schema import model_feature_columns
from src.settings import load_config, project_path


def main() -> None:
    config = load_config()
    cache_dir = project_path(config["tabpfn"]["cache_directory"])
    cache_dir.mkdir(parents=True, exist_ok=True)
    os.environ["TABPFN_MODEL_CACHE_DIR"] = str(cache_dir)

    # TabPFN V2 menggunakan TABPFN_TOKEN. HF_TOKEN (Hugging Face) diterima sebagai
    # fallback dan di-forward agar library TabPFN bisa membacanya.
    tabpfn_token = os.getenv("TABPFN_TOKEN") or os.getenv("HF_TOKEN")
    if not tabpfn_token:
        raise SystemExit(
            "Token belum tersedia. Set salah satu:\n"
            "  $env:TABPFN_TOKEN = '<token Prior Labs dari https://ux.priorlabs.ai>'\n"
            "  $env:HF_TOKEN     = '<token Hugging Face dari https://huggingface.co/settings/tokens>'"
        )
    os.environ["TABPFN_TOKEN"] = tabpfn_token

    from src.models.tabpfn import (
        checkpoint_inventory,
        create_regressor,
        resolve_runtime,
        validate_preflight,
    )

    runtime = resolve_runtime(config)
    feature_count = len(model_feature_columns(config))
    validate_preflight(16, feature_count, config, runtime)
    model = create_regressor(config, runtime)
    x_train = np.arange(16 * feature_count, dtype=float).reshape(16, feature_count)
    y_train = np.linspace(10, 90, 16)
    model.fit(x_train, y_train)
    model.predict(x_train[:1])
    inventory = checkpoint_inventory(cache_dir)
    if not inventory:
        raise RuntimeError("Checkpoint TabPFN tidak ditemukan setelah prefetch")
    manifest = {
        "model_version": config["tabpfn"]["model_version"],
        "license": config["tabpfn"]["model_license"],
        "runtime": runtime.as_dict(),
        "checkpoint_inventory": inventory,
    }
    manifest_path = cache_dir / "checkpoint_manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Checkpoint manifest tersimpan: {manifest_path}")


if __name__ == "__main__":
    main()
