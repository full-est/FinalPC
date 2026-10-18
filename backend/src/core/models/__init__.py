"""Все модели импортируются здесь, чтобы Base.metadata была полной (нужно alembic)."""

from src.core.models.base import Base
from src.core.models.build import Build, BuildComponent
from src.core.models.cart import Cart, CartItem
from src.core.models.component import Category, Component, Stock
from src.core.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory
from src.core.models.user import User, UserRole

__all__ = [
    "Base",
    "Build",
    "BuildComponent",
    "Cart",
    "CartItem",
    "Category",
    "Component",
    "Order",
    "OrderItem",
    "OrderStatus",
    "OrderStatusHistory",
    "Stock",
    "User",
    "UserRole",
]
