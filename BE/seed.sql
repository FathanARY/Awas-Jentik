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