from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BusinessApplication(Base):
    """A company applying to bring Pulse to its employees.

    This is a lead-gen submission reviewed by Pulse staff, not a login account -
    the registration form collects no password (see types/business-application.ts).
    """

    __tablename__ = "business_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    nipt: Mapped[str] = mapped_column(String(50), nullable=False)
    employee_count: Mapped[int] = mapped_column(Integer, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    employees = relationship("Employee", back_populates="business")
