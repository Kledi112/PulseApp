from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RedemptionCreate(BaseModel):
    perk_id: int


class RedemptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    perk_id: int
    employee_id: int
    redeemed_at: datetime
    status: str
