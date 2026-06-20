from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.employee import Employee
from app.schemas.ai import AssistantReply, AssistantRequest
from app.schemas.service import ServiceOut
from app.services.ai_service import ask_assistant, get_recommendations

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/recommendations", response_model=list[ServiceOut])
def recommendations(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return get_recommendations(db, current_employee)


@router.post("/assistant", response_model=AssistantReply)
def assistant(
    payload: AssistantRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    text, perks = ask_assistant(db, current_employee, payload.message)
    return AssistantReply(text=text, perks=perks)
