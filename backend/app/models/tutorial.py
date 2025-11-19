from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Tutorial(Base):
    __tablename__ = "tutorials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    tags = Column(JSON, default=list)
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_published = Column(Boolean, default=False)
    version = Column(Integer, default=1)

    steps = relationship("Step", back_populates="tutorial", cascade="all, delete-orphan")
    creator = relationship("User", back_populates="tutorials")
    progress_records = relationship("Progress", back_populates="tutorial", cascade="all, delete-orphan")


class Step(Base):
    __tablename__ = "steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tutorial_id = Column(String, ForeignKey("tutorials.id"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    screenshot_url = Column(String(500))
    video_url = Column(String(500))  # URL do vídeo
    content = Column(Text)  # Rich text HTML from TipTap
    validation_required = Column(Boolean, default=False)
    validation_type = Column(String(50))  # click, input, selection
    validation_target = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    tutorial = relationship("Tutorial", back_populates="steps")
    annotations = relationship("Annotation", back_populates="step", cascade="all, delete-orphan")


class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    step_id = Column(String, ForeignKey("steps.id"), nullable=False)
    type = Column(String(50), nullable=False)  # arrow, box, tooltip, highlight
    coordinates = Column(JSON, nullable=False)  # {x, y, width, height, points (for arrows)}
    text = Column(Text)
    animation = Column(String(50), default="fadeIn")  # fadeIn, slideIn, bounce
    delay = Column(Integer, default=0)  # milliseconds
    style = Column(JSON)  # color, strokeWidth, etc.

    step = relationship("Step", back_populates="annotations")
