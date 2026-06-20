from pydantic import BaseModel, EmailStr, ConfigDict


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employer_id: int
    name: str
    email: EmailStr
