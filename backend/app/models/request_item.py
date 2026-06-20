from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RequestItem(Base):
    """One perk line within a Request. title/provider_name are snapshotted at
    request time so the receipt stays accurate even if the catalog changes later."""

    __tablename__ = "request_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_price_all: Mapped[int] = mapped_column(Integer, nullable=False)
    discounted_price_all: Mapped[int] = mapped_column(Integer, nullable=False)

    request = relationship("Request", back_populates="items")
    service = relationship("Service", back_populates="request_items")
