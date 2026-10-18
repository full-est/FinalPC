from enum import StrEnum

from sqlalchemy import String, true
from sqlalchemy.orm import Mapped, mapped_column

from src.core.models.base import Base, IntIdMixin, TimestampMixin, pg_enum


class UserRole(StrEnum):
    USER = "user"
    ADMIN = "admin"


class User(IntIdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32))
    role: Mapped[UserRole] = mapped_column(
        pg_enum(UserRole, "user_role"), default=UserRole.USER, server_default=UserRole.USER.value
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
