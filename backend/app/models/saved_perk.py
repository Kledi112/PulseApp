from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SavedPerk(Base):
    """A perk an employee starred to look at again later - purely a bookmark,
    no budget or claim implications."""

    __tablename__ = "saved_perks"
    __table_args__ = (UniqueConstraint("employee_id", "service_id", name="uq_saved_perks_employee_service"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employee = relationship("Employee")
    service = relationship("Service")
