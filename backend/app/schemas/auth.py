from typing import Literal

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    role: Literal["business", "employee"]
    name: str
    lastname: str | None = None  # only used when role == "employee"
    email: EmailStr
    password: str
    business_id: int | None = None  # required when role == "employee"


class LoginRequest(BaseModel):
    role: Literal["business", "employee"]
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal["business", "employee"]
