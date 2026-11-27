from typing import Annotated

from pydantic import AfterValidator, Field, StringConstraints

BCRYPT_MAX_BYTES = 72


def _check_password_bytes(value: str) -> str:
    # bcrypt учитывает только первые 72 байта; кириллица занимает 2 байта на символ.
    if len(value.encode()) > BCRYPT_MAX_BYTES:
        raise ValueError(f"Пароль слишком длинный (максимум {BCRYPT_MAX_BYTES} байт)")
    return value


PasswordStr = Annotated[str, Field(min_length=8, max_length=72), AfterValidator(_check_password_bytes)]
PhoneStr = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[0-9\s\-()]{7,20}$")]
NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
SlugStr = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=64)]
UrlStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=512)]
