from fastapi import APIRouter, Depends

from app.api.deps import get_current_business
from app.models.business import Business
from app.schemas.business import BusinessOut

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.get("/me", response_model=BusinessOut)
def read_current_business(current_business: Business = Depends(get_current_business)):
    return current_business
