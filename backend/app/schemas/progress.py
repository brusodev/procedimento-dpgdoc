from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class ProgressCreate(BaseModel):
    tutorial_id: str


class ProgressUpdate(BaseModel):
    current_step: Optional[int] = None
    completed_steps: Optional[List[int]] = None
    time_per_step: Optional[Dict[str, int]] = None
    attempts: Optional[int] = None
    completed: Optional[bool] = None
    score: Optional[float] = None


class ProgressResponse(BaseModel):
    id: str
    user_id: str
    tutorial_id: str
    current_step: int
    completed_steps: List[int]
    time_per_step: Dict[str, int]
    attempts: int
    completed: bool
    score: float
    started_at: datetime
    completed_at: Optional[datetime]
    last_accessed: datetime

    class Config:
        from_attributes = True
