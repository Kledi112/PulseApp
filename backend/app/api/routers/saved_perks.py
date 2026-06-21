from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.employee import Employee
from app.models.saved_perk import SavedPerk
from app.models.service import Service
from app.schemas.active_service import TakePerkRequest
from app.schemas.service import ServiceOut

router = APIRouter(prefix="/saved-perks", tags=["saved-perks"])


@router.get("", response_model=list[ServiceOut])
def list_saved_perks(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return (
        db.query(Service)
        .join(SavedPerk, SavedPerk.service_id == Service.id)
        .filter(SavedPerk.employee_id == current_employee.id)
        .all()
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ServiceOut)
def save_perk(
    payload: TakePerkRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    service = db.get(Service, payload.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Perk not found")

    existing = (
        db.query(SavedPerk)
        .filter(SavedPerk.employee_id == current_employee.id, SavedPerk.service_id == service.id)
        .first()
    )
    if not existing:
        db.add(SavedPerk(employee_id=current_employee.id, service_id=service.id))
        db.commit()
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_perk(
    service_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    db.query(SavedPerk).filter(
        SavedPerk.employee_id == current_employee.id, SavedPerk.service_id == service_id
    ).delete()
    db.commit()
