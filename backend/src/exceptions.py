from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Базовое доменное исключение.

    Сервисы бросают только наследников AppError и ничего не знают про HTTP.
    Перевод в HTTP-ответ делается в одном месте — в обработчике ниже.
    """

    code: str = "app_error"
    message: str = "Внутренняя ошибка приложения"

    def __init__(self, message: str | None = None, *, details: Any = None) -> None:
        self.message = message or self.message
        self.details = details
        super().__init__(self.message)


class NotFoundError(AppError):
    code = "not_found"
    message = "Объект не найден"


class ConflictError(AppError):
    code = "conflict"
    message = "Конфликт состояния"


class AlreadyExistsError(ConflictError):
    code = "already_exists"
    message = "Объект уже существует"


class BusinessRuleError(AppError):
    code = "business_rule_violation"
    message = "Нарушено бизнес-правило"


class AuthenticationError(AppError):
    code = "not_authenticated"
    message = "Требуется авторизация"


class PermissionDeniedError(AppError):
    code = "permission_denied"
    message = "Недостаточно прав"


# Порядок важен: более специфичные классы — выше.
_STATUS_CODES: tuple[tuple[type[AppError], int], ...] = (
    (NotFoundError, status.HTTP_404_NOT_FOUND),
    (ConflictError, status.HTTP_409_CONFLICT),
    (BusinessRuleError, status.HTTP_400_BAD_REQUEST),
    (AuthenticationError, status.HTTP_401_UNAUTHORIZED),
    (PermissionDeniedError, status.HTTP_403_FORBIDDEN),
)


def _status_code_for(exc: AppError) -> int:
    for exc_class, status_code in _STATUS_CODES:
        if isinstance(exc, exc_class):
            return status_code
    return status.HTTP_500_INTERNAL_SERVER_ERROR


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    headers = {"WWW-Authenticate": "Bearer"} if isinstance(exc, AuthenticationError) else None
    return JSONResponse(
        status_code=_status_code_for(exc),
        content={"detail": exc.message, "code": exc.code, "details": exc.details},
        headers=headers,
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
