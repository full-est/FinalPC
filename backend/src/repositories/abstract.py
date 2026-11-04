from abc import ABC, abstractmethod
from typing import Generic, TypeVar

ModelT = TypeVar("ModelT")


class AbstractRepository(ABC, Generic[ModelT]):
    """Базовый контракт репозитория.

    Модульные репозитории расширяют его своими методами (тоже абстрактными),
    а сервисы зависят только от абстракций — так их легко тестировать на фейках.
    """

    @abstractmethod
    async def get(self, id_: int) -> ModelT | None: ...

    @abstractmethod
    async def add(self, obj: ModelT) -> ModelT: ...

    @abstractmethod
    async def delete(self, obj: ModelT) -> None: ...
