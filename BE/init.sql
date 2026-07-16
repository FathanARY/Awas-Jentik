-- ============================================================
-- MalariaWatch — Database Schema for Supabase (PostgreSQL)
-- ============================================================
-- Run this FIRST in SQL Editor before seed.sql
-- Tables are created with IF NOT EXISTS for idempotency
-- ============================================================


-- 1. Users (auth)
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(32) NOT NULL DEFAULT 'user'
);
CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);


-- 2. Laporan (citizen observation reports)
CREATE TABLE IF NOT EXISTS laporan (
    id                          SERIAL PRIMARY KEY,
    kode_laporan                VARCHAR(32) NOT NULL UNIQUE,
    status                      VARCHAR(32) NOT NULL DEFAULT 'menunggu',
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    lat                         DOUBLE PRECISION,
    lng                         DOUBLE PRECISION,
    grid_id                     VARCHAR(32),
    grid_x                      INTEGER,
    grid_y                      INTEGER,
    grid_land                   VARCHAR(64),
    alamat                      TEXT,
    foto_path                   TEXT,
    -- habitat fields
    persentase_lumut            DOUBLE PRECISION,
    persentase_vegetasi         DOUBLE PRECISION,
    air_tenang                  VARCHAR(8),
    paparan_matahari            VARCHAR(16),
    luas_genangan_m2            DOUBLE PRECISION,
    curah_hujan_30_hari_mm      DOUBLE PRECISION,
    jarak_hutan_m               DOUBLE PRECISION,
    jarak_sawah_m               DOUBLE PRECISION,
    jarak_sungai_m              DOUBLE PRECISION,
    jarak_rawa_m                DOUBLE PRECISION,
    jarak_tambang_m             DOUBLE PRECISION,
    jarak_permukiman_m          DOUBLE PRECISION,
    jarak_puskesmas_m           DOUBLE PRECISION,
    -- mobility fields
    pendatang_30_hari           INTEGER,
    pendatang_dari_endemis      INTEGER,
    pekerja_mobil               INTEGER,
    riwayat_perjalanan_endemis  INTEGER,
    kasus_malaria_1km_30hari    INTEGER,
    -- AI risk scores
    habitat_risk_score          DOUBLE PRECISION,
    habitat_category            VARCHAR(32),
    mobility_risk_score         DOUBLE PRECISION,
    case_score                  DOUBLE PRECISION,
    risiko_gabungan             DOUBLE PRECISION,
    heatmap_category            VARCHAR(32),
    -- action tracking
    tindakan                    TEXT,
    ditindaklanjuti_pada        TIMESTAMP,
    diverifikasi_oleh           VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS ix_laporan_kode_laporan ON laporan (kode_laporan);
CREATE INDEX IF NOT EXISTS ix_laporan_grid_id ON laporan (grid_id);
CREATE INDEX IF NOT EXISTS ix_laporan_status ON laporan (status);


-- 3. Mobilitas Grid (mobility data per grid, uploaded via CSV)
CREATE TABLE IF NOT EXISTS mobilitas_grid (
    id                              SERIAL PRIMARY KEY,
    grid_id                         VARCHAR(32) NOT NULL UNIQUE,
    periode_akhir                   DATE NOT NULL,
    pendatang_30_hari               INTEGER NOT NULL DEFAULT 0,
    pendatang_dari_endemis          INTEGER NOT NULL DEFAULT 0,
    pekerja_mobil                   INTEGER NOT NULL DEFAULT 0,
    riwayat_perjalanan_endemis      INTEGER NOT NULL DEFAULT 0,
    mobility_risk_score             DOUBLE PRECISION,
    updated_at                      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mobilitas_grid_grid_id ON mobilitas_grid (grid_id);


-- 4. Riwayat Risiko (risk history for change detection)
CREATE TABLE IF NOT EXISTS riwayat_risiko (
    id                  SERIAL PRIMARY KEY,
    grid_id             VARCHAR(32) NOT NULL,
    "timestamp"         TIMESTAMP NOT NULL DEFAULT NOW(),
    skor                DOUBLE PRECISION NOT NULL,
    kategori            VARCHAR(32) NOT NULL,
    sumber_perubahan    VARCHAR(64) NOT NULL,
    detail              TEXT
);
CREATE INDEX IF NOT EXISTS ix_riwayat_risiko_grid_id ON riwayat_risiko (grid_id);


-- 5. CSV Upload Log (audit trail for bulk uploads)
CREATE TABLE IF NOT EXISTS csv_upload_log (
    id              SERIAL PRIMARY KEY,
    uploaded_by     VARCHAR(64) NOT NULL DEFAULT 'admin',
    uploaded_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    filename        VARCHAR(255) NOT NULL,
    total_rows      INTEGER NOT NULL DEFAULT 0,
    rows_updated    INTEGER NOT NULL DEFAULT 0,
    rows_valid      INTEGER NOT NULL DEFAULT 0,
    rows_invalid    INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(16) NOT NULL DEFAULT 'committed'
);


-- 6. Notifications (auto-triggered on risk category changes)
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER,
    grid_id     VARCHAR(32) NOT NULL,
    message     TEXT NOT NULL,
    tipe        VARCHAR(16) NOT NULL DEFAULT 'peringatan',
    dibaca      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS ix_notifications_grid_id ON notifications (grid_id);


-- ============================================================
-- MalariaWatch — Seed Data
-- Run AFTER schema.sql
-- Users: admin / password123, user / password123
-- ============================================================

INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$12$tC6peAS303yaL/Xs4ts09.CuCXj99BzOSIeNm1NLcuc7hC/p8d7My', 'admin'),
('user', '$2b$12$tC6peAS303yaL/Xs4ts09.CuCXj99BzOSIeNm1NLcuc7hC/p8d7My', 'user')
ON CONFLICT (username) DO NOTHING;

-- Laporan (9 demo reports)
INSERT INTO laporan (kode_laporan, status, created_at, lat, lng, alamat,
  persentase_lumut, persentase_vegetasi, air_tenang, paparan_matahari,
  luas_genangan_m2, curah_hujan_30_hari_mm,
  jarak_hutan_m, jarak_sawah_m, jarak_sungai_m, jarak_rawa_m, jarak_tambang_m, jarak_permukiman_m, jarak_puskesmas_m,
  pendatang_30_hari, pendatang_dari_endemis, pekerja_mobil, riwayat_perjalanan_endemis,
  kasus_malaria_1km_30hari,
  habitat_risk_score, habitat_category, mobility_risk_score, case_score, risiko_gabungan, heatmap_category,
  tindakan, ditindaklanjuti_pada, diverifikasi_oleh)
VALUES
  ('MW-2026-F1AB3D', 'menunggu', '2026-07-16T22:10:21.250862', -6.24, 106.786666, 'Desa Sukamaju, Kecamatan Asmat', 75, 80, 'Ya', 'Rendah', 45.0, 420, 0, 800, 600, 1200, 5000, 45, 3500, 8, 3, 5, 2, 4, 85, 'Very High', 74, 64, 81, 'Tinggi', NULL, NULL, NULL),
  ('MW-2026-E047C0', 'menunggu', '2026-07-13T22:10:21.250862', -6.23, 106.796666, 'Desa Harapan Jaya, Kecamatan Asmat', 70, 75, 'Ya', 'Rendah', 40.0, 400, 5, 850, 620, 1100, 4800, 50, 3400, 9, 4, 5, 2, 5, 83, 'Very High', 76, 80, 81, 'Tinggi', NULL, NULL, NULL),
  ('MW-2026-447271', 'ditindaklanjuti', '2026-07-10T22:10:21.250862', -6.22, 106.806666, 'Desa Mekar Sari, Kecamatan Asmat', 80, 85, 'Ya', 'Rendah', 50.0, 440, 10, 780, 580, 1300, 5200, 40, 3600, 10, 4, 6, 3, 4, 90, 'Very High', 78, 64, 84, 'Tinggi', 'Fogging terjadwal', '2026-07-10T22:10:21.250862', 'Dr. Budi Santoso'),
  ('MW-2026-C7A9E8', 'menunggu', '2026-07-07T22:10:21.250862', -6.21, 106.816666, 'Desa Sumber Rejo, Kecamatan Mimika', 60, 65, 'Ya', 'Sedang', 30.0, 380, 50, 500, 400, 900, 3000, 80, 2800, 5, 2, 3, 1, 3, 76, 'High', 58, 48, 68, 'Sedang', NULL, NULL, NULL),
  ('MW-2026-450798', 'menunggu', '2026-07-04T22:10:21.250862', -6.2, 106.826666, 'Desa Tanjung Harapan, Kecamatan Mimika', 55, 60, 'Ya', 'Sedang', 28.0, 360, 45, 520, 380, 850, 3200, 85, 2900, 6, 3, 4, 1, 3, 74, 'High', 60, 48, 67, 'Sedang', NULL, NULL, NULL),
  ('MW-2026-3EBEE0', 'ditindaklanjuti', '2026-07-01T22:10:21.250862', -6.19, 106.836666, 'Desa Karang Asem, Kecamatan Mimika', 65, 70, 'Ya', 'Sedang', 35.0, 400, 55, 480, 420, 950, 2800, 75, 2700, 7, 3, 4, 2, 4, 77, 'High', 62, 64, 71, 'Sedang', 'Fogging terjadwal', '2026-07-01T22:10:21.250862', 'Dr. Budi Santoso'),
  ('MW-2026-7E8247', 'menunggu', '2026-06-28T22:10:21.250862', -6.18, 106.846666, 'Desa Margomulyo, Kecamatan Sumba Timur', 30, 40, 'Tidak', 'Tinggi', 15.0, 250, 200, 300, 250, 1500, 800, 150, 1200, 2, 0, 1, 0, 1, 35, 'Low', 28, 16, 29, 'Rendah', NULL, NULL, NULL),
  ('MW-2026-08937E', 'menunggu', '2026-06-25T22:10:21.250862', -6.17, 106.856666, 'Desa Sidomakmur, Kecamatan Sumba Timur', 25, 35, 'Tidak', 'Tinggi', 12.0, 230, 180, 280, 230, 1600, 750, 140, 1100, 1, 0, 1, 0, 0, 30, 'Low', 22, 0, 24, 'Rendah', NULL, NULL, NULL),
  ('MW-2026-770F87', 'ditindaklanjuti', '2026-06-22T22:10:21.250862', -6.16, 106.866666, 'Desa Sukamaju, Kecamatan Sumba Timur', 35, 45, 'Tidak', 'Tinggi', 18.0, 270, 220, 320, 270, 1400, 850, 160, 1300, 3, 0, 2, 1, 2, 38, 'Low', 32, 32, 35, 'Rendah', 'Fogging terjadwal', '2026-06-22T22:10:21.250862', 'Dr. Budi Santoso');

-- Verify: SELECT * FROM laporan;