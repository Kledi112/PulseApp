from pydantic import BaseModel, ConfigDict


class ProviderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    city: str
