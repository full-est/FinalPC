from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import CheckConstraint, ForeignKey, String, Text, func, text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.models.base import Base, IntIdMixin, TimestampMixin


class Category(IntIdMixin, Base):
    """Категория комплектующих: cpu, gpu, motherboard, ram, ..."""

    __tablename__ = "categories"

    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(128))

    components: Mapped[list["Component"]] = relationship(back_populates="category", lazy="raise")


class Component(IntIdMixin, TimestampMixin, Base):
    __tablename__ = "components"

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    brand: Mapped[str] = mapped_column(String(128), index=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True)
    price: Mapped[Decimal]
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(512))
    # Характеристики, зависящие от категории (socket, memory_type, wattage, ...).
    # Ключи, которые использует конфигуратор, описаны в api/configurator/compatibility.py.
    specs: Mapped[dict[str, Any]] = mapped_column(default=dict, server_default=text("'{}'::jsonb"))
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())

    category: Mapped[Category] = relationship(back_populates="components", lazy="raise")
    stock: Mapped["Stock | None"] = relationship(
        back_populates="component", lazy="raise", cascade="all, delete-orphan", uselist=False
    )

    @property
    def stock_quantity(self) -> int:
        return self.stock.quantity if self.stock is not None else 0


class Stock(Base):
    """Остаток на складе. Отдельная таблица, чтобы блокировать строки остатков
    при оформлении заказа, не трогая сами карточки товаров."""

    __tablename__ = "stock"
    __table_args__ = (CheckConstraint("quantity >= 0", name="quantity_non_negative"),)

    component_id: Mapped[int] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=0, server_default=text("0"))
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    component: Mapped[Component] = relationship(back_populates="stock", lazy="raise")
