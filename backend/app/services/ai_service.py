"""Single integration point for LLM-backed features.

Until an LLM provider key is configured (settings.llm_api_key), recommendations
fall back to a simple rule: the most claimed active services overall. Swap the body
of get_recommendations() for a real LLM call without touching callers.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.employee import Employee
from app.models.redeemed_history import RedeemedHistory
from app.models.service import Service


def get_recommendations(db: Session, employee: Employee, limit: int = 5) -> list[Service]:
    if settings.llm_api_key:
        # Placeholder for a real LLM call (e.g. ranking services by employee profile/history).
        pass

    return (
        db.query(Service)
        .outerjoin(RedeemedHistory, RedeemedHistory.service_id == Service.id)
        .filter(Service.active.is_(True))
        .group_by(Service.id)
        .order_by(func.count(RedeemedHistory.id).desc())
        .limit(limit)
        .all()
    )
