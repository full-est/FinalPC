from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from sqlalchemy import DateTime, MetaData, Numeric, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Единые имена для индексов и ограничений — чтобы alembic генерировал стабильные миграции.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
    # Серверные значения (created_at, updated_at, ...) сразу возвращаются через RETURNING.
    # В async ленивая догрузка атрибутов после INSERT/UPDATE невозможна.
    __mapper_args__ = {"eager_defaults": True}

    type_annotation_map = {
        Decimal: Numeric(12, 2),
        datetime: DateTime(timezone=True),
        dict[str, Any]: JSONB,
    }


class IntIdMixin:
    id: Mapped[int] = mapped_column(primary_key=True)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())


def pg_enum(enum_cls: type[Enum], name: str) -> SAEnum:
    """Postgres ENUM, который хранит значения (`value`), а не имена членов."""
    return SAEnum(enum_cls, name=name, values_callable=lambda members: [m.value for m in members])
