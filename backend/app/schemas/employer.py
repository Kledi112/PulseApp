from pydantic import BaseModel, EmailStr, ConfigDict


class EmployerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
