from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from ..database import get_db
from ..models import Progress, Tutorial, Step
from ..schemas.progress import ProgressCreate, ProgressUpdate, ProgressResponse

router = APIRouter()


@router.post("/progress", response_model=ProgressResponse)
def create_progress(progress: ProgressCreate, db: Session = Depends(get_db)):
    """Start tracking progress for a tutorial"""
    # TODO: Get user_id from auth
    user_id = "default-user"

    # Check if progress already exists
    existing = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.tutorial_id == progress.tutorial_id
    ).first()

    if existing:
        return existing

    db_progress = Progress(
        user_id=user_id,
        tutorial_id=progress.tutorial_id
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


@router.get("/progress/{tutorial_id}", response_model=ProgressResponse)
def get_progress(tutorial_id: str, db: Session = Depends(get_db)):
    """Get user's progress for a specific tutorial"""
    # TODO: Get user_id from auth
    user_id = "default-user"

    progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.tutorial_id == tutorial_id
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    return progress


@router.put("/progress/{progress_id}", response_model=ProgressResponse)
def update_progress(
    progress_id: str,
    progress_update: ProgressUpdate,
    db: Session = Depends(get_db)
):
    """Update user's progress"""
    db_progress = db.query(Progress).filter(Progress.id == progress_id).first()

    if not db_progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    update_data = progress_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_progress, field, value)

    db.commit()
    db.refresh(db_progress)
    return db_progress


@router.get("/tutorials/{tutorial_id}/stats")
def get_tutorial_stats(tutorial_id: str, db: Session = Depends(get_db)):
    """Get analytics stats for a tutorial"""
    tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()

    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    # Get all progress records for this tutorial
    progress_records = db.query(Progress).filter(
        Progress.tutorial_id == tutorial_id
    ).all()

    total_users = len(progress_records)
    completed_users = len([p for p in progress_records if p.completed])
    completion_rate = (completed_users / total_users * 100) if total_users > 0 else 0

    # Calculate average time per step
    avg_time_per_step = {}
    for step in tutorial.steps:
        step_times = []
        for progress in progress_records:
            if str(step.order) in progress.time_per_step:
                step_times.append(progress.time_per_step[str(step.order)])

        avg_time_per_step[step.order] = sum(step_times) / len(step_times) if step_times else 0

    # Calculate average score
    scores = [p.score for p in progress_records if p.score > 0]
    avg_score = sum(scores) / len(scores) if scores else 0

    return {
        "tutorial_id": tutorial_id,
        "total_users": total_users,
        "completed_users": completed_users,
        "completion_rate": round(completion_rate, 2),
        "average_score": round(avg_score, 2),
        "average_time_per_step": avg_time_per_step,
        "total_steps": len(tutorial.steps)
    }


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    total_tutorials = db.query(Tutorial).count()
    published_tutorials = db.query(Tutorial).filter(Tutorial.is_published == True).count()

    # TODO: Get user_id from auth
    user_id = "default-user"

    user_progress = db.query(Progress).filter(Progress.user_id == user_id).all()
    in_progress = len([p for p in user_progress if not p.completed])
    completed = len([p for p in user_progress if p.completed])

    return {
        "total_tutorials": total_tutorials,
        "published_tutorials": published_tutorials,
        "in_progress": in_progress,
        "completed": completed
    }
