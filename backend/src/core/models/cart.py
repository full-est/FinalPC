from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.models.base import Base, IntIdMixin, TimestampMixin
from src.core.models.build import Build
from src.core.models.component import Component


class Cart(IntIdMixin, TimestampMixin, Base):
    __tablename__ = "carts"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", lazy="raise", cascade="all, delete-orphan", order_by="CartItem.id"
    )


class CartItem(IntIdMixin, Base):
    """Позиция корзины: либо отдельная комплектующая, либо сборка — ровно одно из двух."""

    __tablename__ = "cart_items"
    __table_args__ = (
        CheckConstraint("(component_id IS NULL) <> (build_id IS NULL)", name="exactly_one_product"),
        CheckConstraint("quantity > 0", name="quantity_positive"),
        UniqueConstraint("cart_id", "component_id"),
        UniqueConstraint("cart_id", "build_id"),
    )

    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"), index=True)
    component_id: Mapped[int | None] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"))
    build_id: Mapped[int | None] = mapped_column(ForeignKey("builds.id", ondelete="CASCADE"))
    quantity: Mapped[int]

    cart: Mapped[Cart] = relationship(back_populates="items", lazy="raise")
    component: Mapped[Component | None] = relationship(lazy="raise")
    build: Mapped[Build | None] = relationship(lazy="raise")
