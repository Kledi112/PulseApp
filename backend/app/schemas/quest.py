from pydantic import BaseModel, ConfigDict


class QuestCreate(BaseModel):
    employee_id: int
    service_id: int


class QuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    service_id: int
