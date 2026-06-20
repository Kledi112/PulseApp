from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RedeemedHistory(Base):
    """A perk an employee has fully claimed (data/claimed-perks.ts `ClaimedPerk`).
    title/provider_name/price_all are snapshotted at claim time, same reasoning as
    RequestItem - the catalog can change after the fact without rewriting history."""

    __tablename__ = "redeemed_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    price_all: Mapped[int] = mapped_column(Integer, nullable=False)
    claimed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="redeemed_history")
    service = relationship("Service", back_populates="redeemed_history")
