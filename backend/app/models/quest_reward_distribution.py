from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuestRewardDistribution(Base):
    """Idempotency record for the monthly top-3 quest leaderboard reward run -
    one row per (month, rank), written even when no qualifying winner existed
    for that rank, so app.services.quest_rewards never re-grants for a month
    it has already processed."""

    __tablename__ = "quest_reward_distributions"
    __table_args__ = (UniqueConstraint("month", "rank", name="uq_quest_reward_distributions_month_rank"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    month: Mapped[date] = mapped_column(Date, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    employee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    reward_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    active_service_id: Mapped[int | None] = mapped_column(ForeignKey("active_services.id"), nullable=True)
    budget_bonus_id: Mapped[int | None] = mapped_column(ForeignKey("budget_bonuses.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee")
