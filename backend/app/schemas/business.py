from pydantic import BaseModel, EmailStr, ConfigDict


class BusinessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    nipt: str | None
    type_of_business: str | None
    country: str | None
    currency: str | None
    logo_url: str | None
