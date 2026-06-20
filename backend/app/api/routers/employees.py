from fastapi import APIRouter, Depends

from app.api.deps import get_current_employee
from app.models.employee import Employee
from app.schemas.employee import EmployeeOut

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/me", response_model=EmployeeOut)
def read_current_employee(current_employee: Employee = Depends(get_current_employee)):
    return current_employee
