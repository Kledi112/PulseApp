from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    active_services = relationship("ActiveService", back_populates="service", cascade="all, delete-orphan")
    redeemed_history = relationship("RedeemedHistory", back_populates="service", cascade="all, delete-orphan")
    quests = relationship("Quest", back_populates="service", cascade="all, delete-orphan")
