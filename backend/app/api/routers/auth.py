from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.business_application import BusinessApplication
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Self-serve signups (the login screen's "demo access" form) don't pick a business,
# so they're dropped into the seeded demo company - that's what lets a freshly
# registered manager see the seeded employees, and a freshly registered employee
# show up on that manager's roster.
DEMO_BUSINESS_EMAIL = "hello@pulse-demo.com"
DEMO_EMPLOYEE_STARTING_BUDGET_ALL = 10_000


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    business_id = payload.business_id
    if business_id is None:
        demo_business = db.query(BusinessApplication).filter(BusinessApplication.email == DEMO_BUSINESS_EMAIL).first()
        business_id = demo_business.id if demo_business else None

    employee = Employee(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        business_id=business_id,
        team_id=payload.team_id,
        monthly_budget_all=DEMO_EMPLOYEE_STARTING_BUDGET_ALL if payload.role == "employee" else 0,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    token = create_access_token(subject=str(employee.id))
    return TokenResponse(access_token=token, role=employee.role)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.email == payload.email).first()
    if not employee or not verify_password(payload.password, employee.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(employee.id))
    return TokenResponse(access_token=token, role=employee.role)
