from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee, get_current_manager
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.models.redeemed_history import RedeemedHistory
from app.models.request import Request
from app.models.request_item import RequestItem
from app.models.service import Service
from app.schemas.request import RequestApprove, RequestCreate, RequestOut

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def submit_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if not payload.service_ids:
        raise HTTPException(status_code=400, detail="At least one service is required")

    services = db.query(Service).filter(Service.id.in_(payload.service_ids)).all()
    if len(services) != len(payload.service_ids):
        raise HTTPException(status_code=404, detail="One or more services not found")

    request = Request(employee_id=current_employee.id, type=payload.type, total_all=0)
    db.add(request)
    db.flush()

    total_all = 0
    for service in services:
        item = RequestItem(
            request_id=request.id,
            service_id=service.id,
            title=service.title,
            provider_name=service.provider_name,
            original_price_all=service.price_all,
            discounted_price_all=service.price_all,
        )
        db.add(item)
        db.add(ActiveService(employee_id=current_employee.id, request_id=request.id, service_id=service.id))
        total_all += service.price_all

    request.total_all = total_all
    db.commit()
    db.refresh(request)
    return request


@router.get("", response_model=list[RequestOut])
def list_requests(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    query = db.query(Request)
    if status_filter:
        query = query.filter(Request.status == status_filter)
    return query.all()


@router.post("/{request_id}/approve", response_model=RequestOut)
def approve_request(
    request_id: int,
    payload: RequestApprove,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = "approved"
    request.paid_at = datetime.now(timezone.utc)
    request.payment_method = payload.payment_method

    for active_service in db.query(ActiveService).filter(ActiveService.request_id == request.id):
        active_service.status = "active"

    for item in request.items:
        db.add(
            RedeemedHistory(
                employee_id=request.employee_id,
                service_id=item.service_id,
                title=item.title,
                provider_name=item.provider_name,
                price_all=item.discounted_price_all,
                claimed_at=request.paid_at,
            )
        )

    db.commit()
    db.refresh(request)
    return request


@router.post("/{request_id}/decline", response_model=RequestOut)
def decline_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = "declined"
    db.query(ActiveService).filter(ActiveService.request_id == request.id).delete()

    db.commit()
    db.refresh(request)
    return request
