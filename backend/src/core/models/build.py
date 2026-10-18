from sqlalchemy import CheckConstraint, ForeignKey, String, Text, false, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.models.base import Base, IntIdMixin, TimestampMixin
from src.core.models.component import Component


class Build(IntIdMixin, TimestampMixin, Base):
    """Сборка ПК.

    - is_preset=True  — готовая сборка из каталога магазина (owner_id = NULL);
    - is_preset=False — пользовательская конфигурация из конфигуратора (owner_id = автор).
    Цена не хранится: она всегда считается из текущих цен комплектующих.
    """

    __tablename__ = "builds"

    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str | None] = mapped_column(String(255), unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(512))
    is_preset: Mapped[bool] = mapped_column(default=False, server_default=false(), index=True)
    is_published: Mapped[bool] = mapped_column(default=False, server_default=false())
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    items: Mapped[list["BuildComponent"]] = relationship(
        back_populates="build", lazy="raise", cascade="all, delete-orphan"
    )


class BuildComponent(Base):
    __tablename__ = "build_components"
    __table_args__ = (CheckConstraint("quantity > 0", name="quantity_positive"),)

    build_id: Mapped[int] = mapped_column(ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id", ondelete="RESTRICT"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=1, server_default=text("1"))

    build: Mapped[Build] = relationship(back_populates="items", lazy="raise")
    component: Mapped[Component] = relationship(lazy="raise")
