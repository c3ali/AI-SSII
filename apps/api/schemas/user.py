from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    DEVELOPER = "DEVELOPER"


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    id: str
    role: Role
    avatar: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    lastLoginAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
