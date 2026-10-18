from abc import ABC, abstractmethod
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.connection import SessionDep


class AbstractUnitOfWork(ABC):
    """Граница транзакции для сервисного слоя.

    Сервис решает, КОГДА зафиксировать изменения, но не знает, КАК это сделано.
    Репозитории и UoW в рамках одного запроса работают с одной и той же сессией.
    """

    @abstractmethod
    async def commit(self) -> None: ...

    @abstractmethod
    async def rollback(self) -> None: ...


class SQLAlchemyUnitOfWork(AbstractUnitOfWork):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def commit(self) -> None:
        await self._session.commit()

    async def rollback(self) -> None:
        await self._session.rollback()


def get_unit_of_work(session: SessionDep) -> AbstractUnitOfWork:
    return SQLAlchemyUnitOfWork(session)


UnitOfWorkDep = Annotated[AbstractUnitOfWork, Depends(get_unit_of_work)]
