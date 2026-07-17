"""Pipeline training 3-arah: RF baseline, XGBoost kandidat, TabPFN utama."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.data.split import iter_group_folds, make_holdout_split
from src.data.validation import validate_training_frame
from src.features.preprocess import feature_frame, make_preprocessor
from src.features.schema import model_feature_columns
from src.models.baseline import refit_on_full_training as refit_rf
from src.models.baseline import run_baseline_cv
from src.models.serialization import save_model_bundle
from src.models.tabpfn import (
    checkpoint_inventory,
    configure_model_cache,
    create_regressor,
    resolve_runtime,
    validate_preflight,
)
from src.models.xgboost_candidate import refit_on_full_training as refit_xgb
from src.models.xgboost_candidate import run_xgb_cv
from src.settings import load_config, project_path


def _metrics(y_true: Any, prediction: Any, elapsed_seconds: float) -> dict[str, float]:
    return {
        "mae": round(float(mean_absolute_error(y_true, prediction)), 6),
        "rmse": round(float(mean_squared_error(y_true, prediction) ** 0.5), 6),
        "r2": round(float(r2_score(y_true, prediction)), 6),
        "predict_seconds": round(elapsed_seconds, 6),
    }


def _fit_predict_tabpfn(
    train_frame: pd.DataFrame,
    valid_frame: pd.DataFrame,
    config: dict[str, Any],
    runtime: Any,
) -> tuple[Any, Any, Any, float, float]:
    """Fit preprocessor + TabPFN pada fold-train, prediksi fold-valid."""
    preprocessor = make_preprocessor(config)
    x_train = preprocessor.fit_transform(feature_frame(train_frame, config))
    x_valid = preprocessor.transform(feature_frame(valid_frame, config))
    target = config["schema"]["target_column"]
    model = create_regressor(config, runtime)
    t0 = time.perf_counter()
    model.fit(x_train, train_frame[target].to_numpy())
    fit_seconds = time.perf_counter() - t0
    t0 = time.perf_counter()
    prediction = model.predict(x_valid)
    prediction_seconds = time.perf_counter() - t0
    return model, preprocessor, prediction, fit_seconds, prediction_seconds


def _mean_mae(fold_metrics: list[dict[str, Any]]) -> float:
    return sum(m["mae"] for m in fold_metrics) / len(fold_metrics)


def _mean_r2(fold_metrics: list[dict[str, Any]]) -> float:
    return sum(m["r2"] for m in fold_metrics) / len(fold_metrics)


def _select_winner(
    rf_mae: float,
    xgb_mae: float,
    tabpfn_mae: float,
    config: dict[str, Any],
) -> str:
    """Pilih winner berdasarkan MAE terkecil. Tie-break ke config.training.tie_break_winner."""
    scores = {
        "random_forest_regressor": rf_mae,
        "xgboost_regressor": xgb_mae,
        "tabpfn_regressor": tabpfn_mae,
    }
    best_mae = min(scores.values())
    winners = [k for k, v in scores.items() if v == best_mae]
    if len(winners) == 1:
        return winners[0]
    tie_break = str(config["training"].get("tie_break_winner", "tabpfn_regressor"))
    return tie_break if tie_break in winners else winners[0]


def run_training(
    dataset_path: Path, reports_dir: Path, models_dir: Path, config: dict[str, Any]
) -> dict[str, Any]:
    frame = pd.read_parquet(dataset_path)
    validation = validate_training_frame(frame, config)
    runtime = resolve_runtime(config)
    validate_preflight(
        len(frame),
        len(model_feature_columns(config)),
        config,
        runtime,
    )
    cache_dir = configure_model_cache(config, project_path())
    holdout = make_holdout_split(frame, config)
    training_frame = frame.iloc[holdout.train_indices].reset_index(drop=True)
    holdout_frame = frame.iloc[holdout.test_indices].reset_index(drop=True)
    target = config["schema"]["target_column"]

    # -- Fase 1: CV ketiga model ------------------------------------------------
    print("[1/4] CV Random Forest baseline...")
    rf_fold_metrics = run_baseline_cv(training_frame, config)
    rf_mean_mae = _mean_mae(rf_fold_metrics)
    rf_mean_r2 = _mean_r2(rf_fold_metrics)
    print(f"      RF  -> mean MAE={rf_mean_mae:.4f}, mean R2={rf_mean_r2:.4f}")

    print("[2/4] CV XGBoost (RandomizedSearch + GroupKFold)...")
    xgb_fold_metrics, xgb_best_params = run_xgb_cv(training_frame, config)
    xgb_mean_mae = _mean_mae(xgb_fold_metrics)
    xgb_mean_r2 = _mean_r2(xgb_fold_metrics)
    print(f"      XGB -> mean MAE={xgb_mean_mae:.4f}, mean R2={xgb_mean_r2:.4f}")

    print("[3/4] CV TabPFN (5-fold GroupKFold)...")
    tabpfn_fold_metrics: list[dict[str, Any]] = []
    for fold, (train_idx, valid_idx) in enumerate(
        iter_group_folds(training_frame, config), start=1
    ):
        fold_train = training_frame.iloc[train_idx]
        fold_valid = training_frame.iloc[valid_idx]
        validate_preflight(
            len(fold_train),
            len(model_feature_columns(config)),
            config,
            runtime,
        )
        _, _, prediction, fit_sec, predict_sec = _fit_predict_tabpfn(
            fold_train, fold_valid, config, runtime
        )
        metric = _metrics(fold_valid[target], prediction, predict_sec)
        metric.update({"fold": fold, "fit_seconds": round(fit_sec, 6)})
        tabpfn_fold_metrics.append(metric)
    tabpfn_mean_mae = _mean_mae(tabpfn_fold_metrics)
    tabpfn_mean_r2 = _mean_r2(tabpfn_fold_metrics)
    print(f"      TABPFN -> mean MAE={tabpfn_mean_mae:.4f}, mean R2={tabpfn_mean_r2:.4f}")

    # -- Quality gate: semua kandidat harus lulus threshold minimum -------------
    quality = config["training"]["quality_gate"]
    for model_name, mean_mae, mean_r2 in [
        ("RF", rf_mean_mae, rf_mean_r2),
        ("XGBoost", xgb_mean_mae, xgb_mean_r2),
        ("TabPFN", tabpfn_mean_mae, tabpfn_mean_r2),
    ]:
        if mean_mae > float(quality["max_cv_mae"]) or mean_r2 < float(quality["min_cv_r2"]):
            raise RuntimeError(
                f"Gate kualitas gagal untuk {model_name}: "
                f"MAE={mean_mae:.4f}, R2={mean_r2:.4f}"
            )

    # -- Pilih winner ----------------------------------------------------------
    winner_key = _select_winner(rf_mean_mae, xgb_mean_mae, tabpfn_mean_mae, config)
    winner_mae = {"random_forest_regressor": rf_mean_mae,
                  "xgboost_regressor": xgb_mean_mae,
                  "tabpfn_regressor": tabpfn_mean_mae}[winner_key]
    print(f"\n[4/4] Winner: {winner_key} (mean MAE={winner_mae:.4f})")

    # -- Fase 2: Refit winner pada 80% training ---------------------------------
    xgb_best_params_out: dict[str, Any] = {}
    if winner_key == "tabpfn_regressor":
        model_version = "hrs-tabpfn-v2"
        model_type = "tabpfn"
        winner_model, winner_preprocessor, holdout_pred, fit_sec, predict_sec = (
            _fit_predict_tabpfn(training_frame, holdout_frame, config, runtime)
        )
    elif winner_key == "xgboost_regressor":
        model_version = "hrs-xgboost-v1"
        model_type = "xgboost"
        xgb_best_params_out = xgb_best_params
        winner_model, winner_preprocessor = refit_xgb(
            training_frame, config, xgb_best_params
        )
        x_holdout = winner_preprocessor.transform(feature_frame(holdout_frame, config))
        t0 = time.perf_counter()
        holdout_pred = np.clip(winner_model.predict(x_holdout), 0, 100)
        predict_sec = time.perf_counter() - t0
        t0 = time.perf_counter()  # fit already done in refit
        fit_sec = 0.0
    else:  # random_forest_regressor
        model_version = "hrs-rf-baseline-v1"
        model_type = "random_forest"
        winner_model, winner_preprocessor = refit_rf(training_frame, config)
        x_holdout = winner_preprocessor.transform(feature_frame(holdout_frame, config))
        t0 = time.perf_counter()
        holdout_pred = np.clip(winner_model.predict(x_holdout), 0, 100)
        predict_sec = time.perf_counter() - t0
        fit_sec = 0.0

    holdout_metrics = _metrics(holdout_frame[target], holdout_pred, predict_sec)
    holdout_metrics["fit_seconds"] = round(fit_sec, 6)
    print(f"      Holdout -> MAE={holdout_metrics['mae']:.4f}, R2={holdout_metrics['r2']:.4f}")

    # -- Background SHAP dari training set -------------------------------------
    background_size = min(
        int(config["tabpfn"]["shap_background_size"]), len(training_frame)
    )
    background = training_frame.sample(
        n=background_size, random_state=int(config["training"]["random_seed"])
    )[model_feature_columns(config)]

    # ── Simpan laporan perbandingan 3 model ───────────────────────────────────
    comparison_table = {
        "random_forest_regressor": {
            "mean_mae": round(rf_mean_mae, 6),
            "mean_r2": round(rf_mean_r2, 6),
            "fold_metrics": rf_fold_metrics,
        },
        "xgboost_regressor": {
            "mean_mae": round(xgb_mean_mae, 6),
            "mean_r2": round(xgb_mean_r2, 6),
            "best_params": xgb_best_params,
            "fold_metrics": xgb_fold_metrics,
        },
        "tabpfn_regressor": {
            "mean_mae": round(tabpfn_mean_mae, 6),
            "mean_r2": round(tabpfn_mean_r2, 6),
            "fold_metrics": tabpfn_fold_metrics,
        },
    }
    report = {
        "model_version": model_version,
        "winner": winner_key,
        "winner_selection_reason": (
            f"MAE terkecil di antara 3 kandidat: RF={rf_mean_mae:.4f}, "
            f"XGBoost={xgb_mean_mae:.4f}, TabPFN={tabpfn_mean_mae:.4f}. "
            f"Tie-break rule: {config['training'].get('tie_break_winner', 'tabpfn_regressor')}."
        ),
        "dataset": {
            "fingerprint": validation.fingerprint,
            "rows": validation.rows,
            "columns": validation.columns,
        },
        "runtime": runtime.as_dict(),
        "split": {
            "train_groups": list(holdout.train_groups),
            "holdout_groups": list(holdout.test_groups),
        },
        "comparison": comparison_table,
        "holdout": holdout_metrics,
        "checkpoint_inventory": checkpoint_inventory(cache_dir),
    }
    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "experiment_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # ── Simpan bundle winner ───────────────────────────────────────────────────
    metadata = {
        "model_version": model_version,
        "model_type": model_type,
        "winner": winner_key,
        "feature_order": model_feature_columns(config),
        "dataset_fingerprint": validation.fingerprint,
        "mapping_version": config["dataset"]["mapping_version"],
        "runtime": runtime.as_dict(),
        "holdout_metrics": holdout_metrics,
        "checkpoint_inventory": report["checkpoint_inventory"],
        "xgb_best_params": xgb_best_params_out,
    }
    save_model_bundle(
        model=winner_model,
        preprocessor=winner_preprocessor,
        metadata=metadata,
        background_frame=background,
        models_dir=models_dir,
        model_type=model_type,
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dataset",
        type=Path,
        default=project_path("data", "processed", "habitat_training.parquet"),
    )
    args = parser.parse_args()
    run_training(
        args.dataset,
        project_path("reports"),
        project_path("models"),
        load_config(),
    )


if __name__ == "__main__":
    main()

