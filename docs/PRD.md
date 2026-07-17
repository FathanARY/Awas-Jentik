# Product Requirements Document (PRD)
## MalariaWatch (Awas-Jentik) — Sistem Deteksi Dini & Surveilans Malaria Berbasis Crowdsourcing dan Pola Transmigrasi
GarudaHacks 7.0 | Track: Health | **v6 — Final: all kritik.md gaps closed, Supabase Auth integrated, all FE wired to BE**

> **Perubahan dari v5 → v6:**
> - (1) Semua gap dari `kritik.md` sudah ditutup: Flow Kader Input Mobilitas, CSV 3-step staging, notifikasi warga, riwayat laporan
> - (2) Auth dimigrasi dari passlib/bcrypt lokal ke Supabase Auth (JWT dari Supabase session)
> - (3) EMA smoothing + change-detection + notifikasi di-trigger saat `POST /api/lapor` (Flow 3), bukan hanya saat verifikasi kader
> - (4) Status implementasi Section 15 diperbarui: semua FE wired ke BE, 10 halaman, 7 router BE
> - (5) Semua endpoint "yatim" dari kritik.md sudah memiliki consumer: `/notifications` → halaman warga, `/areas/stale` → tab admin, `/predict` → internal service, `/grids/risk` → LiveCommunityMap

---

## 1. RINGKASAN

MalariaWatch adalah sistem surveilans partisipatif dua-lapis:
1. **Lapis Mikro (real-time):** Warga melaporkan checklist habitat (indikator ilmiah breeding site) + kader input data mobilitas agregat wilayah, diperkuat foto sebagai bukti pelengkap yang direview manual petugas
2. **Lapis Makro (struktural):** Peta risiko prediktif berbasis data migrasi riil BPS (Immunity Gap Score) digabung endemisitas historis Kemenkes

**Status AI:**
- Dataset dummy lengkap (2400 observasi training + 2500 grid desa), lolos audit konsistensi penuh
- **2 model AI dilatih dan divalidasi**: Model Habitat (R²=0,924) dan Model Mobilitas (R²=0,639), digabung lewat formula transparan → Risiko Gabungan R²=0,927, MAE=2,86
- Arsitektur final: **formula transparan (bobot 0,65/0,20/0,15) + 2 RandomForest ringan**, bukan model kotak-hitam tunggal

**Baru di v6 — Semua gap kritik.md ditutup:**
- Kader Input Mobilitas: endpoint `POST /api/mobilitas/{grid_id}` + halaman `/kader` dengan tab input mobilitas — Model Mobilitas (bobot 20% dari formula) tidak lagi tanpa input real
- CSV 3-step staging: preview → review ringkasan → confirm/cancel — mitigasi worst-case admin salah upload massal
- Notifikasi warga: halaman `/notifikasi` + bell icon di Header dengan unread count (polling 30s)
- Riwayat laporan warga: halaman `/riwayat` dengan expandable AI breakdown per komponen
- Auth dimigrasi ke Supabase Auth: registrasi/login via Supabase, JWT session digunakan untuk semua API calls
- EMA smoothing sekarang jalan di `POST /api/lapor` (Flow 3) — change-detection + notifikasi tidak menunggu verifikasi kader

---

## 2. LATAR BELAKANG & MASALAH

**Data terbaru (Kemenkes, 30 April 2026):**
- 706.297 kasus malaria di Indonesia tahun 2025 — **naik 30%** dari 543.965 kasus di 2024
- **95% kasus terkonsentrasi di Tanah Papua** (6 provinsi)
- 412 dari 514 kabupaten/kota (80%) sudah berstatus **Bebas Malaria**, dengan target eliminasi nasional 2030
- Risiko **re-establishment** (penularan kembali) di daerah yang sudah bebas malaria
- Strategi resmi Kemenkes: **TOKEN** (Temukan, Obati, Kendalikan Vektor), fokus ke **Mobile Migrant Population**

Dua masalah struktural:
**a. Kesenjangan surveilans** — SISMAL bersifat reaktif, mencatat setelah pasien terdiagnosis, tidak menjangkau breeding site sebelum jadi kasus.
**b. Blind spot populasi mobile** — pekerja tambang/hutan/kebun, pendatang dari daerah endemis tidak terpantau.

### 2.1 Reposisi vs SISMAL

| | SISMAL (Kemenkes) | MalariaWatch |
|---|---|---|
| Titik masuk data | Setelah pasien terdiagnosis | Sebelum ada kasus (breeding site + mobilitas berisiko) |
| Sifat | Reaktif | Early-warning, prediktif |
| Cakupan | Kasus terkonfirmasi | Termasuk memantau **re-establishment risk** di 412 daerah bebas malaria |

---

## 3. GOALS

**Goals (Fase 1 — MVP Hackathon):**
1. Warga melaporkan checklist habitat + foto verifikasi dalam <2 menit, lokasi GPS otomatis
2. Sistem menghasilkan skor risiko tervalidasi (Habitat, Mobilitas, Gabungan) via model AI (R²=0,927)
3. EMA smoothing + change-detection + notifikasi berjalan di setiap laporan baru (tidak menunggu verifikasi)
4. Kader bisa input data mobilitas 30 hari per grid → Model Mobilitas (bobot 20%) mendapatkan input real
5. Admin punya kemampuan bulk-upload CSV dengan staging/preview + confirm/cancel, serta visibilitas panel perubahan
6. Sistem menandai grid tanpa data >60 hari sebagai "stale" (tidak ditampilkan sebagai "aman")
7. Semua klaim teknis bisa dipertanggungjawabkan dengan bukti kuantitatif

**Non-Goals:**
- Sistem TIDAK mendiagnosis malaria pada manusia
- Sistem TIDAK menggunakan computer vision untuk foto (Fase 1) — foto adalah bukti manual untuk petugas
- Sistem TIDAK mengklasifikasi spesies nyamuk
- Sistem TIDAK menggantikan atau menduplikasi SISMAL

---

## 4. TARGET PENGGUNA

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Warga Pelapor** | Penduduk area transmigrasi/endemis | Lapor cepat via form, lihat riwayat laporan + breakdown AI, terima notifikasi |
| **Kader Kesehatan** | Puskesmas/Dinkes tingkat desa | Verifikasi laporan, input mobilitas agregat per grid, lihat dashboard prioritas |
| **Admin/Dinkes** | Pemangku kebijakan level kabupaten | Bulk CSV staging, panel perubahan, audit trail, gambaran tren system-wide |

---

## 5. ARSITEKTUR AI: 2 MODEL + FORMULA TRANSPARAN

```
Risiko_Gabungan = 0,65 × Habitat_Risk_Score + 0,20 × Mobility_Risk_Score + 0,15 × Skor_Kasus
```

| Komponen | Jenis | Input | Validasi |
|---|---|---|---|
| **Model Habitat** | RandomForestRegressor | 13 fitur lingkungan (lumut, vegetasi, air tenang, paparan matahari, luas genangan, curah hujan, 7 jarak) | R²=0,924, MAE=3,72 |
| **Model Mobilitas** | RandomForestRegressor | Pendatang_30_Hari, Pendatang_Dari_Endemis, Pekerja_Mobil, Riwayat_Perjalanan_Endemis | R²=0,639, MAE=10,98 |
| **Skor Kasus** | Formula langsung | Kasus_Malaria_1km_30Hari | `clip(16 × jumlah_kasus, 0, 100)` |
| **Kombinasi** | Weighted sum | 3 komponen di atas | R²=0,927, MAE=2,86 |

Feature importance Model Habitat: `Air_Tenang` (51%) — defensible secara domain (air tenang adalah prasyarat breeding Anopheles).

---

## 6. FITUR & REQUIREMENTS (Fase 1)

### 6.1 Form Checklist Habitat

| Field | Tipe | Sumber |
|---|---|---|
| Persentase Lumut | 0–100% | Observasi warga |
| Persentase Vegetasi | 0–100% | Observasi warga |
| Air Tenang | Ya/Tidak | Observasi warga |
| Paparan Matahari | Rendah/Sedang/Tinggi | Observasi warga |
| Luas Genangan | m² | Observasi warga |
| Curah Hujan 30 Hari | mm | Input default/hardcoded (Fase 1) |
| Jarak ke Hutan/Sawah/Sungai/Rawa/Tambang/Permukiman/Puskesmas | meter | Hardcoded default (Fase 1) |

### 6.2 Form Checklist Mobilitas — **Diisi Kader (bukan warga)**

| Field | Tipe | Catatan |
|---|---|---|
| Pendatang 30 Hari | jumlah orang | Agregat tingkat grid/desa |
| Pendatang dari Daerah Endemis | jumlah orang | Subset dari atas |
| Pekerja Mobil (tambang/hutan/kebun) | jumlah orang | Estimasi kader |
| Riwayat Perjalanan ke Daerah Endemis | jumlah orang/12 bulan | Estimasi kader |

**Mode input:**
- **Individual per grid:** Kader buka `/kader` → tab "Input Mobilitas" → pilih grid → isi 4 field → submit → ML scoring + EMA smoothing → lihat risk breakdown
- **Bulk CSV:** Admin upload CSV via `/admin` → preview → confirm/cancel (Section 7.1)

### 6.3 Upload Foto

Foto tidak diproses AI — lampiran untuk cross-check manual petugas. Sensitivitas deteksi visual larva oleh non-ahli ~12,6%.

### 6.4 Location Capture

GPS via peta interaktif (50×50 grid canvas), reverse geocoding via Nominatim (OpenStreetMap), grid ID dihitung dari koordinat.

### 6.5 Risk Scoring Engine

Lihat Section 5 — formula dan bobot tervalidasi kuantitatif. Setiap laporan baru langsung trigger:
1. ML inference (2 model)
2. EMA smoothing (dengan riwayat area sebelumnya)
3. Change-detection (bandingkan kategori baru vs lama)
4. Simpan ke `RiwayatRisiko`
5. Trigger notifikasi jika kategori naik

### 6.6 Dashboard Petugas

Peta heatmap real-time (polling tiap 5 detik) + daftar prioritas + detail laporan (checklist + foto + AI breakdown per komponen) + verifikasi + tindak lanjut.

### 6.7 Notifikasi Otomatis

Trigger: change-detection mendeteksi kenaikan kategori. Kategori: 4-level (Sangat Rendah/Rendah/Sedang/Tinggi). Batas lompatan: maks 1 tingkat kecuali cluster darurat (≥3 laporan high-risk dalam 7 hari).

---

## 7. FITUR PCEM — STATUS: ✅ IMPLEMENTED

### 7.1 Input CSV Admin dengan Staging 3-Langkah

**Skema CSV:**
```
Grid_ID, Periode_Akhir, Pendatang_30_Hari, Pendatang_Dari_Endemis, Pekerja_Mobil, Riwayat_Perjalanan_Endemis
```

**Alur (3 langkah):**
1. Admin upload file → `POST /api/upload-csv/preview` → validasi kolom + tipe data + nilai → return `upload_id` + ringkasan
2. Modal preview tampil: "X grid akan diperbarui, Y baris invalid" + daftar error per baris
3. Admin pilih **Confirm** (`POST /api/upload-csv/{id}/confirm`) → data di-commit, ML dijalankan ulang, audit log tersimpan — atau **Cancel** (`POST /api/upload-csv/{id}/cancel`) → staging dihapus

### 7.2 Change-Detection

Tabel `RiwayatRisiko` menyimpan snapshot per grid (`grid_id, timestamp, skor, kategori, sumber_perubahan`). Endpoint `GET /api/changes` membandingkan 2 snapshot terakhir per grid → panel "Changes" di tab admin.

### 7.3 Staleness Tracking

Endpoint `GET /api/areas/stale?days=60` — menandai grid yang `RiwayatRisiko` terakhirnya >60 hari. Tab "Stale" di admin dashboard menampilkan dengan pola peringatan.

### 7.4 Notifikasi

Tabel `Notification` dengan trigger otomatis saat kategori naik. Endpoint:
- `GET /api/notifications` — list notifikasi
- `POST /api/notifications/{id}/read` — mark as read
- `GET /api/notifications/unread/count` — badge counter

Warga mengakses via halaman `/notifikasi` + bell icon di Header (polling 30 detik).

---

## 8. LOGIKA PEMBOBOTAN & TRANSISI STATUS

### 8.1 Kategori

| Kategori | Skor |
|---|---|
| Sangat Rendah | 0–25 |
| Rendah | 26–50 |
| Sedang | 51–75 |
| Tinggi | 76–100 |

### 8.2 EMA Smoothing

```
Skor_Area_Baru = α × Skor_Laporan_Baru + (1 − α) × Skor_Area_Lama
α = max(0,1 ; 1/(N+1))
```

### 8.3 Batas Lompatan

Maksimal 1 tingkat naik per siklus, kecuali cluster darurat (≥3 laporan risiko tinggi dalam 7 hari) — langsung trigger notifikasi darurat tanpa batas.

---

## 9. WORST-CASE SCENARIO & MITIGASI

| # | Skenario | Mitigasi | Status |
|---|---|---|---|
| 1 | Laporan spam/palsu | Rate limit, foto wajib sebagai friksi | Partial |
| 2 | GPS spoofing | Flag akurasi buruk | Not implemented |
| 3 | Admin salah upload CSV massal | **Staging 3-langkah** (preview → confirm/cancel) | ✅ |
| 4 | Wilayah tanpa data tampil "aman" | **Staleness indicator** (>60 hari) | ✅ |
| 5 | Notification fatigue | Rate limit, dead-band | Partial |
| 6 | False negative daerah terpencil | Layer makro BPS/Kemenkes | Partial |
| 7 | Race condition 2 laporan bersamaan | Locking per grid_id | Not implemented |
| 8 | Konflik status resmi vs skor prediktif | Badge terpisah + disclaimer | Not implemented |
| 9 | Kader input mobilitas salah | Validasi anomali nilai | Partial |

---

## 10. USE CASE PER ROLE

### 10.1 Warga

| # | Flow | Rute FE | Endpoint BE |
|---|---|---|---|
| 1 | Register akun | `/register` | Supabase Auth |
| 2 | Login | `/login` | Supabase Auth |
| 3 | Laporkan genangan (+ foto + GPS) | `/lapor` | `POST /api/lapor` |
| 4a | Lihat status laporan (konfirmasi) | `/lapor/sukses?kode=` | `GET /api/laporan/{kode}` |
| 4b | Lihat riwayat laporan + AI breakdown | `/riwayat` | `GET /api/laporan` |
| 5 | Lihat peta risiko komunitas | `/` | `GET /api/grids/risk` |
| 6 | Terima & buka notifikasi | `/notifikasi` | `GET /api/notifications` |

### 10.2 Kader Kesehatan

| # | Flow | Rute FE | Endpoint BE |
|---|---|---|---|
| 7 | Verifikasi laporan warga | `/kader` (tab Verifikasi) | `POST /api/laporan/{kode}/verify` |
| 8 | Tandai selesai tindakan | `/admin/laporan/[id]` | `POST /api/laporan/{kode}/tindakan` |
| 9 | **Input checklist mobilitas 30 hari** | `/kader` (tab Input Mobilitas) | `POST /api/mobilitas/{grid_id}` |

### 10.3 Admin Dinkes

| # | Flow | Rute FE | Endpoint BE |
|---|---|---|---|
| 10 | Dashboard monitoring | `/admin` | `GET /api/stats`, `GET /api/grids/risk` |
| 11a | Upload CSV — Preview | `/admin` (CSV button) | `POST /api/upload-csv/preview` |
| 11b | Upload CSV — Review staging | Modal preview | — |
| 11c | Upload CSV — Confirm/Cancel | Modal preview | `POST /api/upload-csv/{id}/confirm` / `cancel` |
| 12 | Panel Perubahan Terbaru | `/admin` (tab Changes) | `GET /api/changes` |
| 13 | Panel Stale Areas | `/admin` (tab Stale) | `GET /api/areas/stale` |

### 10.4 AI System (Auto-trigger)

| Trigger | Kapan | Endpoint internal |
|---|---|---|
| ML scoring + EMA + change-detection | Setiap `POST /api/lapor` | `predict_risk()` + `ema_smooth()` + `simpan_riwayat()` |
| Notifikasi kenaikan kategori | Setiap kali `kategori_naik` terdeteksi | `trigger_notifikasi()` |
| Staleness check | On-demand via `GET /api/areas/stale` | — |
| Risk re-scoring | Setiap `POST /api/mobilitas/{grid_id}` | `predict_risk()` + EMA |

---

## 11. DESAIN VISUALISASI PETA

| Layer | Jenis Visual | Sumber Data | Sifat |
|---|---|---|---|
| **Peta Heatmap Komunitas** | Canvas 50×50 grid dengan warna risiko | `GET /api/grids/risk` (polling 5s) | Real-time |
| **Peta Desa Simulasi (Demo)** | Grid procedurally generated dengan 8 tipe lahan | MapGrid.ts | Statis |

---

## 12. ARSITEKTUR TEKNIS

### 12.1 Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4 |
| Backend | FastAPI (Python 3.12), SQLModel/SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| Auth | Supabase Auth (JWT session-passing) |
| ML | scikit-learn RandomForestRegressor, joblib serialization |
| Deployment | Vercel (FE) + Railway (BE) |

### 12.2 Backend Endpoints (24 endpoints, 7 routers)

| Router | Endpoint | Method | Auth | Deskripsi |
|---|---|---|---|---|
| **auth** | `/api/auth/register` | POST | — | Register via Supabase |
| | `/api/auth/login` | POST | — | Login via Supabase |
| | `/api/auth/me` | GET | User | Current user info |
| **laporan** | `/api/lapor` | POST | — | Submit laporan + ML + EMA + notifikasi |
| | `/api/laporan` | GET | — | List laporan (filter status, paginasi) |
| | `/api/laporan/{kode}` | GET | — | Detail laporan (semua field + AI skor) |
| | `/api/laporan/{kode}/tindakan` | POST | Kader/Admin | Tandai selesai tindakan |
| | `/api/laporan/{kode}/verify` | POST | Kader/Admin | Verifikasi laporan |
| **predict** | `/api/predict` | POST | — | ML inference standalone (testing/debug) |
| **dashboard** | `/api/areas` | GET | — | Priority area list |
| | `/api/grids/risk` | GET | — | Grid risk scores (untuk heatmap) |
| | `/api/stats` | GET | — | Statistik agregat |
| **pcam** | `/api/upload-csv/preview` | POST | Admin | Preview CSV + return upload_id |
| | `/api/upload-csv` | POST | Admin | Direct CSV commit (fast path) |
| | `/api/upload-csv/{id}/confirm` | POST | Admin | Commit staged CSV |
| | `/api/upload-csv/{id}/cancel` | POST | Admin | Cancel staged CSV |
| | `/api/changes` | GET | — | List perubahan kategori |
| | `/api/areas/stale` | GET | — | List grid stale >60 hari |
| **mobilitas** | `/api/mobilitas` | GET | — | List semua data mobilitas grid |
| | `/api/mobilitas/{grid_id}` | GET | — | Detail mobilitas per grid |
| | `/api/mobilitas/{grid_id}` | POST | Kader/Admin | Upsert mobilitas + ML re-scoring |
| **notifications** | `/api/notifications` | GET | User | List notifikasi |
| | `/api/notifications/{id}/read` | POST | User | Mark notification read |
| | `/api/notifications/unread/count` | GET | User | Unread count |

### 12.3 Frontend Routes (10 halaman)

| Route | Tipe | Deskripsi |
|---|---|---|
| `/` | Server | Portal warga — hero, peta komunitas, CTA lapor |
| `/lapor` | Client | Form laporan genangan (checklist habitat + foto + GPS) |
| `/lapor/sukses?kode=` | Client | Konfirmasi sukses + skor risiko + rekomendasi |
| `/login` | Client | Sign in via Supabase Auth |
| `/register` | Client | Sign up via Supabase Auth (email) |
| `/admin` | Client | Admin dashboard — stat, peta, tab Priority/Reports/Changes/Stale, CSV upload |
| `/admin/laporan/[id]` | Client | Detail laporan — foto, checklist, AI breakdown, verify/resolve |
| `/kader` | Client | Kader dashboard — tab Verifikasi + tab Input Mobilitas |
| `/notifikasi` | Client | Warga notifikasi — list, mark read |
| `/riwayat` | Client | Warga riwayat laporan — list + expandable AI breakdown |

### 12.4 Database Schema (6 tabel)

| Tabel | Field kunci |
|---|---|
| `users` | id, username, email, role (user/kader/admin) |
| `laporan` | kode_laporan, status, lat, lng, grid_id, 13 habitat + 4 mobility + 6 risk scores, tindakan |
| `mobilitas_grid` | grid_id, pendatang_30_hari, pendatang_dari_endemis, pekerja_mobil, riwayat_perjalanan_endemis, mobility_risk_score |
| `riwayat_risiko` | grid_id, timestamp, skor, kategori, sumber_perubahan |
| `csv_upload_log` | uploaded_by, filename, total_rows, rows_updated, rows_valid/invalid, status |
| `notifications` | user_id, grid_id, message, tipe, dibaca |

---

## 13. STATUS IMPLEMENTASI — v6 Final

### 13.1 Yang Sudah Selesai

- ✅ 10 halaman FE semua wired ke BE (bukan static/dummy)
- ✅ 24 endpoint BE fully functional — laporan, predict, dashboard, PCEM, mobilitas, notifikasi, auth
- ✅ Auth: Supabase Auth (register, login, JWT session di semua API calls)
- ✅ Form laporan: checklist habitat + foto upload (multipart) + GPS + reverse geocoding
- ✅ ML pipeline: 2 RandomForest model, lazy-loaded, EMA smoothing + change-detection di setiap submit laporan
- ✅ Kader Input Mobilitas: halaman `/kader` + endpoint `/api/mobilitas/{grid_id}` — Model Mobilitas (bobot 20%) punya input real
- ✅ CSV staging 3-langkah: preview → review modal → confirm/cancel — mitigasi worst-case admin salah upload
- ✅ Notifikasi: trigger otomatis saat kategori naik, bell icon di header, halaman `/notifikasi` untuk warga
- ✅ Riwayat laporan warga: halaman `/riwayat` dengan expandable AI breakdown (Habitat ×0.65, Mobility ×0.20, Case ×0.15)
- ✅ Dashboard admin: 4 tab (Priority, Reports, Changes, Stale), stat cards, peta heatmap
- ✅ Change-detection panel: `GET /api/changes` → tab Changes
- ✅ Staleness tracking: `GET /api/areas/stale` → tab Stale
- ✅ All kritik.md gaps closed

### 13.2 Yang Belum (Fase 2+)

- ❌ Foto diproses AI (computer vision) — Fase 2
- ❌ Rate limit reporting per user/device — Fase 2
- ❌ GPS spoofing detection — Fase 2
- ❌ Dead-band/hysteresis notifikasi — Fase 2
- ❌ Dead letter queue untuk race condition — Fase 2
- ❌ Integrasi SISMAL resmi — Fase 3
- ❌ Data mobilitas jadi time series penuh — Fase 3
- ❌ Precompute heatmap 2500 grid untuk demo reliability — Fase 2
- ❌ Curah hujan dari API BMKG real — Fase 2
- ❌ Test framework (pytest, vitest) — Fase 2

---

## 14. DATASET & VALIDASI MODEL

**Lolos validasi:**
- Nol data hilang, nol duplikat ID di 2400 baris `Data_Training`
- Integritas referensial sempurna antar 7 sheet
- Formula `Risiko_Gabungan` cocok dengan data aktual (korelasi 0,996)
- Nol pelanggaran batas kategori (5-kelas Habitat, 4-kelas Heatmap)
- Kecocokan kategori habitat 84,8%, heatmap 88,8% vs data asli tim

---

## 15. ROADMAP 3 FASE

| Fase | Scope | Timeline |
|---|---|---|
| **Fase 1 (MVP)** | ✅ Semua fitur di Section 6–7 + semua gap kritik.md ditutup | Selesai |
| **Fase 2** | Data riil → retrain model, CV ringan, rate limit, test framework | 1–3 bulan |
| **Fase 3 (Scale)** | Integrasi SISMAL, time series mobilitas, notifikasi puskesmas | 6+ bulan |
