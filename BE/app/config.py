import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./malariawatch.db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MODEL_DIR = os.getenv("MODEL_DIR", "./models")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "")
USE_AI_ENGINE = os.getenv("USE_AI_ENGINE", "false").lower() in ("true", "1", "yes")
AI_ENGINE_TIMEOUT = int(os.getenv("AI_ENGINE_TIMEOUT", "5"))
