from pydantic import BaseModel, ConfigDict


class PerkCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None


class PerkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employer_id: int
    title: str
    description: str | None
    category: str | None
    active: bool
