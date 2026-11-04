import type { Build, Category, Component } from '../api/types'
import { BUILDS, CATEGORIES, COMPONENTS } from './seed'
import { ASSEMBLY_FEE } from './compatibility'

/** «База данных» мок-API: хранится в localStorage, чтобы заказы, корзина и правки админки переживали перезагрузку. */

export interface BuildRecord {
  id: number
  name: string
  slug: string | null
  description: string | null
  image_url: string | null
  is_preset: boolean
  is_published: boolean
  owner_id: number | null
  created_at: string
  items: { component_id: number; quantity: number }[]
}

export interface DB {
  version: number
  categories: Category[]
  components: Component[]
  builds: BuildRecord[]
  seq: Record<string, number>
  [key: string]: unknown
}

const KEY = 'pcstore.mock.db'
const VERSION = 1

function seed(): DB {
  const categories = CATEGORIES
  const bySlug = Object.fromEntries(categories.map(c => [c.slug, c]))
  const components: Component[] = COMPONENTS.map(s => ({
    id: s.id,
    category_id: bySlug[s.category].id,
    category: bySlug[s.category],
    name: s.name,
    brand: s.brand,
    sku: `${s.category.toUpperCase()}-${String(s.id).padStart(4, '0')}`,
    price: s.price.toFixed(2),
    description: s.description,
    image_url: null,
    specs: s.specs,
    is_active: true,
    stock_quantity: s.stock,
  }))
  const builds: BuildRecord[] = BUILDS.map((b, i) => ({
    id: b.id, name: b.name, slug: b.slug, description: b.description, image_url: null,
    is_preset: true, is_published: true, owner_id: null,
    created_at: new Date(Date.now() - (BUILDS.length - i) * 86400000).toISOString(),
    items: b.items.map(component_id => ({ component_id, quantity: 1 })),
  }))
  return { version: VERSION, categories, components, builds, seq: { build: 100, component: 1000 } }
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      if (parsed.version === VERSION) return parsed
    }
  } catch { /* повреждённые данные — пересоздаём */ }
  return seed()
}

export const db: DB = load()

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* переполнено/недоступно — работаем в памяти */ }
}

export function resetDb() {
  localStorage.removeItem(KEY)
  location.reload()
}

export function nextId(name: string): number {
  db.seq[name] = (db.seq[name] ?? 0) + 1
  return db.seq[name]
}

export const findComponent = (id: number) => db.components.find(c => c.id === id)

export function serializeBuild(rec: BuildRecord): Build {
  const items = rec.items.flatMap(i => {
    const component = findComponent(i.component_id)
    return component ? [{ component, quantity: i.quantity }] : []
  })
  const sum = items.reduce((s, i) => s + Number(i.component.price) * i.quantity, 0)
  return {
    id: rec.id, name: rec.name, slug: rec.slug, description: rec.description, image_url: rec.image_url,
    is_preset: rec.is_preset, is_published: rec.is_published, owner_id: rec.owner_id,
    items, price: (sum + ASSEMBLY_FEE).toFixed(2),
  }
}
