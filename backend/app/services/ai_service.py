"""Single integration point for LLM-backed features.

Until an LLM provider key is configured (settings.llm_api_key), recommendations
fall back to a simple rule: most redeemed perks within the employee's employer.
Swap the body of get_recommendations() for a real LLM call without touching callers.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.employee import Employee
from app.models.perk import Perk
from app.models.redemption import Redemption


def get_recommendations(db: Session, employee: Employee, limit: int = 5) -> list[Perk]:
    if settings.llm_api_key:
        # Placeholder for a real LLM call (e.g. ranking perks by employee profile/history).
        pass

    return (
        db.query(Perk)
        .outerjoin(Redemption, Redemption.perk_id == Perk.id)
        .filter(Perk.employer_id == employee.employer_id, Perk.active.is_(True))
        .group_by(Perk.id)
        .order_by(func.count(Redemption.id).desc())
        .limit(limit)
        .all()
    )
