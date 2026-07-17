import shutil
import tempfile
from pathlib import Path

import pandas as pd

from src.data.generate import generate_training_dataset
from src.data.split import make_holdout_split
from src.data.validation import validate_training_frame
from src.settings import load_config, project_path


def test_generated_dataset_is_valid_and_group_safe():
    # Gunakan tempdir lokal di dalam proyek agar tidak bergantung pada
    # C:\Users\HP\AppData\Local\Temp yang sering access-denied di Windows.
    tmp = Path(tempfile.mkdtemp(dir=project_path(".pytest_tmp")))
    try:
        config = load_config()
        output = tmp / "training.parquet"
        manifest = tmp / "training.manifest.json"
        frame = generate_training_dataset(
            project_path("dataset_dummy_malaria_desa_harapan_jaya.xlsx"),
            output,
            manifest,
            config,
        )
        assert output.exists()
        assert manifest.exists()
        assert len(frame) == 2400
        assert validate_training_frame(frame, config).rows == 2400
        split = make_holdout_split(frame, config)
        assert set(split.train_groups).isdisjoint(split.test_groups)
        assert len(pd.read_parquet(output)) == 2400
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

