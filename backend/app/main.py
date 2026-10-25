import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("windsignal")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing WindSignal UK Wind Forecast Intelligence Service...")
    logger.info(f"Target Evaluation Month: {settings.DEFAULT_MONTH}")
    logger.info(f"Elexon Base URL: {settings.ELEXON_BASE_URL}")
    logger.info(f"Cache Directory: {settings.CACHE_DIR}")
    yield
    logger.info("Shutting down WindSignal...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="UK Wind Forecast Intelligence decision-support platform evaluating January 2026 Elexon BMRS actuals & forecasts.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred while processing wind forecast data."},
    )

# Register routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", summary="Root index")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "apiPrefix": settings.API_V1_PREFIX,
        "evaluationTarget": "January 2026 (1–31 Jan 2026)",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
