"""
RoadSOS+ FastAPI Application Entry Point

Startup sequence:
1. Load settings from environment
2. Configure CORS, rate limiting, and logging middleware
3. Register all routers under /api/v1
4. Expose health check endpoint
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.routers import auth, media, incidents, near_miss, risk_zones, analytics, emergency, map as map_router

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("roadsos")

# Limiter imported from app.core.limiter — single shared instance

# ── Lifespan (startup / shutdown hooks) ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting up")
    logger.info(f"   Environment : {settings.ENVIRONMENT}")
    logger.info(f"   Debug mode  : {settings.DEBUG}")
    yield
    logger.info("👋 RoadSOS+ shutting down")


# ── App Factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## RoadSOS+ API

An AI-powered road safety platform connecting citizens and road safety authorities.

### User Roles
- **Citizen**: Report accidents, near-misses, view safety map
- **Authority**: Review incidents, view analytics, manage risk zones

### Authentication
All protected routes require `Authorization: Bearer <token>` header.
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://road-sos-plus-frno.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request with method and path."""
    response = await call_next(request)
    logger.info(f"{request.method} {request.url.path} → {response.status_code}")
    return response


# ── Static Files (Local Media Fallback) ───────────────────────────────────────
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(near_miss.router, prefix=API_PREFIX)
app.include_router(risk_zones.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(emergency.router, prefix=API_PREFIX)
app.include_router(map_router.router, prefix=API_PREFIX)


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"], summary="Health check endpoint")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/api/docs",
        "health": "/api/health",
    })