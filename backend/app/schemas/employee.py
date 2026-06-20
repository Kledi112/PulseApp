from pydantic import BaseModel, EmailStr, ConfigDict


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    name: str
    lastname: str | None
    email: EmailStr
