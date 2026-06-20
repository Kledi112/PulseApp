from datetime import date

from sqlalchemy import String, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Quest(Base):
    """Standalone challenge employees/teams compete in (types/quest.ts `Quest`).
    Not linked to a specific service - the reward is free-text, set by the manager."""

    __tablename__ = "quests"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    reward: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active")
    winner_employee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    winner_team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True)

    winner_employee = relationship("Employee", foreign_keys=[winner_employee_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    entries = relationship("QuestEntry", back_populates="quest", cascade="all, delete-orphan")

    @property
    def winner_id(self) -> int | None:
        return self.winner_employee_id or self.winner_team_id

    @property
    def winner_name(self) -> str | None:
        if self.winner_employee:
            return self.winner_employee.name
        if self.winner_team:
            return self.winner_team.name
        return None
