from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.employee import Employee
from app.models.redeemed_history import RedeemedHistory
from app.schemas.redeemed_history import RedeemedHistoryOut

router = APIRouter(prefix="/redeemed-history", tags=["redeemed-history"])


@router.get("", response_model=list[RedeemedHistoryOut])
def my_redeemed_history(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(RedeemedHistory).filter(RedeemedHistory.employee_id == current_employee.id).all()
