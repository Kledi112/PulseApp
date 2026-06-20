from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RedeemedHistoryCreate(BaseModel):
    service_id: int


class RedeemedHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    employee_id: int
    redeemed_at: datetime
    status: str
