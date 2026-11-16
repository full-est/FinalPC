from typing import Any, ClassVar, Generic, Self, TypeVar

from pydantic import BaseModel, ConfigDict, Field, model_validator

ItemT = TypeVar("ItemT")


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PatchSchema(BaseSchema):
    """Схема частичного обновления: все поля необязательные, в сервис уходят только
    переданные (`model_dump(exclude_unset=True)`). Явный null запрещён для полей,
    перечисленных в NON_NULLABLE — иначе БД ответила бы ошибкой NOT NULL."""

    NON_NULLABLE: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def _forbid_explicit_nulls(self) -> Self:
        nulls = sorted(f for f in self.model_fields_set & self.NON_NULLABLE if getattr(self, f) is None)
        if nulls:
            raise ValueError(f"Поля не могут быть null: {', '.join(nulls)}")
        return self

    def changes(self) -> dict[str, Any]:
        return self.model_dump(exclude_unset=True)


class PaginationParams(BaseSchema):
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class Page(BaseSchema, Generic[ItemT]):
    items: list[ItemT]
    total: int
    limit: int
    offset: int


class MessageResponse(BaseSchema):
    message: str
