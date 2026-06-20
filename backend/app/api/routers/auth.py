from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.employee import Employee
from app.models.business import Business
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role == "business":
        if db.query(Business).filter(Business.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        business = Business(name=payload.name, email=payload.email, hashed_password=hash_password(payload.password))
        db.add(business)
        db.commit()
        db.refresh(business)
        token = create_access_token(subject=str(business.id), role="business")
        return TokenResponse(access_token=token, role="business")

    if payload.business_id is None:
        raise HTTPException(status_code=400, detail="business_id is required to register an employee")
    if not db.get(Business, payload.business_id):
        raise HTTPException(status_code=404, detail="Business not found")
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    employee = Employee(
        name=payload.name,
        lastname=payload.lastname,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        business_id=payload.business_id,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    token = create_access_token(subject=str(employee.id), role="employee")
    return TokenResponse(access_token=token, role="employee")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    model = Business if payload.role == "business" else Employee
    account = db.query(model).filter(model.email == payload.email).first()
    if not account or not verify_password(payload.password, account.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(account.id), role=payload.role)
    return TokenResponse(access_token=token, role=payload.role)
