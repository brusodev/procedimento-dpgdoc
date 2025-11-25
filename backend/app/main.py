from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import tutorials, analytics, upload, auth, users
import os
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
