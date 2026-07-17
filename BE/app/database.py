from sqlmodel import create_engine, Session
from app.config import DATABASE_URL

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

if "supabase" in DATABASE_URL or "postgresql" in DATABASE_URL:
    if "sslmode" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL + "?sslmode=require"

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session():
    with Session(engine) as session:
        yield session
