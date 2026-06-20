from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.employee import Employee

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_employee(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Employee:
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    employee = db.get(Employee, int(payload["sub"]))
    if employee is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found")
    return employee


def get_current_manager(current_employee: Employee = Depends(get_current_employee)) -> Employee:
    if current_employee.role != "manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager account required")
    return current_employee
