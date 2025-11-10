from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal, User as UserModel
from schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from core.security import hash_password, verify_password, create_access_token

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    hashed_password = hash_password(user_data.password)
    db_user = UserModel(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        role="USER"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token = create_access_token(data={"sub": db_user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(db_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    # Find user
    user = db.query(UserModel).filter(UserModel.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Update last login
    user.lastLoginAt = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )
