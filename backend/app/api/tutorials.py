from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Tutorial, Step, Annotation
from ..schemas.tutorial import (
    TutorialCreate, TutorialUpdate, TutorialResponse, TutorialListResponse,
    StepCreate, StepUpdate, StepResponse, AnnotationCreate
)

router = APIRouter()


@router.post("/", response_model=TutorialResponse, status_code=status.HTTP_201_CREATED)
def create_tutorial(tutorial: TutorialCreate, db: Session = Depends(get_db)):
    """Create a new tutorial with steps and annotations"""

    # Create tutorial
    db_tutorial = Tutorial(
        title=tutorial.title,
        description=tutorial.description,
        category=tutorial.category,
        tags=tutorial.tags,
        created_by="default-user"  # TODO: Get from auth
    )
    db.add(db_tutorial)
    db.flush()

    # Create steps with annotations
    for step_data in tutorial.steps:
        db_step = Step(
            tutorial_id=db_tutorial.id,
            order=step_data.order,
            title=step_data.title,
            screenshot_url=step_data.screenshot_url,
            video_url=step_data.video_url,
            content=step_data.content,
            validation_required=step_data.validation_required,
            validation_type=step_data.validation_type,
            validation_target=step_data.validation_target
        )
        db.add(db_step)
        db.flush()

        # Create annotations for this step
        for ann_data in step_data.annotations:
            db_annotation = Annotation(
                step_id=db_step.id,
                type=ann_data.type,
                coordinates=ann_data.coordinates,
                text=ann_data.text,
                animation=ann_data.animation,
                delay=ann_data.delay,
                style=ann_data.style
            )
            db.add(db_annotation)

    db.commit()
    db.refresh(db_tutorial)
    return db_tutorial


@router.get("/", response_model=List[TutorialListResponse])
def list_tutorials(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    published_only: bool = False,
    db: Session = Depends(get_db)
):
    """List all tutorials with pagination and filters"""
    query = db.query(Tutorial)

    if category:
        query = query.filter(Tutorial.category == category)

    if published_only:
        query = query.filter(Tutorial.is_published == True)

    tutorials = query.offset(skip).limit(limit).all()

    # Convert to list response with step count
    result = []
    for tutorial in tutorials:
        tutorial_dict = TutorialListResponse(
            id=tutorial.id,
            title=tutorial.title,
            description=tutorial.description,
            category=tutorial.category,
            tags=tutorial.tags,
            created_at=tutorial.created_at,
            is_published=tutorial.is_published,
            step_count=len(tutorial.steps)
        )
        result.append(tutorial_dict)

    return result


@router.get("/{tutorial_id}", response_model=TutorialResponse)
def get_tutorial(tutorial_id: str, db: Session = Depends(get_db)):
    """Get a specific tutorial with all steps and annotations"""
    tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()

    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    return tutorial


@router.put("/{tutorial_id}", response_model=TutorialResponse)
def update_tutorial(
    tutorial_id: str,
    tutorial_update: TutorialUpdate,
    db: Session = Depends(get_db)
):
    """Update tutorial with all metadata and steps"""
    db_tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()

    if not db_tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    # Update tutorial metadata (excluding steps)
    update_data = tutorial_update.dict(exclude_none=True, exclude={'steps'})

    for field, value in update_data.items():
        setattr(db_tutorial, field, value)

    # Update steps if provided
    if hasattr(tutorial_update, 'steps') and tutorial_update.steps is not None:
        # Delete all existing steps
        db.query(Step).filter(Step.tutorial_id == tutorial_id).delete()

        # Create new steps
        for step_data in tutorial_update.steps:
            db_step = Step(
                tutorial_id=tutorial_id,
                order=step_data.order,
                title=step_data.title,
                screenshot_url=step_data.screenshot_url,
                video_url=step_data.video_url,
                content=step_data.content,
                validation_required=step_data.validation_required,
                validation_type=step_data.validation_type,
                validation_target=step_data.validation_target
            )
            db.add(db_step)
            db.flush()

            # Create annotations for this step
            if hasattr(step_data, 'annotations') and step_data.annotations:
                for ann_data in step_data.annotations:
                    db_annotation = Annotation(
                        step_id=db_step.id,
                        type=ann_data.type,
                        coordinates=ann_data.coordinates,
                        text=ann_data.text,
                        animation=ann_data.animation,
                        delay=ann_data.delay,
                        style=ann_data.style
                    )
                    db.add(db_annotation)

    db.commit()
    db.refresh(db_tutorial)
    return db_tutorial


@router.delete("/{tutorial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tutorial(tutorial_id: str, db: Session = Depends(get_db)):
    """Delete a tutorial and all associated steps"""
    db_tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()

    if not db_tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    db.delete(db_tutorial)
    db.commit()
    return None


@router.post("/{tutorial_id}/steps", response_model=StepResponse, status_code=status.HTTP_201_CREATED)
def add_step(tutorial_id: str, step: StepCreate, db: Session = Depends(get_db)):
    """Add a new step to a tutorial"""
    tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()

    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    db_step = Step(
        tutorial_id=tutorial_id,
        order=step.order,
        title=step.title,
        screenshot_url=step.screenshot_url,
        video_url=step.video_url,
        content=step.content,
        validation_required=step.validation_required,
        validation_type=step.validation_type,
        validation_target=step.validation_target
    )
    db.add(db_step)
    db.flush()

    # Add annotations
    for ann_data in step.annotations:
        db_annotation = Annotation(
            step_id=db_step.id,
            type=ann_data.type,
            coordinates=ann_data.coordinates,
            text=ann_data.text,
            animation=ann_data.animation,
            delay=ann_data.delay,
            style=ann_data.style
        )
        db.add(db_annotation)

    db.commit()
    db.refresh(db_step)
    return db_step


@router.put("/{tutorial_id}/steps/{step_id}", response_model=StepResponse)
def update_step(
    tutorial_id: str,
    step_id: str,
    step_update: StepUpdate,
    db: Session = Depends(get_db)
):
    """Update a step"""
    db_step = db.query(Step).filter(
        Step.id == step_id,
        Step.tutorial_id == tutorial_id
    ).first()

    if not db_step:
        raise HTTPException(status_code=404, detail="Step not found")

    update_data = step_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_step, field, value)

    db.commit()
    db.refresh(db_step)
    return db_step


@router.delete("/{tutorial_id}/steps/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_step(tutorial_id: str, step_id: str, db: Session = Depends(get_db)):
    """Delete a step"""
    db_step = db.query(Step).filter(
        Step.id == step_id,
        Step.tutorial_id == tutorial_id
    ).first()

    if not db_step:
        raise HTTPException(status_code=404, detail="Step not found")

    db.delete(db_step)
    db.commit()
    return None
