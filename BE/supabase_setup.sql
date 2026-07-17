-- ============================================================
-- MalariaWatch — Supabase Full Setup (Auth + DB + Seed)
-- ============================================================
-- Copy-paste this ENTIRE script into Supabase Dashboard → SQL Editor
-- Safe to run repeatedly — all CREATE/DROP use IF EXISTS/NOT EXISTS
-- ============================================================

-- ──────────────────────────────────────────────
-- STEP 1: Migrate existing users table (idempotent)
-- ──────────────────────────────────────────────
DO $$
BEGIN
    -- Drop old password_hash column if it still exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users DROP COLUMN password_hash;
    END IF;

    -- Add email column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- ──────────────────────────────────────────────
-- STEP 2: Create all tables (idempotent)
-- ──────────────────────────────────────────────

-- 2a. Users — stores local role, auth is managed by Supabase Auth
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(255),
    role            VARCHAR(32) NOT NULL DEFAULT 'user'
);
CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);


-- 2b. Laporan — citizen observation reports
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
    pendatang_30_hari           INTEGER,
    pendatang_dari_endemis      INTEGER,
    pekerja_mobil               INTEGER,
    riwayat_perjalanan_endemis  INTEGER,
    kasus_malaria_1km_30hari    INTEGER,
    habitat_risk_score          DOUBLE PRECISION,
    habitat_category            VARCHAR(32),
    mobility_risk_score         DOUBLE PRECISION,
    case_score                  DOUBLE PRECISION,
    risiko_gabungan             DOUBLE PRECISION,
    heatmap_category            VARCHAR(32),
    tindakan                    TEXT,
    ditindaklanjuti_pada        TIMESTAMP,
    diverifikasi_oleh           VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS ix_laporan_kode_laporan ON laporan (kode_laporan);
CREATE INDEX IF NOT EXISTS ix_laporan_grid_id ON laporan (grid_id);
CREATE INDEX IF NOT EXISTS ix_laporan_status ON laporan (status);


-- 2c. Mobilitas Grid — mobility data per grid
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


-- 2d. Riwayat Risiko — risk history for change detection
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


-- 2e. CSV Upload Log — audit trail
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


-- 2f. Notifications — risk category change alerts
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


-- ──────────────────────────────────────────────
-- STEP 3: Seed demo users (idempotent)
-- ──────────────────────────────────────────────
INSERT INTO users (username, email, role)
VALUES ('admin', 'admin@malariawatch.com', 'admin')
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;

INSERT INTO users (username, email, role)
VALUES ('user', 'user@malariawatch.com', 'user')
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;

-- Seed a test admin so you can login via Supabase Auth
-- Register at /register with email: admin@malariawatch.com first
-- Then this role will be picked up on next /auth/me call


-- ──────────────────────────────────────────────
-- STEP 4: Verify setup
-- ──────────────────────────────────────────────
SELECT 
    'users'       AS tabel, COUNT(*) AS rows FROM users
UNION ALL
SELECT 'laporan', COUNT(*) FROM laporan
UNION ALL
SELECT 'mobilitas_grid', COUNT(*) FROM mobilitas_grid
UNION ALL
SELECT 'riwayat_risiko', COUNT(*) FROM riwayat_risiko
UNION ALL
SELECT 'csv_upload_log', COUNT(*) FROM csv_upload_log
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Check user emails are set
SELECT id, username, email, role FROM users;
