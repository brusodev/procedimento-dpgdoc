from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .api import tutorials, analytics, upload, auth, users
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tutorial System API",
    description="API for interactive tutorial creation and tracking",
    version="1.0.0"
)

# CORS configuration - allow Railway frontend and local development
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,https://*.railway.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tutorials.router, prefix="/api/tutorials", tags=["tutorials"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])


@app.get("/")
def read_root():
    return {
        "message": "Tutorial System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"

print(f"[INFO] Looking for frontend at: {frontend_dist}")
print(f"[INFO] Frontend exists: {frontend_dist.exists()}")

if frontend_dist.exists():
    # Mount static files
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    # Serve index.html for all frontend routes
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't serve frontend for API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not found"}

        # Serve index.html for all other routes (SPA)
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

        return {"detail": "Frontend not built"}
