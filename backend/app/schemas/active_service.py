from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ActiveServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    request_id: int
    service_id: int
    title: str
    provider_name: str
    price_all: int
    status: str
    requested_at: datetime
