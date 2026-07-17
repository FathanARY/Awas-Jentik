# Awas-Jentik 🦟

**Awas-Jentik** adalah sistem surveilans malaria komprehensif yang mengintegrasikan pengumpulan data lapangan dengan analitik *Explainable AI* (Machine Learning) untuk menilai risiko habitat nyamuk secara otomatis.

Repository ini menggunakan arsitektur **Monorepo (Multi-tier Microservices)** yang terdiri dari 3 komponen utama:

## Arsitektur Sistem

### 1. `FE/` (Frontend)
Aplikasi antarmuka pengguna berbasis **Next.js**. Digunakan oleh kader malaria dan dinas kesehatan untuk input data lapangan, melihat dashboard penyebaran, dan mendapatkan laporan visual (peta risiko). Frontend akan berkomunikasi dengan Main Backend dan AI Engine.

### 2. `BE/` (Main Backend)
Layanan backend utama yang menangani operasional sistem konvensional seperti:
- Autentikasi Pengguna (Login, Role Management)
- Integrasi Database (PostgreSQL)
- Manajemen Data Laporan Jentik
- Sistem Notifikasi & Dashboard

### 3. `AI_Engine/` (Explainable AI Microservice)
Microservice spesifik **Machine Learning** yang melayani model prediksi XGBoost dan SHAP Explainer. 
- Menerima payload parameter habitat (genangan, vegetasi, jarak ke fasilitas, dll.) dari Frontend.
- Mengembalikan persentase Skor Risiko (0-100%) beserta "Penjelasan Alasan" (SHAP feature contributions) mengapa skor tersebut diberikan.
- Berjalan sepenuhnya secara mandiri (terisolasi dari `BE` utama) menggunakan FastAPI dan Docker agar performa prediksi cepat dan tidak memberatkan layanan database utama.

## Deployment Strategy
Karena arsitektur ini berbasis Microservices:
- Folder `FE/` di-deploy ke **Vercel**.
- Folder `BE/` di-deploy ke provider cloud (seperti Render / Railway / VPS).
- Folder `AI_Engine/` di-deploy secara terpisah (misalnya di container Railway terdedikasi) untuk mengisolasi beban komputasi AI dari beban web traffic biasa.
