"""Monthly perk-budget bookkeeping.

A perk's price is reserved against the employee's monthly budget the moment
it's taken (status="active") and stays counted against that same month even
after it's claimed via QR scan (status="claimed") - claiming never changes
how much counts against the budget, it only flips the row's state. Both sums
below are keyed by `taken_at`'s month, not `claimed_at`'s, so a perk taken in
May and claimed in June still counts against May's budget.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.active_service import ActiveService
from app.models.employee import Employee
from app.schemas.active_service import BudgetOut


def _month_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def get_budget_summary(db: Session, employee: Employee) -> BudgetOut:
    rows = (
        db.query(ActiveService)
        .filter(ActiveService.employee_id == employee.id, ActiveService.taken_at >= _month_start())
        .all()
    )
    reserved_all = sum(r.price_all_snapshot for r in rows if r.status == "active")
    claimed_all = sum(r.price_all_snapshot for r in rows if r.status == "claimed")
    remaining_all = employee.monthly_budget_all - reserved_all - claimed_all
    return BudgetOut(
        monthly_budget_all=employee.monthly_budget_all,
        reserved_all=reserved_all,
        claimed_all=claimed_all,
        remaining_all=remaining_all,
    )


def get_remaining_budget(db: Session, employee: Employee) -> int:
    return get_budget_summary(db, employee).remaining_all
