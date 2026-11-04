import { ApiError } from '../api/errors'
import type { Query } from '../api/client'

export interface Ctx {
  params: Record<string, string>
  query: Query
  body: any
  token: string | null
}

type Handler = (ctx: Ctx) => unknown

interface Route { method: string; regex: RegExp; keys: string[]; handler: Handler }

const routes: Route[] = []

export function route(method: string, pattern: string, handler: Handler) {
  const keys: string[] = []
  const src = pattern.replace(/:([a-z_]+)/gi, (_, k) => { keys.push(k); return '([^/]+)' })
  routes.push({ method, regex: new RegExp(`^${src}$`), keys, handler })
}

export function dispatch(method: string, path: string, query: Query, body: unknown, token: string | null): unknown {
  for (const r of routes) {
    if (r.method !== method) continue
    const m = r.regex.exec(path)
    if (!m) continue
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
    return r.handler({ params, query, body, token })
  }
  throw new ApiError(404, 'Объект не найден', 'not_found')
}

/** Страница для списковых ответов — тот же формат, что у бэкенда (Page). */
export function paginate<T>(all: T[], query: Query, defaultSize = 12) {
  const size = Math.min(Math.max(Number(query.size) || defaultSize, 1), 100)
  const pages = Math.max(Math.ceil(all.length / size), 1)
  const page = Math.min(Math.max(Number(query.page) || 1, 1), pages)
  return { items: all.slice((page - 1) * size, page * size), total: all.length, page, size, pages }
}
