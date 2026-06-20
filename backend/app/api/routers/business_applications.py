from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.business_application import BusinessApplication
from app.schemas.business_application import BusinessApplicationCreate, BusinessApplicationOut

router = APIRouter(prefix="/business-applications", tags=["business-applications"])


@router.post("", response_model=BusinessApplicationOut, status_code=status.HTTP_201_CREATED)
def submit_business_application(payload: BusinessApplicationCreate, db: Session = Depends(get_db)):
    application = BusinessApplication(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
