from fastapi import APIRouter, Depends

from app.api.deps import get_current_employer
from app.models.employer import Employer
from app.schemas.employer import EmployerOut

router = APIRouter(prefix="/employers", tags=["employers"])


@router.get("/me", response_model=EmployerOut)
def read_current_employer(current_employer: Employer = Depends(get_current_employer)):
    return current_employer
