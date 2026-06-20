from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ActiveService(Base):
    """A perk an employee requested that is pending manager approval ("pending")
    or approved and in use ("active"). data/active-services.ts `ActiveService`."""

    __tablename__ = "active_services"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee", back_populates="active_services")
    request = relationship("Request", back_populates="active_services")
    service = relationship("Service", back_populates="active_services")

    @property
    def title(self) -> str:
        return self.service.title

    @property
    def provider_name(self) -> str:
        return self.service.provider_name

    @property
    def price_all(self) -> int:
        return self.service.price_all
