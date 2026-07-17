# Garuda70 — TabPFN Habitat Risk PoC

Implementasi PoC untuk penilaian risiko habitat vektor malaria berbasis dataset sintetis. Model utama dan satu-satunya adalah TabPFN V2; sistem ini bukan alat diagnosis malaria.

## Setup

Environment dan lock dependency sudah disiapkan untuk Python 3.12 serta PyTorch CUDA 12.8. Jalankan perintah berikut dari root proyek:

```powershell
$env:UV_CACHE_DIR = "$PWD\.uv-cache"
.\.bootstrap-venv\Scripts\uv.exe sync
```

## Urutan eksekusi

```powershell
.\.bootstrap-venv\Scripts\uv.exe run python -m src.data.generate
.\.bootstrap-venv\Scripts\uv.exe run pytest -q
.\.bootstrap-venv\Scripts\uv.exe run ruff check .
```

Sebelum prefetch/training, terima lisensi TabPFN V2 di https://ux.priorlabs.ai dan set token hanya pada session shell:

```powershell
$env:TABPFN_TOKEN = "<token-anda>"
.\.bootstrap-venv\Scripts\uv.exe run python -m scripts.prefetch_tabpfn_checkpoint
.\.bootstrap-venv\Scripts\uv.exe run python -m src.models.train
.\.bootstrap-venv\Scripts\uv.exe run python -m scripts.verify_model_bundle
.\.bootstrap-venv\Scripts\uv.exe run uvicorn src.api.main:app --reload
```

Token tidak boleh disimpan dalam config, source code, database audit, atau Git.
