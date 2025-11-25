from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User, UserRole
from ..models.tutorial import Tutorial, user_tutorial_access
from ..schemas.user import (
    UserResponse,
    UserWithTutorials,
    UserUpdate,
    UserPasswordUpdate,
    UserTutorialAccess
)
from ..services.auth import (
    get_current_user,
    get_password_hash,
    verify_password,
    require_role
)

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """List all users (Admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserWithTutorials)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    # Users can only view their own profile unless they're admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get accessible tutorial IDs
    accessible_tutorial_ids = [t.id for t in user.accessible_tutorials]

    return UserWithTutorials(
        **user.__dict__,
        accessible_tutorial_ids=accessible_tutorial_ids
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user information"""
    # Users can only update their own profile unless they're admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Only admins can change role and is_active
    if current_user.role != UserRole.ADMIN:
        user_update.role = None
        user_update.is_active = None

    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Delete user (Admin only)"""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return None


@router.post("/{user_id}/password")
async def change_password(
    user_id: str,
    password_update: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    # Users can only change their own password
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify current password
    if not verify_password(password_update.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    user.hashed_password = get_password_hash(password_update.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


@router.post("/{user_id}/tutorials/access")
async def grant_tutorial_access(
    user_id: str,
    access_data: UserTutorialAccess,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Grant user access to specific tutorials (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get tutorials
    tutorials = db.query(Tutorial).filter(Tutorial.id.in_(access_data.tutorial_ids)).all()

    if len(tutorials) != len(access_data.tutorial_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some tutorials not found"
        )

    # Add tutorials to user's accessible list
    for tutorial in tutorials:
        if tutorial not in user.accessible_tutorials:
            user.accessible_tutorials.append(tutorial)

    db.commit()

    return {"message": f"Access granted to {len(tutorials)} tutorials"}


@router.delete("/{user_id}/tutorials/{tutorial_id}/access")
async def revoke_tutorial_access(
    user_id: str,
    tutorial_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Revoke user access to a specific tutorial (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    tutorial = db.query(Tutorial).filter(Tutorial.id == tutorial_id).first()
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )

    # Remove tutorial from user's accessible list
    if tutorial in user.accessible_tutorials:
        user.accessible_tutorials.remove(tutorial)
        db.commit()

    return {"message": "Access revoked"}


@router.get("/{user_id}/tutorials", response_model=List[str])
async def get_user_accessible_tutorials(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of tutorial IDs user has access to"""
    # Users can only view their own accessible tutorials unless they're admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return [t.id for t in user.accessible_tutorials]
