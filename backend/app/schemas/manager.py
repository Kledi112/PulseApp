from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EmployeeBudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    monthly_budget_all: int


class SetEmployeeBudgetRequest(BaseModel):
    monthly_budget_all: int = Field(ge=0)


class ClaimedHistoryEntry(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    title: str
    provider_name: str
    price_all: int
    claimed_at: datetime


class InvoiceEmployeeTotal(BaseModel):
    employee_id: int
    employee_name: str
    total_all: int
    items: list[ClaimedHistoryEntry]


class InvoiceOut(BaseModel):
    month: str
    total_all: int
    by_employee: list[InvoiceEmployeeTotal]
