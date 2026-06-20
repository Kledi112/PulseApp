from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee, get_current_employer
from app.db.session import get_db
from app.models.employer import Employer
from app.models.employee import Employee
from app.models.perk import Perk
from app.schemas.perk import PerkCreate, PerkOut

router = APIRouter(prefix="/perks", tags=["perks"])


@router.post("", response_model=PerkOut, status_code=status.HTTP_201_CREATED)
def create_perk(
    payload: PerkCreate,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer),
):
    perk = Perk(**payload.model_dump(), employer_id=current_employer.id)
    db.add(perk)
    db.commit()
    db.refresh(perk)
    return perk


@router.get("", response_model=list[PerkOut])
def list_perks(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return (
        db.query(Perk)
        .filter(Perk.employer_id == current_employee.employer_id, Perk.active.is_(True))
        .all()
    )


@router.get("/{perk_id}", response_model=PerkOut)
def get_perk(
    perk_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    perk = db.get(Perk, perk_id)
    if not perk or perk.employer_id != current_employee.employer_id:
        raise HTTPException(status_code=404, detail="Perk not found")
    return perk
