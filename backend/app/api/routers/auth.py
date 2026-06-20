from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.employee import Employee
from app.models.employer import Employer
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role == "employer":
        if db.query(Employer).filter(Employer.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        employer = Employer(name=payload.name, email=payload.email, hashed_password=hash_password(payload.password))
        db.add(employer)
        db.commit()
        db.refresh(employer)
        token = create_access_token(subject=str(employer.id), role="employer")
        return TokenResponse(access_token=token, role="employer")

    if payload.employer_id is None:
        raise HTTPException(status_code=400, detail="employer_id is required to register an employee")
    if not db.get(Employer, payload.employer_id):
        raise HTTPException(status_code=404, detail="Employer not found")
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    employee = Employee(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        employer_id=payload.employer_id,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    token = create_access_token(subject=str(employee.id), role="employee")
    return TokenResponse(access_token=token, role="employee")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    model = Employer if payload.role == "employer" else Employee
    account = db.query(model).filter(model.email == payload.email).first()
    if not account or not verify_password(payload.password, account.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(account.id), role=payload.role)
    return TokenResponse(access_token=token, role=payload.role)
