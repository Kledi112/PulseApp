from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Employee(Base):
    """The app's user account (types/user.ts `User`). `role` distinguishes a regular
    employee from a manager - there is no separate manager/business login type."""

    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int | None] = mapped_column(ForeignKey("business_applications.id"), nullable=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="employee")
    avatar_uri: Mapped[str] = mapped_column(String(500), nullable=True)
    monthly_budget_all: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    business = relationship("BusinessApplication", back_populates="employees")
    team = relationship("Team", back_populates="employees")

    @property
    def team_name(self) -> str | None:
        return self.team.name if self.team else None
    active_services = relationship("ActiveService", back_populates="employee", cascade="all, delete-orphan")
    quest_entries = relationship("QuestEntry", back_populates="employee", cascade="all, delete-orphan")
