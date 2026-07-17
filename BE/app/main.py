import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel

from app.config import CORS_ORIGINS, UPLOAD_DIR
from app.database import engine
from app.routers import routers


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"Warning: Could not run create_all: {e}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="MalariaWatch API",
    description="Backend API untuk sistem surveilans malaria Awas-Jentik",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

for router in routers:
    app.include_router(router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "MalariaWatch API"}
