from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CreatePoolRequest(BaseModel):
    service_id: int
    amount_all: int = Field(gt=0)


class JoinPoolRequest(BaseModel):
    amount_all: int = Field(gt=0)


class PoolContributionOut(BaseModel):
    employee_id: int
    employee_name: str
    amount_all: int
    contributed_at: datetime


class PerkPoolOut(BaseModel):
    id: int
    service_id: int
    title: str
    provider_name: str
    host_employee_id: int
    host_name: str
    target_amount_all: int
    contributed_all: int
    status: Literal["open", "completed", "cancelled"]
    active_service_id: int | None
    created_at: datetime
    completed_at: datetime | None
    contributions: list[PoolContributionOut]
