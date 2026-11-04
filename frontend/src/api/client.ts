import { mockRequest } from '../mock/server'
import { ApiError } from './errors'

export { ApiError }

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api/v1'

export type Query = Record<string, string | number | boolean | undefined | null>

export interface RequestOptions {
  query?: Query
  body?: unknown
}

type TokenGetter = () => string | null
let getToken: TokenGetter = () => null
export function setTokenGetter(fn: TokenGetter) { getToken = fn }
export const currentToken = () => getToken()

function buildQuery(query?: Query): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** Текст ошибки валидации FastAPI (422) приходит массивом — делаем читаемую строку. */
function errorMessage(data: unknown, fallback: string): string {
  const detail = (data as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ') || fallback
  return fallback
}

export async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) return mockRequest<T>(method, path, opts.query ?? {}, opts.body, getToken())

  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}${buildQuery(opts.query)}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Нет соединения с сервером. Проверьте подключение и попробуйте снова.', 'network_error')
  }

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, errorMessage(data, `Ошибка ${res.status}`), data?.code, data?.details)
  return data as T
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
