/**
 * Типы ответов API. Построены по контракту из backend/README.md и моделям в backend/src/core/models.
 * Точные схемы ответов (Pydantic DTO) бэкенд ещё не опубликовал — если они отличаются,
 * правится только этот файл и слой src/api/index.ts.
 */

/** Decimal в JSON приходит строкой ("17990.00"). */
export type Money = string

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface Category {
  id: number
  slug: string
  name: string
}

export type Specs = Record<string, string | number | boolean | string[]>

export interface Component {
  id: number
  category_id: number
  category?: Category
  name: string
  brand: string
  sku: string
  price: Money
  description: string | null
  image_url: string | null
  specs: Specs
  is_active: boolean
  stock_quantity: number
}

export interface BuildItem {
  component: Component
  quantity: number
}

export interface Build {
  id: number
  name: string
  slug: string | null
  description: string | null
  image_url: string | null
  is_preset: boolean
  is_published: boolean
  owner_id: number | null
  items: BuildItem[]
  /** Сумма комплектующих + сбор (BUILD_ASSEMBLY_FEE). Считается бэкендом. */
  price: Money
}

export interface ComponentFilters {
  category?: string
  brand?: string
  search?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  sort?: 'price_asc' | 'price_desc' | 'name' | 'newest'
  page?: number
  size?: number
}

/* ---------- Конфигуратор ---------- */

export interface ConfigItemInput {
  component_id: number
  quantity: number
}

export interface CompatibilityIssue {
  severity: 'error' | 'warning'
  message: string
  category?: string
}

export interface ConfigCheck {
  /** Нет ни одной ошибки совместимости. */
  compatible: boolean
  /** Выбраны все обязательные категории. */
  complete: boolean
  components_price: Money
  assembly_fee: Money
  total_price: Money
  /** Потребляемая мощность комплектующих, Вт. */
  power_draw: number
  issues: CompatibilityIssue[]
}

export interface Configuration {
  id: number
  name: string
  items: BuildItem[]
  price: Money
  created_at: string
}

/* ---------- Корзина ---------- */

export interface CartLine {
  id: number
  quantity: number
  component: Component | null
  build: Build | null
  unit_price: Money
  line_total: Money
}

export interface Cart {
  items: CartLine[]
  total_price: Money
  total_quantity: number
}

/* ---------- Заказы ---------- */

export type OrderStatus = 'new' | 'confirmed' | 'assembling' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  id: number
  component_id: number | null
  build_id: number | null
  title: string
  unit_price: Money
  quantity: number
  composition: { component_id: number; name: string; unit_price: Money; quantity: number }[] | null
}

export interface OrderStatusEntry {
  id: number
  from_status: OrderStatus | null
  to_status: OrderStatus
  comment: string | null
  created_at: string
  changed_by_id?: number | null
}

export interface Order {
  id: number
  user_id: number | null
  status: OrderStatus
  total_price: Money
  contact_name: string
  contact_phone: string
  delivery_address: string
  comment: string | null
  admin_comment: string | null
  created_at: string
  items: OrderItem[]
  status_history: OrderStatusEntry[]
}

export interface OrderCreate {
  contact_name: string
  contact_phone: string
  delivery_address: string
  comment?: string
}

/* ---------- Пользователи ---------- */

export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}
