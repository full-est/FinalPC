import { ApiError } from '../../api/errors'
import { db, findComponent, serializeBuild } from '../db'
import { paginate, route } from '../router'

route('GET', '/categories', () => db.categories)

route('GET', '/components', ({ query }) => {
  const search = String(query.search ?? '').trim().toLowerCase()
  const min = Number(query.min_price) || 0
  const max = Number(query.max_price) || Infinity

  let list = db.components.filter(c => c.is_active)
  if (query.category) list = list.filter(c => c.category?.slug === query.category)
  if (query.brand) {
    const brands = String(query.brand).split(',')
    list = list.filter(c => brands.includes(c.brand))
  }
  if (search) list = list.filter(c => `${c.name} ${c.brand} ${c.sku}`.toLowerCase().includes(search))
  if (min || max !== Infinity) list = list.filter(c => Number(c.price) >= min && Number(c.price) <= max)
  if (String(query.in_stock) === 'true') list = list.filter(c => c.stock_quantity > 0)

  const sorters: Record<string, (a: typeof list[number], b: typeof list[number]) => number> = {
    price_asc: (a, b) => Number(a.price) - Number(b.price),
    price_desc: (a, b) => Number(b.price) - Number(a.price),
    name: (a, b) => a.name.localeCompare(b.name, 'ru'),
    newest: (a, b) => b.id - a.id,
  }
  list = [...list].sort(sorters[String(query.sort)] ?? sorters.name)
  return paginate(list, query, 12)
})

route('GET', '/components/:id', ({ params }) => {
  const c = findComponent(Number(params.id))
  if (!c || !c.is_active) throw new ApiError(404, 'Комплектующая не найдена', 'not_found')
  return c
})

route('GET', '/builds', ({ query }) => {
  let list = db.builds.filter(b => b.is_preset && b.is_published).map(serializeBuild)
  const sorters: Record<string, (a: typeof list[number], b: typeof list[number]) => number> = {
    price_asc: (a, b) => Number(a.price) - Number(b.price),
    price_desc: (a, b) => Number(b.price) - Number(a.price),
  }
  if (sorters[String(query.sort)]) list = [...list].sort(sorters[String(query.sort)])
  return paginate(list, query, 12)
})

route('GET', '/builds/:id', ({ params }) => {
  const rec = db.builds.find(b => b.id === Number(params.id) && b.is_preset && b.is_published)
  if (!rec) throw new ApiError(404, 'Сборка не найдена', 'not_found')
  return serializeBuild(rec)
})
