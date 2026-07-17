# Awas-Jentik 🦟

**Awas-Jentik** adalah sistem surveilans malaria dua lapis (*two-layer participatory surveillance*) yang mengintegrasikan crowdsourcing warga dengan analitik **Explainable AI** untuk deteksi dini dan penilaian risiko habitat nyamuk secara otomatis.

> **GarudaHacks 7.0** — Track: Health  
> AI core validated at **R² = 0.927** for combined risk scoring.

---

## Arsitektur

| Layer | Deskripsi | Tech |
|-------|-----------|------|
| **FE/** | Portal warga + dashboard admin/kader | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **BE/** | REST API + ML inference | FastAPI (Python), SQLModel, PostgreSQL (Supabase) |
| ML | Risk scoring models | scikit-learn (RandomForestRegressor), pandas, numpy |

### Two-Layer Surveillance

- **Micro layer (real-time):** Warga melaporkan checklist habitat + foto genangan, direview manual oleh petugas kesehatan.
- **Macro layer (structural):** Peta risiko prediktif berbasis data mobilitas/transmigrasi + historis endemisitas.

### ML Pipeline

Bukan single black-box model, melainkan **2-model + formula**:

| Model | Fitur | Output | R² |
|-------|-------|--------|----|
| Model Habitat | 13 fitur lingkungan | `Habitat_Risk_Score` | 0.924 |
| Model Mobilitas | 4 fitur pergerakan | `Mobility_Risk_Score` | 0.639 |
| Skor Kasus | — | `clip(16 × jumlah_kasus, 0, 100)` | — |

**Risiko Gabungan** = `0.65 × Habitat + 0.20 × Mobility + 0.15 × CaseScore`

---

## Quick Start

### Prasyarat
- Node.js 18+ & npm
- Python 3.10+ & pip
- Supabase account (untuk Auth + PostgreSQL)

### Frontend

```bash
cd FE
cp .env.example .env.local    # Isi NEXT_PUBLIC_SUPABASE_URL & ANON_KEY
npm install
npm run dev                    # http://localhost:3000
```

### Backend

```bash
cd BE
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # Isi DATABASE_URL & SUPABASE_JWT_SECRET
python seed.py                 # Seed demo data (opsional)
uvicorn app.main:app --reload  # http://localhost:8000
```

### Docker (BE + FE sekaligus)

```bash
docker compose up -d            # FE:3000 + BE:8000
```

---

## Rute Halaman

| Rute | Deskripsi | Tipe |
|------|-----------|------|
| `/` | Portal warga — hero, peta komunitas, statistik | Server |
| `/lapor` | Form lapor genangan — checklist habitat + foto | Client |
| `/lapor/sukses` | Halaman sukses — skor risiko + rekomendasi | Client |
| `/login` | Login email/password + Google OAuth | Client |
| `/register` | Registrasi via Supabase Auth | Client |
| `/admin` | Dashboard admin — peta, prioritas, CSV upload | Client |
| `/admin/laporan/[id]` | Detail laporan — foto, ceklis, skor AI | SSG |
| `/kader` | Dashboard kader — verifikasi + input mobilitas | Client |
| `/riwayat` | Riwayat laporan pengguna | Client |
| `/notifikasi` | Notifikasi perubahan risiko | Client |

## API Endpoints

| Method | Route | Auth | Deskripsi |
|--------|-------|------|-----------|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/lapor` | — | Kirim laporan genangan (multipart) |
| `GET` | `/api/laporan` | — | Daftar laporan (paginated, filterable) |
| `GET` | `/api/laporan/{kode}` | — | Detail laporan |
| `POST` | `/api/laporan/{kode}/tindakan` | Kader | Tandai laporan ditangani |
| `POST` | `/api/laporan/{kode}/verify` | Kader | Verifikasi laporan |
| `POST` | `/api/predict` | — | ML risk scoring only |
| `GET` | `/api/areas` | — | Daftar area prioritas |
| `GET` | `/api/stats` | — | Statistik agregat |
| `GET` | `/api/auth/me` | User | Profil user (dari Supabase JWT) |
| `GET` | `/api/notifications` | User | Notifikasi user |
| `POST` | `/api/notifications/{id}/read` | User | Tandai notif dibaca |
| `POST` | `/api/upload-csv` | Admin | Upload CSV mobilitas |
| `GET` | `/api/grids/risk` | — | Data risiko per grid |
| `POST` | `/api/mobilitas/{grid_id}` | Kader | Input data mobilitas |

---

## Desain

Lihat [`DESIGN.md`](./DESIGN.md) untuk sistem desain lengkap — palet warna, tipografi, komponen, dan filosofi visual.

---

## Deployment

| Komponen | Target |
|----------|--------|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase (PostgreSQL) |
