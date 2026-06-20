from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_business, get_current_employee
from app.db.session import get_db
from app.models.business import Business
from app.models.employee import Employee
from app.models.quest import Quest
from app.models.service import Service
from app.schemas.quest import QuestCreate, QuestOut

router = APIRouter(prefix="/quests", tags=["quests"])


@router.post("", response_model=QuestOut, status_code=status.HTTP_201_CREATED)
def grant_quest(
    payload: QuestCreate,
    db: Session = Depends(get_db),
    current_business: Business = Depends(get_current_business),
):
    employee = db.get(Employee, payload.employee_id)
    if not employee or employee.business_id != current_business.id:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db.get(Service, payload.service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    quest = Quest(employee_id=payload.employee_id, service_id=payload.service_id)
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


@router.get("", response_model=list[QuestOut])
def my_quests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(Quest).filter(Quest.employee_id == current_employee.id).all()
