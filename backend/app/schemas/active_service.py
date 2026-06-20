from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ActiveServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    service_id: int
    token: str
    title: str
    provider_name: str
    price_all: int
    status: Literal["active", "claimed"]
    taken_at: datetime
    claimed_at: datetime | None


class TakePerkRequest(BaseModel):
    service_id: int


class TakeBundleRequest(BaseModel):
    service_ids: list[int]


class BudgetOut(BaseModel):
    monthly_budget_all: int
    reserved_all: int
    claimed_all: int
    remaining_all: int


class SetBudgetRequest(BaseModel):
    monthly_budget_all: int = Field(ge=0)
