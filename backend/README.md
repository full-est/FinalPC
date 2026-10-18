# PC Store — Backend

FastAPI + SQLAlchemy 2 (async, asyncpg) + PostgreSQL + Alembic (psycopg2).

## Запуск

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate           # Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env             # и поправить параметры БД / JWT_SECRET_KEY

alembic upgrade head             # применить миграции
python -m src.main               # или: uvicorn src.main:app --reload
```

Swagger: http://localhost:8000/docs

Первый администратор (через API назначить админа некому):

```bash
python -m src.cli create-admin --email admin@example.com --password 'password123'
```

Если пользователь с таким email уже есть, он получает роль `admin`.

Через Docker (из корня репозитория): `docker compose up --build`.

Тесты: `pytest` (из папки `backend`, БД не нужна).

Новая миграция после изменения моделей: `alembic revision --autogenerate -m "описание"`.

## Архитектура

```
src/
├── main.py              # create_app(): middlewares, обработчики ошибок, сборка всех роутеров
├── config.py            # Settings (pydantic-settings, .env)
├── exceptions.py        # доменные исключения + единый перевод в HTTP-ответ
├── middlewares.py       # CORS, X-Request-ID, логирование запросов
├── core/
│   ├── database/
│   │   ├── connection.py    # engine, фабрика сессий, SessionDep (сессия на запрос)
│   │   └── unit_of_work.py  # AbstractUnitOfWork — граница транзакции для сервисов
│   └── models/              # ORM-модели (все импортируются в models/__init__.py для alembic)
├── cli.py               # служебные команды (create-admin)
├── repositories/        # AbstractRepository + общая реализация на SQLAlchemy
├── schemas/             # общие схемы: BaseSchema, Page, PaginationParams, типы полей
└── api/<модуль>/
    ├── router.py        # HTTP: параметры, статус-коды, response_model. Без логики
    ├── service.py       # бизнес-логика. Не знает про HTTP и SQLAlchemy
    ├── repository.py    # Abstract<X>Repository (контракт) + реализация на SQLAlchemy
    ├── schemas.py       # Pydantic DTO запросов и ответов
    ├── exceptions.py    # исключения модуля (наследники src.exceptions)
    └── dependencies.py  # сборка зависимостей: session -> repository -> service
```

### Правила слоёв

| Слой | Знает | Не знает |
|---|---|---|
| router | service (через `Depends`), schemas | репозитории, ORM, транзакции |
| service | абстрактные репозитории, `AbstractUnitOfWork`, schemas, models | HTTP, `AsyncSession`, SQL |
| repository | `AsyncSession`, models | HTTP, бизнес-правила; **не коммитит** (только `flush`) |

- Сервис бросает доменные исключения (`NotFoundError`, `ConflictError`, …), обработчик в
  `src/exceptions.py` переводит их в JSON `{"detail", "code", "details"}` с нужным статусом.
- Транзакцию фиксирует сервис: `await self._uow.commit()`. Всё незакоммиченное откатывается
  при закрытии сессии в конце запроса.
- Связи моделей объявлены с `lazy="raise"`: всё нужное загружается явно в репозитории
  (`selectinload`). Случайный N+1 или неявный запрос в async сразу даёт ошибку.
- Зависимости собираются в `dependencies.py`, поэтому в тестах любой слой подменяется через
  `app.dependency_overrides` (см. `tests/conftest.py`, `tests/fakes.py`).

### Модули

| Модуль | Эндпоинты | Что делает |
|---|---|---|
| healthcheck | `GET /health` | проверка API и БД |
| auth | `POST /auth/register`, `/login`, `/refresh` | JWT access + refresh |
| users | `GET/PATCH /users/me`, `POST /users/me/password` | личный кабинет |
| catalog | `GET /categories`, `GET /components`, `GET /components/{id}` | каталог с фильтрами, сортировкой, пагинацией |
| builds | `GET /builds`, `GET /builds/{id}` | готовые сборки магазина |
| configurator | `POST /configurator/check`, CRUD `/configurator/configurations` | совместимость, цена, сохранённые сборки пользователя |
| cart | `GET/DELETE /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/{id}` | корзина (комплектующие и сборки) |
| orders | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | оформление, история, отмена |

Все пути — с префиксом `API_PREFIX` (по умолчанию `/api/v1`).

### Админка (`/admin/*`)

Пакет `api/admin/` с той же структурой (router → service → репозитории публичных модулей).
Проверка роли (`get_current_admin`) висит на общем роутере `api/admin/router.py`, поэтому
ни один эндпоинт админки не может случайно остаться открытым.

| Раздел | Эндпоинты | Правила |
|---|---|---|
| Категории | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}` | slug уникален; категорию с товарами удалить нельзя (409) |
| Комплектующие | `GET/POST /admin/components`, `GET/PATCH/DELETE /admin/components/{id}` | артикул уникален; товар из сборок не удаляется (409) — его скрывают `is_active=false` |
| Склад | `PUT /admin/components/{id}/stock`, `POST …/stock/adjust` | установка остатка / приход-списание; в минус уйти нельзя |
| Готовые сборки | `GET/POST /admin/builds`, `GET/PATCH/DELETE /admin/builds/{id}` | состав проверяется правилами конфигуратора; черновик виден покупателям только после `is_published=true` |
| Заказы | `GET /admin/orders`, `GET/PATCH /admin/orders/{id}`, `PATCH /admin/orders/{id}/status` | фильтры по статусу, пользователю, датам; смена статуса с комментарием пишется в историю; `PATCH /{id}` — комментарий магазина; отмена возвращает остатки |
| Пользователи | `GET /admin/users`, `GET/PATCH /admin/users/{id}` | смена роли, блокировка; себя разжаловать или заблокировать нельзя |

Жизненный цикл заказа:

```
new ──> confirmed ──> assembling ──> shipped ──> completed
 │          │              │
 └──────────┴──────────────┴──> cancelled   (пользователь сам — только из new/confirmed)
```

### Ключевые решения предметной области

- **Сборка** (`builds`) — одна таблица и для готовых сборок (`is_preset=True`), и для
  пользовательских конфигураций (`is_preset=False`, `owner_id`). Цена не хранится, а
  считается из текущих цен комплектующих + `BUILD_ASSEMBLY_FEE`.
- **Совместимость** — `api/configurator/compatibility.py`: чистые функции-правила по полю
  `components.specs` (JSONB). Список используемых ключей описан в начале модуля.
  Сохранить можно только полную и совместимую конфигурацию.
- **Склад** — отдельная таблица `stock`. При оформлении заказа строки блокируются
  (`SELECT … FOR UPDATE`), остатки списываются в той же транзакции, что и создание заказа.
  При отмене возвращаются.
- **Заказ** хранит снимок: название, цену и состав сборки на момент покупки.
- **История статусов** — таблица `order_status_history` (откуда → куда, кто, комментарий, когда).
  Статус меняется только через `api/orders/status.py::change_status`, который пишет запись
  в той же транзакции. Покупатель видит хронологию, админ — ещё автора и комментарий.
  Хранится в Postgres, а не в ES: запись должна быть атомарной со сменой статуса.
- **Комментарий магазина** — `orders.admin_comment` (трек-номер и т.п.), виден покупателю.
