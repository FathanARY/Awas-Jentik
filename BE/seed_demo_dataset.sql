-- ============================================================
-- MalariaWatch — Demo Seed Data (25 reports, real AI dataset)
-- Sampled from AI_Engine training dataset (2400 observations)
-- Spreads across 50×50 grid: lat -6.30..-6.10, lng 106.72..106.92
-- ============================================================

INSERT INTO users (username, email, role) VALUES
('admin', 'admin@malariawatch.com', 'admin'),
('user', 'user@malariawatch.com', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO laporan (kode_laporan, status, created_at, lat, lng, grid_id, grid_x, grid_y, grid_land, alamat,
  persentase_lumut, persentase_vegetasi, air_tenang, paparan_matahari,
  luas_genangan_m2, curah_hujan_30_hari_mm,
  jarak_hutan_m, jarak_sawah_m, jarak_sungai_m, jarak_rawa_m, jarak_tambang_m, jarak_permukiman_m, jarak_puskesmas_m,
  pendatang_30_hari, pendatang_dari_endemis, pekerja_mobil, riwayat_perjalanan_endemis,
  kasus_malaria_1km_30hari,
  habitat_risk_score, habitat_category, mobility_risk_score, case_score, risiko_gabungan, heatmap_category,
  tindakan, ditindaklanjuti_pada, diverifikasi_oleh)
VALUES

-- ═══════════════════════════════════════════════════════
-- ZONA TINGGI (6) — Mining, Swamp, Deep Forest
-- ═══════════════════════════════════════════════════════
('MW-2026-770487', 'menunggu', '2026-07-17T08:00:00', -6.251021, 106.864183, 'AREA-3738', 37, 38, 'mining',
 'Desa Sukamaju, Kecamatan Asmat', 77, 100, 'Ya', 'Tinggi',
 14.0, 286, 2420, 850, 1000, 2100, 0, 200, 790,
 7, 0, 31, 2, 4, 89, 'Very High', 74, 64, 82, 'Tinggi',
 NULL, NULL, NULL),

('MW-2026-388389', 'menunggu', '2026-07-16T09:00:00', -6.246938, 106.729301, 'AREA-0337', 3, 37, 'swamp',
 'Desa Harapan Jaya, Kecamatan Mimika', 68, 99, 'Ya', 'Sedang',
 60.8, 391, 630, 940, 890, 0, 2620, 630, 2130,
 2, 2, 2, 1, 1, 92, 'Very High', 77, 16, 78, 'Tinggi',
 NULL, NULL, NULL),

('MW-2026-872246', 'menunggu', '2026-07-16T10:30:00', -6.267344, 106.868833, 'AREA-3842', 38, 42, 'mining',
 'Desa Mekar Sari, Kecamatan Sumba Timur', 82, 94, 'Ya', 'Rendah',
 33.9, 328, 2800, 1250, 1410, 2200, 0, 400, 1040,
 12, 2, 13, 4, 5, 83, 'Very High', 60, 80, 78, 'Tinggi',
 NULL, NULL, NULL),

('MW-2026-671858', 'menunggu', '2026-07-15T14:00:00', -6.218369, 106.720000, 'AREA-0130', 1, 30, 'forest',
 'Desa Tanjung Harapan, Kecamatan Jayapura', 94, 100, 'Ya', 'Rendah',
 5.9, 287, 0, 630, 350, 140, 2970, 410, 2410,
 1, 0, 13, 2, 0, 93, 'Very High', 88, 0, 78, 'Tinggi',
 NULL, NULL, NULL),

('MW-2026-133326', 'terverifikasi', '2026-07-14T11:00:00', -6.275508, 106.882790, 'AREA-4144', 41, 44, 'mining',
 'Desa Karang Asem, Kecamatan Asmat', 100, 55, 'Ya', 'Rendah',
 56.4, 280, 3140, 1550, 1700, 2520, 0, 220, 1400,
 12, 5, 40, 20, 0, 92, 'Very High', 92, 0, 78, 'Tinggi',
 NULL, NULL, 'Siti Nurhaliza'),

('MW-2026-343962', 'ditindaklanjuti', '2026-07-13T15:00:00', -6.255103, 106.887441, 'AREA-4239', 42, 39, 'mining',
 'Desa Margomulyo, Kecamatan Mimika', 95, 75, 'Ya', 'Rendah',
 73.9, 284, 2830, 1120, 1300, 2600, 0, 280, 1300,
 4, 3, 30, 9, 2, 92, 'Very High', 76, 32, 80, 'Tinggi',
 'Fogging + penyuluhan warga', '2026-07-14T10:00:00', 'Dr. Budi Santoso'),

-- ═══════════════════════════════════════════════════════
-- ZONA SEDANG (8) — Rice, Residential edges, Plantation
-- ═══════════════════════════════════════════════════════
('MW-2026-688508', 'menunggu', '2026-07-17T07:30:00', -6.218369, 106.733952, 'AREA-0430', 4, 30, 'forest',
 'Desa Sidomakmur, Kecamatan Sumba Timur', 68, 72, 'Tidak', 'Sedang',
 5.3, 249, 0, 360, 180, 100, 2690, 140, 2130,
 4, 0, 4, 1, 2, 72, 'High', 50, 32, 62, 'Sedang',
 NULL, NULL, NULL),

('MW-2026-835392', 'menunggu', '2026-07-16T08:45:00', -6.189795, 106.910699, 'AREA-4823', 48, 23, 'plantation',
 'Desa Sumber Rejo, Kecamatan Jayapura', 37, 29, 'Tidak', 'Sedang',
 6.6, 260, 2340, 300, 840, 3420, 1430, 610, 2210,
 0, 0, 10, 0, 5, 49, 'Medium', 39, 80, 52, 'Sedang',
 NULL, NULL, NULL),

('MW-2026-571029', 'menunggu', '2026-07-15T16:00:00', -6.279590, 106.785113, 'AREA-1745', 17, 45, 'residential',
 'Desa Sukamaju, Kecamatan Asmat', 15, 36, 'Ya', 'Sedang',
 5.3, 155, 1800, 1400, 1790, 540, 1460, 0, 1270,
 4, 0, 0, 1, 5, 54, 'Medium', 41, 80, 55, 'Sedang',
 NULL, NULL, NULL),

('MW-2026-106814', 'menunggu', '2026-07-14T13:00:00', -6.128574, 106.747903, 'AREA-0708', 7, 8, 'forest',
 'Desa Harapan Jaya, Kecamatan Mimika', 57, 35, 'Ya', 'Sedang',
 15.4, 337, 0, 1400, 1720, 2320, 3760, 2100, 3320,
 2, 0, 2, 0, 0, 67, 'High', 39, 0, 51, 'Sedang',
 NULL, NULL, NULL),

('MW-2026-456778', 'terverifikasi', '2026-07-14T09:30:00', -6.185713, 106.729301, 'AREA-0322', 3, 22, 'forest',
 'Desa Mekar Sari, Kecamatan Sumba Timur', 48, 50, 'Ya', 'Tinggi',
 10.3, 367, 0, 410, 570, 900, 3160, 760, 2570,
 0, 0, 1, 0, 0, 74, 'High', 22, 0, 53, 'Sedang',
 NULL, NULL, 'Siti Nurhaliza'),

('MW-2026-900581', 'ditindaklanjuti', '2026-07-13T10:00:00', -6.226528, 106.831629, 'AREA-2832', 28, 32, 'residential',
 'Desa Tanjung Harapan, Kecamatan Jayapura', 22, 50, 'Ya', 'Tinggi',
 10.5, 322, 1530, 100, 280, 1520, 780, 0, 440,
 5, 0, 0, 0, 2, 72, 'High', 21, 32, 56, 'Sedang',
 'Fogging terjadwal', '2026-07-13T16:00:00', 'Dr. Budi Santoso'),

('MW-2026-498382', 'menunggu', '2026-07-12T12:00:00', -6.210205, 106.808371, 'AREA-2328', 23, 28, 'rice',
 'Desa Karang Asem, Kecamatan Asmat', 80, 42, 'Ya', 'Tinggi',
 20.8, 342, 920, 0, 40, 1220, 1420, 400, 930,
 0, 0, 2, 0, 4, 89, 'Very High', 13, 64, 70, 'Sedang',
 NULL, NULL, NULL),

('MW-2026-460663', 'menunggu', '2026-07-11T14:30:00', -6.263262, 106.747903, 'AREA-0741', 7, 41, 'swamp',
 'Desa Margomulyo, Kecamatan Mimika', 73, 57, 'Ya', 'Tinggi',
 55.5, 361, 1120, 1140, 1320, 0, 2200, 410, 1790,
 1, 1, 1, 0, 3, 81, 'Very High', 42, 48, 68, 'Sedang',
 NULL, NULL, NULL),

-- ═══════════════════════════════════════════════════════
-- ZONA RENDAH (8) — Residential, Plantation edges
-- ═══════════════════════════════════════════════════════
('MW-2026-865179', 'menunggu', '2026-07-17T11:00:00', -6.287754, 106.878140, 'AREA-4047', 40, 47, 'residential',
 'Desa Sidomakmur, Kecamatan Sumba Timur', 21, 55, 'Tidak', 'Tinggi',
 5.6, 291, 3330, 1790, 1950, 2470, 100, 0, 1510,
 7, 2, 7, 0, 0, 48, 'Medium', 55, 0, 42, 'Rendah',
 NULL, NULL, NULL),

('MW-2026-496922', 'menunggu', '2026-07-16T15:00:00', -6.128574, 106.831629, 'AREA-2808', 28, 8, 'plantation',
 'Desa Sumber Rejo, Kecamatan Jayapura', 24, 49, 'Tidak', 'Rendah',
 3.5, 367, 500, 100, 1970, 3000, 2910, 2250, 2830,
 1, 0, 22, 0, 0, 33, 'Low', 42, 0, 30, 'Rendah',
 NULL, NULL, NULL),

('MW-2026-969693', 'terverifikasi', '2026-07-15T10:00:00', -6.124492, 106.775812, 'AREA-1407', 14, 7, 'forest',
 'Desa Sukamaju, Kecamatan Asmat', 32, 35, 'Ya', 'Sedang',
 2.7, 140, 0, 820, 1780, 2560, 3500, 2280, 3140,
 0, 0, 2, 0, 1, 59, 'Medium', 35, 16, 48, 'Rendah',
 NULL, NULL, 'Siti Nurhaliza'),

('MW-2026-838797', 'ditindaklanjuti', '2026-07-14T08:30:00', -6.173472, 106.822323, 'AREA-2619', 26, 19, 'rice',
 'Desa Harapan Jaya, Kecamatan Mimika', 53, 70, 'Tidak', 'Sedang',
 19.2, 219, 500, 0, 900, 2050, 1970, 1300, 1730,
 1, 0, 0, 0, 1, 49, 'Medium', 23, 16, 39, 'Rendah',
 'Fogging terjadwal', '2026-07-14T16:00:00', 'Dr. Budi Santoso'),

('MW-2026-338968', 'menunggu', '2026-07-13T16:45:00', -6.279590, 106.840930, 'AREA-3145', 31, 45, 'residential',
 'Desa Mekar Sari, Kecamatan Sumba Timur', 0, 19, 'Tidak', 'Sedang',
 4.9, 415, 2660, 1400, 1580, 1650, 320, 0, 910,
 4, 0, 3, 0, 3, 38, 'Low', 46, 48, 41, 'Rendah',
 NULL, NULL, NULL),

('MW-2026-344098', 'menunggu', '2026-07-12T09:15:00', -6.153062, 106.808371, 'AREA-2314', 23, 14, 'forest',
 'Desa Tanjung Harapan, Kecamatan Jayapura', 49, 57, 'Ya', 'Rendah',
 9.2, 263, 0, 100, 1230, 2220, 2550, 1800, 2270,
 1, 0, 7, 1, 0, 71, 'High', 1, 0, 46, 'Rendah',
 NULL, NULL, NULL),

('MW-2026-575435', 'menunggu', '2026-07-12T14:00:00', -6.128574, 106.920000, 'AREA-5108', 51, 8, 'plantation',
 'Desa Karang Asem, Kecamatan Asmat', 33, 36, 'Ya', 'Sedang',
 18.3, 363, 2330, 920, 2010, 4340, 2910, 2120, 3450,
 2, 1, 22, 0, 0, 53, 'Medium', 27, 0, 40, 'Rendah',
 NULL, NULL, NULL),

('MW-2026-472528', 'menunggu', '2026-07-11T11:00:00', -6.295918, 106.845581, 'AREA-3249', 32, 49, 'residential',
 'Desa Margomulyo, Kecamatan Mimika', 0, 49, 'Tidak', 'Sedang',
 5.4, 315, 2980, 1800, 1990, 1880, 500, 0, 1320,
 3, 0, 3, 0, 2, 39, 'Low', 27, 32, 36, 'Rendah',
 NULL, NULL, NULL),

-- ═══════════════════════════════════════════════════════
-- ZONA SANGAT RENDAH (3) — Far Residential, Open Land
-- ═══════════════════════════════════════════════════════
('MW-2026-835911', 'terverifikasi', '2026-07-17T09:30:00', -6.287754, 106.822323, 'AREA-2647', 26, 47, 'residential',
 'Desa Sidomakmur, Kecamatan Sumba Timur', 10, 0, 'Tidak', 'Tinggi',
 3.3, 281, 2480, 1600, 1790, 1340, 760, 0, 1080,
 8, 0, 5, 0, 2, 22, 'Low', 27, 32, 25, 'Sangat Rendah',
 NULL, NULL, 'Siti Nurhaliza'),

('MW-2026-279451', 'ditindaklanjuti', '2026-07-16T17:00:00', -6.300000, 106.794419, 'AREA-1951', 19, 51, 'road',
 'Desa Sumber Rejo, Kecamatan Jayapura', 14, 14, 'Tidak', 'Tinggi',
 3.2, 285, 2330, 1900, 2200, 990, 1430, 140, 1550,
 0, 0, 2, 0, 1, 27, 'Low', 17, 16, 23, 'Sangat Rendah',
 'Monitoring rutin', '2026-07-16T20:00:00', 'Dr. Budi Santoso'),

('MW-2026-271339', 'menunggu', '2026-07-15T12:30:00', -6.100000, 106.845581, 'AREA-3201', 32, 1, 'road',
 'Desa Sukamaju, Kecamatan Asmat', 4, 26, 'Tidak', 'Sedang',
 3.1, 276, 1000, 820, 2520, 3740, 3540, 2840, 3550,
 0, 0, 0, 0, 0, 31, 'Low', 10, 0, 22, 'Sangat Rendah',
 NULL, NULL, NULL);
