from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.employee import Employee
from app.models.perk import Perk
from app.models.redemption import Redemption
from app.schemas.redemption import RedemptionCreate, RedemptionOut

router = APIRouter(prefix="/redemptions", tags=["redemptions"])


@router.post("", response_model=RedemptionOut, status_code=status.HTTP_201_CREATED)
def redeem_perk(
    payload: RedemptionCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    perk = db.get(Perk, payload.perk_id)
    if not perk or perk.employer_id != current_employee.employer_id or not perk.active:
        raise HTTPException(status_code=404, detail="Perk not found")

    redemption = Redemption(perk_id=perk.id, employee_id=current_employee.id)
    db.add(redemption)
    db.commit()
    db.refresh(redemption)
    return redemption


@router.get("", response_model=list[RedemptionOut])
def my_redemptions(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(Redemption).filter(Redemption.employee_id == current_employee.id).all()
