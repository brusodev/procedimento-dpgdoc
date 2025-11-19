from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Support both SQLite (development) and PostgreSQL (production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tutorial_system.db")

# SQLAlchemy engine configuration
# For SQLite: add check_same_thread=False
# For PostgreSQL: no special config needed
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True  # Verify connections are valid before using them
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
