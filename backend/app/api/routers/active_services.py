from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.schemas.active_service import ActiveServiceOut

router = APIRouter(prefix="/active-services", tags=["active-services"])


@router.get("", response_model=list[ActiveServiceOut])
def my_active_services(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    query = db.query(ActiveService).filter(ActiveService.employee_id == current_employee.id)
    if status_filter:
        query = query.filter(ActiveService.status == status_filter)
    return query.all()
