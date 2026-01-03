"""FixMate Backend - FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.webhooks import router as webhooks_router

app = FastAPI(
    title="FixMate API",
    description="AI-powered property maintenance management",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")
app.include_router(webhooks_router, prefix="/api")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "FixMate API",
        "version": "0.1.0",
    }


@app.get("/health")
async def health():
    """Health check."""
    return {"status": "ok"}
