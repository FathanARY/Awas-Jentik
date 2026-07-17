# AI Engine (RiskAssesmentAI) — Deployment & Integration Guide

> Dokumen ini ditujukan untuk tim Backend (BE) & Frontend (FE) Awas-Jentik sebagai panduan cara melakukan deployment microservice AI dan cara menembak endpoint prediksinya.

---

## 1. Konteks Arsitektur
Sistem AI ini (**RiskAssesmentAI**) adalah microservice mandiri berbasis **FastAPI + XGBoost**. 
- AI Engine ini **TIDAK** membutuhkan akses ke database PostgreSQL utama.
- AI Engine menggunakan model XGBoost yang sangat ringan dan cepat (PyTorch / TabPFN tidak diperlukan di server production).
- Komunikasi dengan AI Engine dilakukan sepenuhnya via **REST API (JSON)**.

---

## 2. Cara Menjalankan AI Secara Lokal (Khusus Testing BE)

> **Catatan:** Deployment ke server cloud (Railway) akan dilakukan secara terpusat oleh pemilik proyek. Tim BE tidak perlu melakukan deployment ke production.

Jika tim BE ingin menguji koneksi API dari komputer lokal saat masa development:
1. Buka terminal di folder `Awas-Jentik/AI_Engine`.
2. Jalankan perintah:
   ```bash
   docker compose up --build -d
   ```
3. API AI Engine akan menyala di `http://localhost:8000`.

---

## 3. Dokumentasi API (Untuk Tim FE / BE)

Endpoint utama yang digunakan untuk mendapatkan skor risiko malaria dan alasan penyebabnya adalah endpoint POST `/v1/risk-assessments`.

### Endpoint: Dapatkan Prediksi Risiko
- **URL**: `/v1/risk-assessments`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload (Contoh)
```json
{
  "grid_id": "HJ-G-0001",
  "observed_at": "2026-07-17",
  "lumut_level": "Banyak",
  "vegetasi_level": "Lebat",
  "air_tenang": true,
  "paparan_matahari": "Rendah",
  "luas_genangan_m2": 25.0,
  "mobility_level": "Tinggi",
  "include_explanation": true
}
```

#### Response (Contoh)
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "grid_id": "HJ-G-0001",
  "assessed_at": "2026-07-17T10:00:00Z",
  "model_version": "xgboost_regressor",
  "habitat_risk_score": 85.5,
  "mobility_score": 80.0,
  "case_proximity_score": 0.0,
  "combined_risk_score": 83.2,
  "risk_level": "Sangat Tinggi",
  "explanation": {
    "top_features": [
      {
        "feature": "air_tenang",
        "value": 1.0,
        "contribution": 15.2
      },
      {
        "feature": "lumut_level",
        "value": 3.0,
        "contribution": 8.5
      }
    ],
    "base_value": 45.0
  }
}
```

### Penjelasan Fields Penting:
1. `combined_risk_score`: Ini adalah nilai akhir (0 - 100) yang harus ditampilkan di UI sebagai **Skor Bahaya**.
2. `risk_level`: Label kategorikal (Rendah, Sedang, Tinggi, Sangat Tinggi).
3. `explanation.top_features`: Array fitur yang paling mempengaruhi skor. Sangat bagus untuk ditampilkan di UI sebagai **"Alasan Kenapa Risiko Tinggi"** (Explainable AI).

---

## 4. Checklist Integrasi (Untuk Tim BE & FE)
- [ ] Tim Pemilik Proyek (AI) mendeploy `AI_Engine` ke Railway dan memberikan URL HTTPS ke tim BE/FE.
- [ ] Tim BE/FE memastikan URL Railway tersebut merespons saat dites `GET /health` di browser.
- [ ] Tim FE memasukkan URL Railway tersebut ke dalam variabel environment Vercel (contoh: `NEXT_PUBLIC_AI_API_URL=https://...`).
- [ ] Tim FE mengubah/menambahkan fungsi *fetch* di kode Next.js agar menembak payload (seperti format di atas) ke `NEXT_PUBLIC_AI_API_URL/v1/risk-assessments`.
