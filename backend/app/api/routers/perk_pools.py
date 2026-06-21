import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.models.perk_pool import PerkPool, PerkPoolContribution
from app.models.service import Service
from app.schemas.perk_pool import CreatePoolRequest, JoinPoolRequest, PerkPoolOut, PoolContributionOut
from app.services.budget_service import get_remaining_budget

router = APIRouter(prefix="/perk-pools", tags=["perk-pools"])


def _to_out(pool: PerkPool) -> PerkPoolOut:
    contributed_all = sum(c.amount_all for c in pool.contributions)
    return PerkPoolOut(
        id=pool.id,
        service_id=pool.service_id,
        title=pool.service.title,
        provider_name=pool.service.provider_name,
        host_employee_id=pool.host_employee_id,
        host_name=pool.host_employee.name,
        target_amount_all=pool.target_amount_all,
        contributed_all=contributed_all,
        status=pool.status,
        active_service_id=pool.active_service_id,
        created_at=pool.created_at,
        completed_at=pool.completed_at,
        contributions=[
            PoolContributionOut(
                employee_id=c.employee_id,
                employee_name=c.employee.name,
                amount_all=c.amount_all,
                contributed_at=c.contributed_at,
            )
            for c in pool.contributions
        ],
    )


def _maybe_complete(db: Session, pool: PerkPool) -> None:
    contributed_all = sum(c.amount_all for c in pool.contributions)
    if contributed_all < pool.target_amount_all:
        return

    service = pool.service
    reward = ActiveService(
        employee_id=pool.host_employee_id,
        service_id=service.id,
        token=secrets.token_urlsafe(32),
        status="active",
        title_snapshot=service.title,
        provider_name_snapshot=service.provider_name,
        price_all_snapshot=pool.target_amount_all,
        is_pool_funded=True,
    )
    db.add(reward)
    db.flush()

    pool.status = "completed"
    pool.completed_at = datetime.now(timezone.utc)
    pool.active_service_id = reward.id


@router.get("", response_model=list[PerkPoolOut])
def list_pools(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    pools = (
        db.query(PerkPool)
        .join(Employee, Employee.id == PerkPool.host_employee_id)
        .filter(Employee.business_id == current_employee.business_id, PerkPool.status == "open")
        .all()
    )
    return [_to_out(p) for p in pools]


@router.get("/{pool_id}", response_model=PerkPoolOut)
def get_pool(
    pool_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    pool = db.get(PerkPool, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    return _to_out(pool)


@router.post("", response_model=PerkPoolOut, status_code=status.HTTP_201_CREATED)
def create_pool(
    payload: CreatePoolRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    service = db.get(Service, payload.service_id)
    if not service or not service.active:
        raise HTTPException(status_code=404, detail="Perk not found")
    if payload.amount_all > service.price_all:
        raise HTTPException(status_code=400, detail="Pledge cannot exceed the perk's price")
    if payload.amount_all > get_remaining_budget(db, current_employee):
        raise HTTPException(status_code=400, detail="Insufficient budget remaining this month")

    pool = PerkPool(service_id=service.id, host_employee_id=current_employee.id, target_amount_all=service.price_all)
    db.add(pool)
    db.flush()
    db.add(PerkPoolContribution(pool_id=pool.id, employee_id=current_employee.id, amount_all=payload.amount_all))
    db.flush()
    db.refresh(pool)

    _maybe_complete(db, pool)
    db.commit()
    db.refresh(pool)
    return _to_out(pool)


@router.post("/{pool_id}/join", response_model=PerkPoolOut)
def join_pool(
    pool_id: int,
    payload: JoinPoolRequest,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    pool = db.get(PerkPool, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    if pool.status != "open":
        raise HTTPException(status_code=400, detail="This pool is no longer open")
    if any(c.employee_id == current_employee.id for c in pool.contributions):
        raise HTTPException(status_code=400, detail="You've already joined this pool")

    contributed_so_far = sum(c.amount_all for c in pool.contributions)
    if contributed_so_far + payload.amount_all > pool.target_amount_all:
        raise HTTPException(status_code=400, detail="That would overfund the pool - pledge a smaller amount")
    if payload.amount_all > get_remaining_budget(db, current_employee):
        raise HTTPException(status_code=400, detail="Insufficient budget remaining this month")

    db.add(PerkPoolContribution(pool_id=pool.id, employee_id=current_employee.id, amount_all=payload.amount_all))
    db.flush()
    db.refresh(pool)

    _maybe_complete(db, pool)
    db.commit()
    db.refresh(pool)
    return _to_out(pool)


@router.post("/{pool_id}/cancel", response_model=PerkPoolOut)
def cancel_pool(
    pool_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    pool = db.get(PerkPool, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    if pool.host_employee_id != current_employee.id:
        raise HTTPException(status_code=403, detail="Only the host can cancel this pool")
    if pool.status != "open":
        raise HTTPException(status_code=400, detail="This pool is no longer open")

    pool.status = "cancelled"
    db.commit()
    db.refresh(pool)
    return _to_out(pool)
