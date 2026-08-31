import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Financial Research System"
    API_V1_STR: str = "/api/v1"

    # Base directory
    BASE_DIR: Path = BASE_DIR
    
    # Storage Paths
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    SEED_DIR: Path = BASE_DIR / "data" / "seed_documents"
    CHROMA_PERSIST_DIR: Path = BASE_DIR / "data" / "vector_store"
    
    # Gemini API Settings
    GEMINI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-2"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Automatically create data directories if they do not exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.SEED_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)