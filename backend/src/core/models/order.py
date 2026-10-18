from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Any

from sqlalchemy import CheckConstraint, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.models.base import Base, IntIdMixin, TimestampMixin, pg_enum
from src.core.models.user import User


class OrderStatus(StrEnum):
    NEW = "new"
    CONFIRMED = "confirmed"
    ASSEMBLING = "assembling"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Order(IntIdMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    status: Mapped[OrderStatus] = mapped_column(
        pg_enum(OrderStatus, "order_status"),
        default=OrderStatus.NEW,
        server_default=OrderStatus.NEW.value,
        index=True,
    )
    total_price: Mapped[Decimal]
    contact_name: Mapped[str] = mapped_column(String(255))
    contact_phone: Mapped[str] = mapped_column(String(32))
    delivery_address: Mapped[str] = mapped_column(Text)
    # Комментарий покупателя при оформлении.
    comment: Mapped[str | None] = mapped_column(Text)
    # Комментарий магазина (трек-номер, уточнения по доставке). Виден покупателю.
    admin_comment: Mapped[str | None] = mapped_column(Text)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", lazy="raise", cascade="all, delete-orphan", order_by="OrderItem.id"
    )
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(
        back_populates="order",
        lazy="raise",
        cascade="all, delete-orphan",
        order_by="(OrderStatusHistory.created_at, OrderStatusHistory.id)",
    )


class OrderStatusHistory(IntIdMixin, Base):
    """Журнал смены статусов заказа. Пишется в той же транзакции, что и смена статуса,
    поэтому никогда не расходится с текущим состоянием заказа."""

    __tablename__ = "order_status_history"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    # NULL — запись о создании заказа.
    from_status: Mapped[OrderStatus | None] = mapped_column(pg_enum(OrderStatus, "order_status"))
    to_status: Mapped[OrderStatus] = mapped_column(pg_enum(OrderStatus, "order_status"))
    # Кто сменил статус: покупатель или администратор. NULL — пользователь удалён.
    changed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    order: Mapped[Order] = relationship(back_populates="status_history", lazy="raise")
    changed_by: Mapped[User | None] = relationship(lazy="raise")


class OrderItem(IntIdMixin, Base):
    """Позиция заказа. Название, цена и состав сборки сохраняются снимком на момент заказа,
    поэтому дальнейшие изменения каталога не меняют уже оформленные заказы."""

    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("quantity > 0", name="quantity_positive"),)

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    component_id: Mapped[int | None] = mapped_column(ForeignKey("components.id", ondelete="SET NULL"))
    build_id: Mapped[int | None] = mapped_column(ForeignKey("builds.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255))
    unit_price: Mapped[Decimal]
    quantity: Mapped[int]
    # Для сборок: [{"component_id", "name", "unit_price", "quantity"}, ...]
    composition: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB)

    order: Mapped[Order] = relationship(back_populates="items", lazy="raise")
