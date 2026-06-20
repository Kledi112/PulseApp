from typing import Literal

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    role: Literal["employer", "employee"]
    name: str
    email: EmailStr
    password: str
    employer_id: int | None = None  # required when role == "employee"


class LoginRequest(BaseModel):
    role: Literal["employer", "employee"]
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal["employer", "employee"]
