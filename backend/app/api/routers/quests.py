from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee, get_current_manager
from app.db.session import get_db
from app.models.employee import Employee
from app.models.quest import Quest
from app.models.quest_entry import QuestEntry
from app.models.team import Team
from app.schemas.quest import (
    LeaderboardEntryOut,
    QuestCreate,
    QuestEntryCreate,
    QuestEntryOut,
    QuestOut,
    SelectWinnerRequest,
)

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("", response_model=list[QuestOut])
def list_quests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(Quest).all()


@router.post("", response_model=QuestOut, status_code=status.HTTP_201_CREATED)
def create_quest(
    payload: QuestCreate,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    quest = Quest(**payload.model_dump(), status="active")
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


@router.get("/awaiting-winner", response_model=list[QuestOut])
def quests_awaiting_winner(
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    return db.query(Quest).filter(Quest.status == "awaiting_winner").all()


@router.post("/{quest_id}/select-winner", response_model=QuestOut)
def select_winner(
    quest_id: int,
    payload: SelectWinnerRequest,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    quest = db.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if not payload.employee_id and not payload.team_id:
        raise HTTPException(status_code=400, detail="employee_id or team_id is required")

    quest.status = "completed"
    quest.winner_employee_id = payload.employee_id
    quest.winner_team_id = payload.team_id
    db.commit()
    db.refresh(quest)
    return quest


@router.post("/{quest_id}/entries", response_model=QuestEntryOut, status_code=status.HTTP_201_CREATED)
def enter_quest(
    quest_id: int,
    payload: QuestEntryCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if not db.get(Quest, quest_id):
        raise HTTPException(status_code=404, detail="Quest not found")

    if payload.mode == "team":
        if not payload.team_id or not db.get(Team, payload.team_id):
            raise HTTPException(status_code=404, detail="Team not found")
        entry = QuestEntry(quest_id=quest_id, mode="team", team_id=payload.team_id)
    else:
        entry = QuestEntry(quest_id=quest_id, mode="individual", employee_id=current_employee.id)

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{quest_id}/entries", response_model=list[QuestEntryOut])
def get_quest_entries(
    quest_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return db.query(QuestEntry).filter(QuestEntry.quest_id == quest_id).all()


def _in_period(deadline: date, period: str) -> bool:
    today = date.today()
    if period == "month":
        return deadline.year == today.year and deadline.month == today.month
    quarter = (today.month - 1) // 3
    deadline_quarter = (deadline.month - 1) // 3
    return deadline.year == today.year and deadline_quarter == quarter


@router.get("/leaderboard", response_model=list[LeaderboardEntryOut])
def get_leaderboard(
    period: str | None = None,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    completed = db.query(Quest).filter(Quest.status == "completed").all()
    counts: dict[tuple[str, str, str], int] = {}

    for quest in completed:
        periods = ["month", "quarter"] if period is None else [period]
        for p in periods:
            if not _in_period(quest.deadline, p):
                continue
            if quest.winner_team_id:
                key = ("team", str(quest.winner_team_id), p)
            elif quest.winner_employee_id:
                key = ("individual", str(quest.winner_employee_id), p)
            else:
                continue
            counts[key] = counts.get(key, 0) + 1

    entries: list[LeaderboardEntryOut] = []
    for (entry_type, entity_id, p), quests_completed in counts.items():
        name = (
            db.get(Team, int(entity_id)).name
            if entry_type == "team"
            else db.get(Employee, int(entity_id)).name
        )
        entries.append(
            LeaderboardEntryOut(
                id=f"lb-{entry_type}-{entity_id}-{p}",
                name=name,
                type=entry_type,
                quests_completed=quests_completed,
                period=p,
            )
        )
    return entries
