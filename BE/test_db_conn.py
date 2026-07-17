from app.database import engine
from sqlmodel import Session, text

try:
    with Session(engine) as s:
        result = s.exec(text('SELECT 1')).first()
        print("CONNECTION SUCCESS:", result)
except Exception as e:
    print("CONNECTION FAILED:", e)
