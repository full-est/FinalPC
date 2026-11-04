import { ApiError } from '../../api/errors'
import type { ConfigItemInput } from '../../api/types'
import { checkConfiguration } from '../compatibility'
import { findComponent } from '../db'
import { route } from '../router'

export function resolveItems(items: ConfigItemInput[] | undefined) {
  return (items ?? []).map(i => {
    const component = findComponent(i.component_id)
    if (!component) throw new ApiError(404, `Комплектующая #${i.component_id} не найдена`, 'not_found')
    return { component, quantity: Math.max(1, i.quantity || 1) }
  })
}

route('POST', '/configurator/check', ({ body }) => checkConfiguration(resolveItems(body?.items)))
