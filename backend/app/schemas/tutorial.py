from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AnnotationCreate(BaseModel):
    type: str = Field(..., description="arrow, box, tooltip, highlight")
    coordinates: Dict[str, Any]
    text: Optional[str] = None
    animation: str = "fadeIn"
    delay: int = 0
    style: Optional[Dict[str, Any]] = None


class AnnotationResponse(AnnotationCreate):
    id: str
    step_id: str

    class Config:
        from_attributes = True


class StepCreate(BaseModel):
    order: int
    title: str
    screenshot_url: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    validation_required: bool = False
    validation_type: Optional[str] = None
    validation_target: Optional[str] = None
    annotations: List[AnnotationCreate] = []


class StepUpdate(BaseModel):
    order: Optional[int] = None
    title: Optional[str] = None
    screenshot_url: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    validation_required: Optional[bool] = None
    validation_type: Optional[str] = None
    validation_target: Optional[str] = None
    annotations: List[AnnotationCreate] = []


class StepResponse(BaseModel):
    id: str
    tutorial_id: str
    order: int
    title: str
    screenshot_url: Optional[str]
    video_url: Optional[str]
    content: Optional[str]
    validation_required: bool
    validation_type: Optional[str]
    validation_target: Optional[str]
    created_at: datetime
    annotations: List[AnnotationResponse] = []

    class Config:
        from_attributes = True


class TutorialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    steps: List[StepCreate] = []


class TutorialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    steps: Optional[List[StepCreate]] = None


class TutorialResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    tags: List[str]
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_published: bool
    version: int
    steps: List[StepResponse] = []

    class Config:
        from_attributes = True


class TutorialListResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    tags: List[str]
    created_at: datetime
    is_published: bool
    step_count: int = 0

    class Config:
        from_attributes = True
