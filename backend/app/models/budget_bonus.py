from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BudgetBonus(Base):
    """A one-off top-up to an employee's budget for the month it's granted in
    (e.g. 3rd place in the monthly quest leaderboard) - additive on top of
    Employee.monthly_budget_all, counted by budget_service for whichever
    calendar month `granted_at` falls in."""

    __tablename__ = "budget_bonuses"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    amount_all: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee")
