# ============================================================
# Garuda70 — Dockerfile (Opsi A: XGBoost Runtime Only)
# Platform target: Railway.app
# Exclude: torch, tabpfn (hanya dipakai saat training, bukan inferensi)
# ============================================================

FROM python:3.12-slim

WORKDIR /app

# ── System dependencies ─────────────────────────────────────
# curl diperlukan oleh HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Package manager ─────────────────────────────────────────
RUN pip install --no-cache-dir uv

# ── Dependency layer (di-cache bila pyproject.toml tidak berubah) ──
COPY pyproject.toml uv.lock ./

# Install HANYA dependency runtime inferensi.
# torch & tabpfn SENGAJA dihilangkan — XGBoost tidak butuh GPU.
RUN uv pip install --system --no-cache \
    "fastapi>=0.139.2" \
    "uvicorn[standard]>=0.51.0" \
    "pydantic>=2.13.4" \
    "joblib>=1.5.3" \
    "pandas>=3.0.3" \
    "pyarrow>=25.0.0" \
    "scikit-learn>=1.9.0" \
    "xgboost>=2.1.0" \
    "shap>=0.52.0" \
    "pyyaml>=6.0.3" \
    "openpyxl>=3.1.5" \
    "python-multipart>=0.0.32"

# ── Non-root user (security best practice) ──────────────────
RUN groupadd --gid 1001 garuda && \
    useradd --uid 1001 --gid garuda --no-create-home --shell /sbin/nologin garuda

# ── Application source ──────────────────────────────────────
COPY --chown=garuda:garuda src/ ./src/
COPY --chown=garuda:garuda config/ ./config/
COPY --chown=garuda:garuda dataset_dummy_malaria_desa_harapan_jaya.xlsx ./

# PENTING: Model artifact di-bake langsung ke image.
# File-file ini ada di .gitignore dan tidak bisa dibawa lewat git push.
COPY --chown=garuda:garuda models/ ./models/

# Buat direktori untuk SQLite audit database (sesuai config.yaml: data/garuda70_audit.sqlite3)
RUN mkdir -p data && chown garuda:garuda data

# ── Runtime config ───────────────────────────────────────────
USER garuda

EXPOSE 8000

# Health probe — digunakan Railway untuk memastikan container sudah siap.
# Endpoint GET /health mengembalikan {"status": "ok", "model_status": "ready"}.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -sf http://localhost:8000/health | grep -q '"status":"ok"' || exit 1

CMD ["python", "-m", "uvicorn", "src.api.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1"]
