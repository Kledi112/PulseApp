from pydantic import BaseModel, EmailStr, ConfigDict


class BusinessApplicationCreate(BaseModel):
    business_name: str
    nipt: str
    employee_count: int
    contact_number: str
    email: EmailStr


class BusinessApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_name: str
    nipt: str
    employee_count: int
    contact_number: str
    email: EmailStr
