from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuestEntry(Base):
    """A participant entered into a Quest, either as an individual employee or
    on behalf of a team (types/quest.ts `QuestEntry`) - exactly one of
    employee_id/team_id is set, matching `mode`."""

    __tablename__ = "quest_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    quest_id: Mapped[int] = mapped_column(ForeignKey("quests.id"), nullable=False)
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
    employee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True)

    quest = relationship("Quest", back_populates="entries")
    employee = relationship("Employee", back_populates="quest_entries")
    team = relationship("Team")

    @property
    def participant_id(self) -> int:
        return self.employee_id or self.team_id

    @property
    def participant_name(self) -> str:
        return self.employee.name if self.employee else self.team.name
