import type { Query } from '../api/client'
import { dispatch } from './router'
import './routes/catalog'
import './routes/configurator'

/** Имитация сети: небольшая задержка, чтобы были видны состояния загрузки. */
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function mockRequest<T>(method: string, path: string, query: Query, body: unknown, token: string | null): Promise<T> {
  await delay(120 + Math.random() * 180)
  // JSON-копия, как после настоящего ответа сервера: UI не должен мутировать «базу» по ссылке
  return JSON.parse(JSON.stringify(dispatch(method, path, query, body, token) ?? null)) as T
}
