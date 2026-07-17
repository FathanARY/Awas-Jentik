"""Verify integrity of the persisted model bundle (winner: XGBoost, TabPFN, or RF)."""

from __future__ import annotations

from src.models.serialization import verify_model_bundle
from src.settings import project_path


def main() -> None:
    manifest = verify_model_bundle(project_path("models"))
    print(
        "Bundle valid untuk model "
        f"{manifest['model_version']} dengan {len(manifest['artifact_sha256'])} artifact."
    )


if __name__ == "__main__":
    main()
