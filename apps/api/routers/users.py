from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import SessionLocal, User as UserModel
from schemas.user import UserResponse, UserUpdate
from core.security import get_current_user_id

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.avatar is not None:
        user.avatar = user_data.avatar

    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.model_validate(user)
