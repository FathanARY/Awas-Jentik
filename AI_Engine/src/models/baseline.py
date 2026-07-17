"""Random Forest baseline untuk perbandingan 3-arah (RF vs XGBoost vs TabPFN)."""

from __future__ import annotations

import time
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.data.split import iter_group_folds
from src.features.preprocess import feature_frame, make_preprocessor


def create_rf_baseline(config: dict[str, Any]) -> RandomForestRegressor:
    """Buat Random Forest dengan seed dari config — tanpa tuning hyperparameter."""
    return RandomForestRegressor(
        n_estimators=100,
        random_state=int(config["training"]["random_seed"]),
        n_jobs=-1,
    )


def _fit_predict_rf(
    train_frame: pd.DataFrame,
    valid_frame: pd.DataFrame,
    config: dict[str, Any],
) -> tuple[RandomForestRegressor, Any, Any, float, float]:
    """Fit preprocessor + RF pada fold-train, prediksi fold-valid."""
    preprocessor = make_preprocessor(config)
    x_train = preprocessor.fit_transform(feature_frame(train_frame, config))
    x_valid = preprocessor.transform(feature_frame(valid_frame, config))
    target = config["schema"]["target_column"]
    model = create_rf_baseline(config)

    t0 = time.perf_counter()
    model.fit(x_train, train_frame[target].to_numpy())
    fit_seconds = time.perf_counter() - t0

    t0 = time.perf_counter()
    prediction = model.predict(x_valid)
    predict_seconds = time.perf_counter() - t0

    return model, preprocessor, prediction, fit_seconds, predict_seconds


def run_baseline_cv(
    training_frame: pd.DataFrame,
    config: dict[str, Any],
) -> list[dict[str, Any]]:
    """Jalankan GroupKFold CV untuk RF baseline. Return list fold metrics."""
    target = config["schema"]["target_column"]
    fold_metrics: list[dict[str, Any]] = []
    for fold, (train_idx, valid_idx) in enumerate(
        iter_group_folds(training_frame, config), start=1
    ):
        fold_train = training_frame.iloc[train_idx]
        fold_valid = training_frame.iloc[valid_idx]
        _, _, prediction, fit_sec, predict_sec = _fit_predict_rf(
            fold_train, fold_valid, config
        )
        y_true = fold_valid[target]
        fold_metrics.append(
            {
                "fold": fold,
                "mae": round(float(mean_absolute_error(y_true, prediction)), 6),
                "rmse": round(
                    float(mean_squared_error(y_true, prediction) ** 0.5), 6
                ),
                "r2": round(float(r2_score(y_true, prediction)), 6),
                "fit_seconds": round(fit_sec, 6),
                "predict_seconds": round(predict_sec, 6),
            }
        )
    return fold_metrics


def refit_on_full_training(
    training_frame: pd.DataFrame,
    config: dict[str, Any],
) -> tuple[RandomForestRegressor, Any]:
    """Refit RF + preprocessor pada seluruh 80% training. Return (model, preprocessor)."""
    preprocessor = make_preprocessor(config)
    x_train = preprocessor.fit_transform(feature_frame(training_frame, config))
    target = config["schema"]["target_column"]
    model = create_rf_baseline(config)
    model.fit(x_train, training_frame[target].to_numpy())
    return model, preprocessor


def predict_rf(
    model: RandomForestRegressor,
    preprocessor: Any,
    valid_frame: pd.DataFrame,
    config: dict[str, Any],
) -> np.ndarray:
    """Transform + predict untuk holdout atau serving. Output di-clip ke [0, 100]."""
    x = preprocessor.transform(feature_frame(valid_frame, config))
    return np.clip(model.predict(x), 0, 100)
