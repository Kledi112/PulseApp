from pydantic import BaseModel, ConfigDict


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    provider_id: int
    provider_name: str
    title: str
    description: str | None
    category: str | None
    price_all: int
    image_uri: str | None
    active: bool
