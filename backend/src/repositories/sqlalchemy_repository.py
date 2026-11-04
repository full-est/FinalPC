from typing import Generic, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.models.base import Base
from src.repositories.abstract import AbstractRepository

ModelT = TypeVar("ModelT", bound=Base)


class SQLAlchemyRepository(AbstractRepository[ModelT], Generic[ModelT]):
    """Общая реализация CRUD на SQLAlchemy. Репозиторий делает flush, но не commit —
    фиксацию транзакции контролирует сервис через UnitOfWork."""

    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, id_: int) -> ModelT | None:
        return await self._session.get(self.model, id_)

    async def add(self, obj: ModelT) -> ModelT:
        self._session.add(obj)
        await self._session.flush()
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self._session.delete(obj)
        await self._session.flush()
