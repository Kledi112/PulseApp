from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RedeemedHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    service_id: int
    title: str
    provider_name: str
    price_all: int
    claimed_at: datetime
