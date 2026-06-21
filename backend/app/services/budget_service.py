"""Monthly perk-budget bookkeeping.

A perk's price is reserved against the employee's monthly budget the moment
it's taken (status="active") and stays counted against that same month even
after it's claimed via QR scan (status="claimed") - claiming never changes
how much counts against the budget, it only flips the row's state. Both sums
below are keyed by `taken_at`'s month, not `claimed_at`'s, so a perk taken in
May and claimed in June still counts against May's budget.

Three extra sources feed into the same reserved/claimed split:
- ActiveService rows with is_reward=True (monthly quest leaderboard prizes)
  are excluded entirely - nothing was actually spent.
- BudgetBonus rows (e.g. 3rd place's leaderboard bonus) add to the available
  budget for whichever month they were granted in.
- PerkPoolContribution rows count the same way a solo take would: reserved
  while the pool is open or completed-but-unclaimed, claimed once the pool's
  resulting ActiveService is claimed, and not counted at all if the pool was
  cancelled.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.active_service import ActiveService
from app.models.budget_bonus import BudgetBonus
from app.models.employee import Employee
from app.models.perk_pool import PerkPool, PerkPoolContribution
from app.schemas.active_service import BudgetOut


def _month_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def get_budget_summary(db: Session, employee: Employee) -> BudgetOut:
    month_start = _month_start()

    rows = (
        db.query(ActiveService)
        .filter(
            ActiveService.employee_id == employee.id,
            ActiveService.taken_at >= month_start,
            ActiveService.is_reward.is_(False),
            ActiveService.is_pool_funded.is_(False),
        )
        .all()
    )
    reserved_all = sum(r.price_all_snapshot for r in rows if r.status == "active")
    claimed_all = sum(r.price_all_snapshot for r in rows if r.status == "claimed")

    contributions = (
        db.query(PerkPoolContribution)
        .join(PerkPool, PerkPool.id == PerkPoolContribution.pool_id)
        .filter(
            PerkPoolContribution.employee_id == employee.id,
            PerkPoolContribution.contributed_at >= month_start,
            PerkPool.status != "cancelled",
        )
        .all()
    )
    for contribution in contributions:
        pool = contribution.pool
        if pool.status == "open":
            reserved_all += contribution.amount_all
        elif pool.status == "completed":
            if pool.active_service and pool.active_service.status == "claimed":
                claimed_all += contribution.amount_all
            else:
                reserved_all += contribution.amount_all

    bonus_all = (
        db.query(BudgetBonus)
        .filter(BudgetBonus.employee_id == employee.id, BudgetBonus.granted_at >= month_start)
        .all()
    )
    monthly_budget_all = employee.monthly_budget_all + sum(b.amount_all for b in bonus_all)

    remaining_all = monthly_budget_all - reserved_all - claimed_all
    return BudgetOut(
        monthly_budget_all=monthly_budget_all,
        reserved_all=reserved_all,
        claimed_all=claimed_all,
        remaining_all=remaining_all,
    )


def get_remaining_budget(db: Session, employee: Employee) -> int:
    return get_budget_summary(db, employee).remaining_all
