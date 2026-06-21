from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PerkPool(Base):
    """Two or more employees pledging part of their own budget toward one
    shared perk that none of them could afford alone. Once contributions
    reach `target_amount_all` the pool completes and a single ActiveService
    row is created (owned by the host) for the group to claim together."""

    __tablename__ = "perk_pools"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    host_employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    target_amount_all: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open")
    active_service_id: Mapped[int | None] = mapped_column(ForeignKey("active_services.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    service = relationship("Service")
    host_employee = relationship("Employee", foreign_keys=[host_employee_id])
    active_service = relationship("ActiveService", foreign_keys=[active_service_id])
    contributions = relationship("PerkPoolContribution", back_populates="pool", cascade="all, delete-orphan")


class PerkPoolContribution(Base):
    """One employee's pledged share of a PerkPool's target amount."""

    __tablename__ = "perk_pool_contributions"
    __table_args__ = (UniqueConstraint("pool_id", "employee_id", name="uq_perk_pool_contributions_pool_employee"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    pool_id: Mapped[int] = mapped_column(ForeignKey("perk_pools.id"), nullable=False)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    amount_all: Mapped[int] = mapped_column(Integer, nullable=False)
    contributed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pool = relationship("PerkPool", back_populates="contributions")
    employee = relationship("Employee")
