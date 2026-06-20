from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict


class QuestCreate(BaseModel):
    title: str
    description: str | None = None
    reward: str
    type: Literal["team", "individual", "either"]
    deadline: date


class QuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    reward: str
    type: str
    deadline: date
    status: str
    winner_id: int | None
    winner_name: str | None


class QuestEntryCreate(BaseModel):
    mode: Literal["individual", "team"]
    team_id: int | None = None  # required when mode == "team"


class QuestEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quest_id: int
    mode: str
    participant_id: int
    participant_name: str


class SelectWinnerRequest(BaseModel):
    employee_id: int | None = None
    team_id: int | None = None


class LeaderboardEntryOut(BaseModel):
    id: str
    name: str
    type: Literal["team", "individual"]
    quests_completed: int
    period: Literal["month", "quarter"]
