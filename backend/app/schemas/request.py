from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class RequestCreate(BaseModel):
    type: Literal["single", "bundle"]
    service_ids: list[int]


class RequestItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    title: str
    provider_name: str
    original_price_all: int
    discounted_price_all: int


class RequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str
    type: str
    items: list[RequestItemOut]
    total_all: int
    status: str
    created_at: datetime
    paid_at: datetime | None
    payment_method: str | None


class RequestApprove(BaseModel):
    payment_method: Literal["card", "paypal"]
