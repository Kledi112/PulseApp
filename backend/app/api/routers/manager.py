from calendar import monthrange
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_manager
from app.db.session import get_db
from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.schemas.manager import (
    ClaimedHistoryEntry,
    EmployeeBudgetOut,
    InvoiceEmployeeTotal,
    InvoiceOut,
    SetEmployeeBudgetRequest,
)

router = APIRouter(prefix="/manager", tags=["manager"])


def _scoped_employees(db: Session, manager: Employee):
    return db.query(Employee).filter(Employee.business_id == manager.business_id, Employee.role == "employee")


@router.get("/employees", response_model=list[EmployeeBudgetOut])
def list_employees(db: Session = Depends(get_db), current_manager: Employee = Depends(get_current_manager)):
    return _scoped_employees(db, current_manager).all()


@router.put("/employees/{employee_id}/budget", response_model=EmployeeBudgetOut)
def set_employee_budget(
    employee_id: int,
    payload: SetEmployeeBudgetRequest,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    employee = _scoped_employees(db, current_manager).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.monthly_budget_all = payload.monthly_budget_all
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/history", response_model=list[ClaimedHistoryEntry])
def claimed_history(db: Session = Depends(get_db), current_manager: Employee = Depends(get_current_manager)):
    employee_ids = [e.id for e in _scoped_employees(db, current_manager).all()]
    rows = (
        db.query(ActiveService)
        .filter(ActiveService.employee_id.in_(employee_ids), ActiveService.status == "claimed")
        .order_by(ActiveService.claimed_at.desc())
        .all()
    )
    return [
        ClaimedHistoryEntry(
            id=row.id,
            employee_id=row.employee_id,
            employee_name=row.employee.name,
            title=row.title_snapshot,
            provider_name=row.provider_name_snapshot,
            price_all=row.price_all_snapshot,
            claimed_at=row.claimed_at,
        )
        for row in rows
    ]


@router.get("/invoice", response_model=InvoiceOut)
def invoice(
    month: str | None = None,
    db: Session = Depends(get_db),
    current_manager: Employee = Depends(get_current_manager),
):
    if month:
        try:
            year, mon = (int(part) for part in month.split("-"))
        except ValueError:
            raise HTTPException(status_code=400, detail="month must be in YYYY-MM format")
    else:
        now = datetime.now(timezone.utc)
        year, mon = now.year, now.month

    month_start = datetime(year, mon, 1, tzinfo=timezone.utc)
    days_in_month = monthrange(year, mon)[1]
    month_end = datetime(year, mon, days_in_month, 23, 59, 59, tzinfo=timezone.utc)

    employee_ids = [e.id for e in _scoped_employees(db, current_manager).all()]
    rows = (
        db.query(ActiveService)
        .filter(
            ActiveService.employee_id.in_(employee_ids),
            ActiveService.status == "claimed",
            ActiveService.claimed_at >= month_start,
            ActiveService.claimed_at <= month_end,
        )
        .order_by(ActiveService.claimed_at.desc())
        .all()
    )

    by_employee: dict[int, InvoiceEmployeeTotal] = {}
    for row in rows:
        entry = ClaimedHistoryEntry(
            id=row.id,
            employee_id=row.employee_id,
            employee_name=row.employee.name,
            title=row.title_snapshot,
            provider_name=row.provider_name_snapshot,
            price_all=row.price_all_snapshot,
            claimed_at=row.claimed_at,
        )
        if row.employee_id not in by_employee:
            by_employee[row.employee_id] = InvoiceEmployeeTotal(
                employee_id=row.employee_id, employee_name=row.employee.name, total_all=0, items=[]
            )
        by_employee[row.employee_id].total_all += row.price_all_snapshot
        by_employee[row.employee_id].items.append(entry)

    totals = list(by_employee.values())
    return InvoiceOut(month=f"{year:04d}-{mon:02d}", total_all=sum(t.total_all for t in totals), by_employee=totals)
