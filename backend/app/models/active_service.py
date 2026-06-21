from datetime import datetime, timezone

from sqlalchemy import Boolean, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ActiveService(Base):
    """A perk an employee has taken. "active" = taken and reserved against this
    month's budget but not yet scanned at the venue; "claimed" = the employee
    scanned the QR (GET /c/{token}) at the venue. title/provider_name/price_all
    are snapshotted at take time so this row stays accurate if the catalog
    changes later (mirrors the old RequestItem/RedeemedHistory snapshot pattern -
    this model now replaces both).

    `is_reward` marks a row granted for free (monthly quest leaderboard prizes) -
    these are excluded from budget_service's reserved/claimed sums since nothing
    was actually spent.

    `is_pool_funded` marks the single shared claim row created when a PerkPool
    completes - also excluded from the normal per-employee sum, since the cost
    is instead tracked per-contributor via PerkPoolContribution rows (otherwise
    the host would be charged both their pledge and the full perk price)."""

    __tablename__ = "active_services"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    title_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    price_all_snapshot: Mapped[int] = mapped_column(Integer, nullable=False)
    is_reward: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_pool_funded: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    employee = relationship("Employee", back_populates="active_services")
    service = relationship("Service", back_populates="active_services")

    @property
    def title(self) -> str:
        return self.title_snapshot

    @property
    def provider_name(self) -> str:
        return self.provider_name_snapshot

    @property
    def price_all(self) -> int:
        return self.price_all_snapshot
