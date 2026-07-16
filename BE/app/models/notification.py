import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, index=True)
    grid_id: str = Field(index=True, max_length=32)
    message: str
    tipe: str = Field(default="peringatan", max_length=16)
    dibaca: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
