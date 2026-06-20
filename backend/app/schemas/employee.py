from pydantic import BaseModel, EmailStr, ConfigDict


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    avatar_uri: str | None
    team_id: int | None
    team_name: str | None
