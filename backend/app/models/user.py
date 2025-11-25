from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from ..database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COLABORADOR = "colaborador"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), default=UserRole.COLABORADOR)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)

    tutorials = relationship("Tutorial", back_populates="creator")
    progress_records = relationship("Progress", back_populates="user")
    # Tutorials this user can access
    accessible_tutorials = relationship("Tutorial", secondary="user_tutorial_access", back_populates="allowed_users")
