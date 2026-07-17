import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
# SQLAlchemy requires postgresql:// not just postgres://
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

print(f"Attempting to connect to: {db_url}")

try:
    engine = create_engine(db_url, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        print("✅ SUCCESS! Connected to the database.")
except Exception as e:
    print("❌ FAILED to connect to the database.")
    print("Error Details:", e)
