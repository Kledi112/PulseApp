from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.models.redeemed_history import RedeemedHistory
from app.schemas.redeemed_history import RedeemedHistoryCreate, RedeemedHistoryOut

router = APIRouter(prefix="/redeemed-history", tags=["redeemed-history"])


@router.post("", response_model=RedeemedHistoryOut, status_code=status.HTTP_201_CREATED)
def redeem_service(
    payload: RedeemedHistoryCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    active_service = (
        db.query(ActiveService)
        .filter(
            ActiveService.employee_id == current_employee.id,
            ActiveService.service_id == payload.service_id,
            ActiveService.status == "active",
        )
        .first()
    )
    if not active_service:
        raise HTTPException(status_code=404, detail="No approved active service found to redeem")

    db.delete(active_service)

    redeemed = RedeemedHistory(service_id=payload.service_id, employee_id=current_employee.id)
    db.add(redeemed)
    db.commit()
    db.refresh(redeemed)
    return redeemed


@router.get("", response_model=list[RedeemedHistoryOut])
def my_redeemed_history(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(RedeemedHistory).filter(RedeemedHistory.employee_id == current_employee.id).all()
