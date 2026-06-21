"""Monthly top-3 quest leaderboard rewards.

Whenever GET /quests/leaderboard is hit, ensure_monthly_rewards() checks
whether the most recently fully-elapsed calendar month has already been
processed (via QuestRewardDistribution, one row per (month, rank) so this
never re-grants). If not, it ranks employees by individual quests completed
that month (team wins don't count toward a personal reward) and grants:
  1st place - a free random perk priced over 8,000 ALL
  2nd place - a free random perk priced at most 3,500 ALL
  3rd place - a 1,500 ALL bonus added to next month's budget
"""

import secrets
from datetime import date, datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.active_service import ActiveService
from app.models.budget_bonus import BudgetBonus
from app.models.quest import Quest
from app.models.quest_reward_distribution import QuestRewardDistribution
from app.models.service import Service

RANK_1_MIN_PRICE = 8000
RANK_2_MAX_PRICE = 3500
RANK_3_BONUS_ALL = 1500


def _previous_month_start(today: date | None = None) -> date:
    today = today or datetime.now(timezone.utc).date()
    if today.month == 1:
        return date(today.year - 1, 12, 1)
    return date(today.year, today.month - 1, 1)


def _top_employee_winners(db: Session, month: date, limit: int = 3) -> list[tuple[int, int]]:
    rows = (
        db.query(Quest.winner_employee_id, func.count(Quest.id))
        .filter(
            Quest.status == "completed",
            Quest.winner_employee_id.isnot(None),
            func.extract("year", Quest.deadline) == month.year,
            func.extract("month", Quest.deadline) == month.month,
        )
        .group_by(Quest.winner_employee_id)
        .order_by(func.count(Quest.id).desc(), Quest.winner_employee_id.asc())
        .limit(limit)
        .all()
    )
    return [(employee_id, count) for employee_id, count in rows]


def _grant_random_perk(db: Session, employee_id: int, *, min_price: int | None, max_price: int | None) -> ActiveService | None:
    query = db.query(Service).filter(Service.active.is_(True))
    if min_price is not None:
        query = query.filter(Service.price_all > min_price)
    if max_price is not None:
        query = query.filter(Service.price_all <= max_price)
    service = query.order_by(func.random()).first()
    if not service:
        # Fall back to whatever's available so a reward isn't silently dropped
        # just because the catalog doesn't have a perk in the exact price band.
        fallback = db.query(Service).filter(Service.active.is_(True))
        service = (
            fallback.order_by(Service.price_all.desc()).first()
            if min_price is not None
            else fallback.order_by(Service.price_all.asc()).first()
        )
    if not service:
        return None

    reward = ActiveService(
        employee_id=employee_id,
        service_id=service.id,
        token=secrets.token_urlsafe(32),
        status="active",
        title_snapshot=service.title,
        provider_name_snapshot=service.provider_name,
        price_all_snapshot=service.price_all,
        is_reward=True,
    )
    db.add(reward)
    db.flush()
    return reward


def ensure_monthly_rewards(db: Session) -> None:
    month = _previous_month_start()
    already_processed = db.query(QuestRewardDistribution).filter(QuestRewardDistribution.month == month).first()
    if already_processed:
        return

    winners = _top_employee_winners(db, month)

    for rank in range(1, 4):
        employee_id = winners[rank - 1][0] if rank <= len(winners) else None
        distribution = QuestRewardDistribution(month=month, rank=rank, employee_id=employee_id)

        if employee_id is not None:
            if rank == 1:
                reward = _grant_random_perk(db, employee_id, min_price=RANK_1_MIN_PRICE, max_price=None)
                if reward:
                    distribution.reward_type = "perk"
                    distribution.active_service_id = reward.id
            elif rank == 2:
                reward = _grant_random_perk(db, employee_id, min_price=None, max_price=RANK_2_MAX_PRICE)
                if reward:
                    distribution.reward_type = "perk"
                    distribution.active_service_id = reward.id
            else:
                bonus = BudgetBonus(
                    employee_id=employee_id,
                    amount_all=RANK_3_BONUS_ALL,
                    reason=f"Monthly quest leaderboard - 3rd place ({month.isoformat()})",
                )
                db.add(bonus)
                db.flush()
                distribution.reward_type = "budget"
                distribution.budget_bonus_id = bonus.id

        db.add(distribution)

    db.commit()
