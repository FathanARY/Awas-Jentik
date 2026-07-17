"""Group-aware split utilities untuk semua model (RF, XGBoost, TabPFN)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterator

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold, GroupShuffleSplit


@dataclass(frozen=True)
class HoldoutSplit:
    train_indices: np.ndarray
    test_indices: np.ndarray
    train_groups: tuple[str, ...]
    test_groups: tuple[str, ...]


def make_holdout_split(frame: pd.DataFrame, config: dict) -> HoldoutSplit:
    group_column = config["schema"]["group_column"]
    groups = frame[group_column].astype(str).to_numpy()
    splitter = GroupShuffleSplit(
        n_splits=1,
        test_size=float(config["training"]["test_size"]),
        random_state=int(config["training"]["random_seed"]),
    )
    train_indices, test_indices = next(splitter.split(frame, groups=groups))
    train_groups = tuple(sorted(set(groups[train_indices])))
    test_groups = tuple(sorted(set(groups[test_indices])))
    if set(train_groups).intersection(test_groups):
        raise RuntimeError("Leakage grup antara train dan holdout")
    return HoldoutSplit(train_indices, test_indices, train_groups, test_groups)


def iter_group_folds(
    frame: pd.DataFrame, config: dict
) -> Iterator[tuple[np.ndarray, np.ndarray]]:
    group_column = config["schema"]["group_column"]
    groups = frame[group_column].astype(str).to_numpy()
    splitter = GroupKFold(n_splits=int(config["training"]["cv_folds"]))
    yield from splitter.split(frame, groups=groups)


def make_cv_splitter(config: dict) -> GroupKFold:
    """Buat GroupKFold instance untuk dipakai sebagai cv= di RandomizedSearchCV."""
    return GroupKFold(n_splits=int(config["training"]["cv_folds"]))
