from pydantic import BaseModel

from app.schemas.service import ServiceOut


class AssistantRequest(BaseModel):
    message: str


class AssistantReply(BaseModel):
    text: str
    perks: list[ServiceOut]
