"""XGBoost kandidat dengan RandomizedSearchCV untuk perbandingan 3-arah."""

from __future__ import annotations

import time
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import RandomizedSearchCV
from xgboost import XGBRegressor

from src.data.split import iter_group_folds, make_cv_splitter
from src.features.preprocess import feature_frame, make_preprocessor


def _xgb_search_space() -> dict[str, list[Any]]:
    """Parameter grid untuk RandomizedSearchCV XGBoost."""
    return {
        "n_estimators": [100, 200, 300, 500],
        "max_depth": [3, 4, 5, 6, 7],
        "learning_rate": [0.01, 0.05, 0.1, 0.2, 0.3],
        "subsample": [0.6, 0.7, 0.8, 0.9, 1.0],
        "colsample_bytree": [0.6, 0.7, 0.8, 0.9, 1.0],
        "reg_lambda": [0.0, 0.1, 1.0, 5.0, 10.0],
        "min_child_weight": [1, 3, 5],
    }


def _fit_predict_xgb(
    train_frame: pd.DataFrame,
    valid_frame: pd.DataFrame,
    config: dict[str, Any],
    best_params: dict[str, Any] | None = None,
) -> tuple[XGBRegressor, Any, Any, float, float]:
    """Fit preprocessor + XGBoost pada fold-train, prediksi fold-valid."""
    preprocessor = make_preprocessor(config)
    x_train = preprocessor.fit_transform(feature_frame(train_frame, config))
    x_valid = preprocessor.transform(feature_frame(valid_frame, config))
    target = config["schema"]["target_column"]

    params = best_params or {}
    model = XGBRegressor(
        random_state=int(config["training"]["random_seed"]),
        n_jobs=-1,
        verbosity=0,
        **params,
    )

    t0 = time.perf_counter()
    model.fit(x_train, train_frame[target].to_numpy())
    fit_seconds = time.perf_counter() - t0

    t0 = time.perf_counter()
    prediction = model.predict(x_valid)
    predict_seconds = time.perf_counter() - t0

    return model, preprocessor, prediction, fit_seconds, predict_seconds


def run_xgb_cv(
    training_frame: pd.DataFrame,
    config: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Jalankan RandomizedSearchCV + GroupKFold untuk XGBoost.

    Strategi: cari best_params dari fold pertama (pakai inner GroupKFold),
    lalu terapkan params tersebut ke semua fold untuk perbandingan yang fair.
    Return (fold_metrics, best_params).
    """
    target = config["schema"]["target_column"]
    seed = int(config["training"]["random_seed"])
    n_iter = int(config["training"]["xgboost_random_search_iterations"])

    # --- Cari best_params via RandomizedSearchCV pada seluruh training_frame ---
    preprocessor_search = make_preprocessor(config)
    x_full = preprocessor_search.fit_transform(feature_frame(training_frame, config))
    y_full = training_frame[target].to_numpy()

    inner_cv = make_cv_splitter(config)
    groups = training_frame[config["schema"]["group_column"]].to_numpy()

    search = RandomizedSearchCV(
        XGBRegressor(random_state=seed, n_jobs=-1, verbosity=0),
        param_distributions=_xgb_search_space(),
        n_iter=n_iter,
        scoring="neg_mean_absolute_error",
        cv=inner_cv,
        random_state=seed,
        n_jobs=1,
        refit=False,
    )
    search.fit(x_full, y_full, groups=groups)
    best_params: dict[str, Any] = search.best_params_

    # --- Evaluasi per fold dengan best_params agar metrik comparable dengan RF/TabPFN ---
    fold_metrics: list[dict[str, Any]] = []
    for fold, (train_idx, valid_idx) in enumerate(
        iter_group_folds(training_frame, config), start=1
    ):
        fold_train = training_frame.iloc[train_idx]
        fold_valid = training_frame.iloc[valid_idx]
        _, _, prediction, fit_sec, predict_sec = _fit_predict_xgb(
            fold_train, fold_valid, config, best_params=best_params
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
    return fold_metrics, best_params


def refit_on_full_training(
    training_frame: pd.DataFrame,
    config: dict[str, Any],
    best_params: dict[str, Any],
) -> tuple[XGBRegressor, Any]:
    """Refit XGBoost + preprocessor pada seluruh 80% training dengan best_params."""
    preprocessor = make_preprocessor(config)
    x_train = preprocessor.fit_transform(feature_frame(training_frame, config))
    target = config["schema"]["target_column"]
    model = XGBRegressor(
        random_state=int(config["training"]["random_seed"]),
        n_jobs=-1,
        verbosity=0,
        **best_params,
    )
    model.fit(x_train, training_frame[target].to_numpy())
    return model, preprocessor


def predict_xgb(
    model: XGBRegressor,
    preprocessor: Any,
    valid_frame: pd.DataFrame,
    config: dict[str, Any],
) -> np.ndarray:
    """Transform + predict untuk holdout atau serving. Output di-clip ke [0, 100]."""
    x = preprocessor.transform(feature_frame(valid_frame, config))
    return np.clip(model.predict(x), 0, 100)
