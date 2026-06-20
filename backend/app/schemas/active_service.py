from pydantic import BaseModel, ConfigDict


class ActiveServiceCreate(BaseModel):
    service_id: int


class ActiveServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    service_id: int
    status: str
