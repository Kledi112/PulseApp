from sqlalchemy import String, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Service(Base):
    """The "Perk" the UI displays (types/perk.ts)."""

    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True)
    price_all: Mapped[int] = mapped_column(Integer, nullable=False)
    image_uri: Mapped[str] = mapped_column(String(500), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    provider = relationship("Provider", back_populates="services")

    @property
    def provider_name(self) -> str:
        return self.provider.name
    active_services = relationship("ActiveService", back_populates="service", cascade="all, delete-orphan")
