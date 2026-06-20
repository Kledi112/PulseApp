from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_business, get_current_employee
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.business import Business
from app.models.employee import Employee
from app.models.service import Service
from app.schemas.active_service import ActiveServiceCreate, ActiveServiceOut

router = APIRouter(prefix="/active-services", tags=["active-services"])


@router.post("", response_model=ActiveServiceOut, status_code=status.HTTP_201_CREATED)
def request_service(
    payload: ActiveServiceCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if not db.get(Service, payload.service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    active_service = ActiveService(
        employee_id=current_employee.id,
        service_id=payload.service_id,
        status="pending",
    )
    db.add(active_service)
    db.commit()
    db.refresh(active_service)
    return active_service


@router.get("", response_model=list[ActiveServiceOut])
def my_active_services(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(ActiveService).filter(ActiveService.employee_id == current_employee.id).all()


@router.get("/business", response_model=list[ActiveServiceOut])
def active_services_for_business(
    db: Session = Depends(get_db),
    current_business: Business = Depends(get_current_business),
):
    return (
        db.query(ActiveService)
        .join(Employee, Employee.id == ActiveService.employee_id)
        .filter(Employee.business_id == current_business.id)
        .all()
    )


def _get_pending_request_for_business(db: Session, active_service_id: int, business_id: int) -> ActiveService:
    active_service = (
        db.query(ActiveService)
        .join(Employee, Employee.id == ActiveService.employee_id)
        .filter(ActiveService.id == active_service_id, Employee.business_id == business_id)
        .first()
    )
    if not active_service:
        raise HTTPException(status_code=404, detail="Request not found")
    return active_service


@router.post("/{active_service_id}/approve", response_model=ActiveServiceOut)
def approve_request(
    active_service_id: int,
    db: Session = Depends(get_db),
    current_business: Business = Depends(get_current_business),
):
    active_service = _get_pending_request_for_business(db, active_service_id, current_business.id)
    active_service.status = "active"
    db.commit()
    db.refresh(active_service)
    return active_service


@router.post("/{active_service_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
def reject_request(
    active_service_id: int,
    db: Session = Depends(get_db),
    current_business: Business = Depends(get_current_business),
):
    active_service = _get_pending_request_for_business(db, active_service_id, current_business.id)
    db.delete(active_service)
    db.commit()
