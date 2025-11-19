from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    tutorial_id = Column(String, ForeignKey("tutorials.id"), nullable=False)
    current_step = Column(Integer, default=1)
    completed_steps = Column(JSON, default=list)  # List of step orders
    time_per_step = Column(JSON, default=dict)  # {step_order: seconds}
    attempts = Column(Integer, default=1)
    completed = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    last_accessed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")
    tutorial = relationship("Tutorial", back_populates="progress_records")
