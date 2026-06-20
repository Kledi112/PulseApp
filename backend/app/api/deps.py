from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.employee import Employee
from app.models.employer import Employer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _decode(token: str) -> dict:
    try:
        return decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_employee(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Employee:
    payload = _decode(token)
    if payload.get("role") != "employee":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employee account required")
    employee = db.get(Employee, int(payload["sub"]))
    if employee is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Employee not found")
    return employee


def get_current_employer(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Employer:
    payload = _decode(token)
    if payload.get("role") != "employer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employer account required")
    employer = db.get(Employer, int(payload["sub"]))
    if employer is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Employer not found")
    return employer
