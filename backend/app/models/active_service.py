from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ActiveService(Base):
    __tablename__ = "active_services"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    employee = relationship("Employee", back_populates="active_services")
    service = relationship("Service", back_populates="active_services")
