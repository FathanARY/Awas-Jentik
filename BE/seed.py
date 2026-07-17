import uuid
import datetime
import random
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlmodel import Session, SQLModel, select
from app.database import engine
from app.models.laporan import Laporan
from app.models.user import User
from app.services import predict_risk
from app.services.auth import get_password_hash

LAT_BASE = -6.200000
LNG_BASE = 106.816666

DESA_NAMES = [
    "Sukamaju", "Harapan Jaya", "Mekar Sari", "Sumber Rejo",
    "Tanjung Harapan", "Karang Asem", "Margomulyo", "Sidomakmur",
]

def seed_demo(session: Session):
    existing_user = session.exec(select(User).limit(1)).first()
    if not existing_user:
        admin = User(username="admin", email="admin@malariawatch.com", password_hash=get_password_hash("password123"), role="admin")
        user = User(username="user", email="user@malariawatch.com", password_hash=get_password_hash("password123"), role="user")
        session.add(admin)
        session.add(user)
        session.commit()
        print("Seeded default users (admin, user).")

    existing = session.exec(select(Laporan).limit(1)).all()
    if existing:
        print("Database sudah berisi data. Lewati seeding.")
        return

    demo_configs = [
        {
            "air_tenang": "Ya", "paparan": "Rendah",
            "lumut": 75, "vegetasi": 80, "luas": 45.0,
            "curah_hujan": 420, "kasus": 4,
            "jarak_hutan": 0, "jarak_sawah": 800, "jarak_sungai": 600,
            "jarak_rawa": 1200, "jarak_tambang": 5000, "jarak_permukiman": 45,
            "jarak_puskesmas": 3500,
            "pendatang": 8, "pendatang_endemis": 3, "pekerja_mobil": 5,
            "riwayat": 2, "area": "Asmat",
        },
        {
            "air_tenang": "Ya", "paparan": "Sedang",
            "lumut": 60, "vegetasi": 65, "luas": 30.0,
            "curah_hujan": 380, "kasus": 3,
            "jarak_hutan": 50, "jarak_sawah": 500, "jarak_sungai": 400,
            "jarak_rawa": 900, "jarak_tambang": 3000, "jarak_permukiman": 80,
            "jarak_puskesmas": 2800,
            "pendatang": 5, "pendatang_endemis": 2, "pekerja_mobil": 3,
            "riwayat": 1, "area": "Mimika",
        },
        {
            "air_tenang": "Tidak", "paparan": "Tinggi",
            "lumut": 30, "vegetasi": 40, "luas": 15.0,
            "curah_hujan": 250, "kasus": 1,
            "jarak_hutan": 200, "jarak_sawah": 300, "jarak_sungai": 250,
            "jarak_rawa": 1500, "jarak_tambang": 800, "jarak_permukiman": 150,
            "jarak_puskesmas": 1200,
            "pendatang": 2, "pendatang_endemis": 0, "pekerja_mobil": 1,
            "riwayat": 0, "area": "Sumba Timur",
        },
    ]

    for i, cfg in enumerate(demo_configs):
        for j in range(3):
            lat = LAT_BASE + random.uniform(-0.05, 0.05)
            lng = LNG_BASE + random.uniform(-0.05, 0.05)

            habitat_input = {
                "Persentase_Lumut": cfg["lumut"] + random.uniform(-10, 10),
                "Persentase_Vegetasi": cfg["vegetasi"] + random.uniform(-10, 10),
                "Air_Tenang": cfg["air_tenang"],
                "Paparan_Matahari": cfg["paparan"],
                "Luas_Genangan_m2": cfg["luas"] + random.uniform(-5, 5),
                "Curah_Hujan_30_Hari_mm": cfg["curah_hujan"] + random.uniform(-20, 20),
                "Jarak_Hutan_m": max(0, cfg["jarak_hutan"] + random.uniform(-5, 20)),
                "Jarak_Sawah_m": max(0, cfg["jarak_sawah"] + random.uniform(-50, 50)),
                "Jarak_Sungai_m": max(0, cfg["jarak_sungai"] + random.uniform(-50, 50)),
                "Jarak_Rawa_m": max(0, cfg["jarak_rawa"] + random.uniform(-100, 100)),
                "Jarak_Tambang_m": max(0, cfg["jarak_tambang"] + random.uniform(-200, 200)),
                "Jarak_Permukiman_m": max(0, cfg["jarak_permukiman"] + random.uniform(-20, 20)),
                "Jarak_Puskesmas_m": max(0, cfg["jarak_puskesmas"] + random.uniform(-200, 200)),
            }
            mobility_input = {
                "Pendatang_30_Hari": cfg["pendatang"] + random.randint(0, 2),
                "Pendatang_Dari_Endemis": cfg["pendatang_endemis"] + random.randint(0, 1),
                "Pekerja_Mobil": cfg["pekerja_mobil"] + random.randint(0, 1),
                "Riwayat_Perjalanan_Endemis": cfg["riwayat"] + random.randint(0, 1),
            }
            kasus = max(0, cfg["kasus"] + random.randint(-1, 1))

            risk = predict_risk(habitat_input, mobility_input, kasus)

            now = datetime.datetime.utcnow()
            kode = f"MW-{now.year}-{uuid.uuid4().hex[:6].upper()}"

            desa = random.choice(DESA_NAMES)

            laporan = Laporan(
                kode_laporan=kode,
                status="menunggu" if j < 2 else "ditindaklanjuti",
                created_at=now - datetime.timedelta(days=random.randint(0, 30)),
                lat=lat,
                lng=lng,
                alamat=f"Desa {desa}, Kecamatan {cfg['area']}",
                persentase_lumut=round(habitat_input["Persentase_Lumut"], 1),
                persentase_vegetasi=round(habitat_input["Persentase_Vegetasi"], 1),
                air_tenang=cfg["air_tenang"],
                paparan_matahari=cfg["paparan"],
                luas_genangan_m2=round(habitat_input["Luas_Genangan_m2"], 1),
                curah_hujan_30_hari_mm=round(habitat_input["Curah_Hujan_30_Hari_mm"], 1),
                jarak_hutan_m=round(habitat_input["Jarak_Hutan_m"], 1),
                jarak_sawah_m=round(habitat_input["Jarak_Sawah_m"], 1),
                jarak_sungai_m=round(habitat_input["Jarak_Sungai_m"], 1),
                jarak_rawa_m=round(habitat_input["Jarak_Rawa_m"], 1),
                jarak_tambang_m=round(habitat_input["Jarak_Tambang_m"], 1),
                jarak_permukiman_m=round(habitat_input["Jarak_Permukiman_m"], 1),
                jarak_puskesmas_m=round(habitat_input["Jarak_Puskesmas_m"], 1),
                pendatang_30_hari=mobility_input["Pendatang_30_Hari"],
                pendatang_dari_endemis=mobility_input["Pendatang_Dari_Endemis"],
                pekerja_mobil=mobility_input["Pekerja_Mobil"],
                riwayat_perjalanan_endemis=mobility_input["Riwayat_Perjalanan_Endemis"],
                kasus_malaria_1km_30hari=kasus,
                habitat_risk_score=risk["habitat_risk_score"],
                habitat_category=risk["habitat_category"],
                mobility_risk_score=risk["mobility_risk_score"],
                case_score=risk["case_score"],
                risiko_gabungan=risk["risiko_gabungan"],
                heatmap_category=risk["heatmap_category"],
                tindakan="Fogging terjadwal" if j == 2 else None,
                ditindaklanjuti_pada=now if j == 2 else None,
                diverifikasi_oleh="Dr. Budi Santoso" if j == 2 else None,
            )
            session.add(laporan)

    session.commit()
    print(f"Seeded {len(demo_configs) * 3} laporan demo.")


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_demo(session)
