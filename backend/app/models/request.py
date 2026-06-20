from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Request(Base):
    """An employee's redemption request for one perk ("single") or several
    bundled together ("bundle"), pending manager approval (types/request.ts)."""

    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    total_all: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=True)

    employee = relationship("Employee", back_populates="requests")

    @property
    def employee_name(self) -> str:
        return self.employee.name

    items = relationship("RequestItem", back_populates="request", cascade="all, delete-orphan")
    active_services = relationship("ActiveService", back_populates="request", cascade="all, delete-orphan")
