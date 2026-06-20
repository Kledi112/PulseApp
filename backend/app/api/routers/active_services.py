import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.models.service import Service
from app.schemas.active_service import ActiveServiceOut, BudgetOut, TakeBundleRequest, TakePerkRequest
from app.services.budget_service import get_budget_summary

router = APIRouter(prefix="/active-services", tags=["active-services"])

BUNDLE_DISCOUNT_RATE = 0.1
BUNDLE_MIN_PERKS_FOR_DISCOUNT = 2


def _take_services(db: Session, employee: Employee, services: list[Service], prices: list[int]) -> list[ActiveService]:
    remaining = get_budget_summary(db, employee).remaining_all
    if sum(prices) > remaining:
        raise HTTPException(status_code=400, detail="Insufficient budget remaining this month")

    rows = []
    for service, price in zip(services, prices):
        row = ActiveService(
            employee_id=employee.id,
            service_id=service.id,
            token=secrets.token_urlsafe(32),
            status="active",
            title_snapshot=service.title,
            provider_name_snapshot=service.provider_name,
            price_all_snapshot=price,
        )
        db.add(row)
        rows.append(row)

    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


@router.get("", response_model=list[ActiveServiceOut])
def my_active_services(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    query = db.query(ActiveService).filter(ActiveService.employee_id == current_employee.id)
    if status_filter:
        query = query.filter(ActiveService.status == status_filter)
    return query.order_by(ActiveService.taken_at.desc()).all()


@router.get("/budget", response_model=BudgetOut)
def my_budget(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return get_budget_summary(db, current_employee)


@router.post("", response_model=ActiveServiceOut, status_code=status.HTTP_201_CREATED)
def take_perk(
    payload: TakePerkRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    service = db.get(Service, payload.service_id)
    if not service or not service.active:
        raise HTTPException(status_code=404, detail="Perk not found")

    rows = _take_services(db, current_employee, [service], [service.price_all])
    return rows[0]


@router.post("/bundle", response_model=list[ActiveServiceOut], status_code=status.HTTP_201_CREATED)
def take_bundle(
    payload: TakeBundleRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if not payload.service_ids:
        raise HTTPException(status_code=400, detail="At least one service is required")

    services = db.query(Service).filter(Service.id.in_(payload.service_ids), Service.active.is_(True)).all()
    if len(services) != len(payload.service_ids):
        raise HTTPException(status_code=404, detail="One or more services not found")

    discount_applied = len(services) >= BUNDLE_MIN_PERKS_FOR_DISCOUNT
    prices = [
        round(service.price_all * (1 - BUNDLE_DISCOUNT_RATE)) if discount_applied else service.price_all
        for service in services
    ]

    return _take_services(db, current_employee, services, prices)
