import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "WindSignal — UK Wind Forecast Intelligence"
    API_V1_PREFIX: str = "/api"
    ELEXON_BASE_URL: str = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
    CACHE_DIR: Path = Path(os.getenv("CACHE_DIR", str(Path(__file__).parent.parent / "data_cache")))
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]
    REQUEST_TIMEOUT: float = 25.0
    MAX_RETRIES: int = 3
    DEFAULT_MONTH: str = "2026-01"
    EVAL_START_DATE: str = "2026-01-01"
    EVAL_END_DATE: str = "2026-01-31"

settings = Settings()
