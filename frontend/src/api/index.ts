import { http } from './client'
import type {
  Build, Category, Component, ComponentFilters, ConfigCheck, ConfigItemInput, Page,
} from './types'

export { ApiError } from './errors'

export const api = {
  categories: () => http.get<Category[]>('/categories'),
  components: (filters: ComponentFilters = {}) => http.get<Page<Component>>('/components', { ...filters }),
  component: (id: number) => http.get<Component>(`/components/${id}`),

  builds: (query: { sort?: 'price_asc' | 'price_desc'; page?: number; size?: number } = {}) =>
    http.get<Page<Build>>('/builds', { ...query }),
  build: (id: number) => http.get<Build>(`/builds/${id}`),

  checkConfiguration: (items: ConfigItemInput[]) => http.post<ConfigCheck>('/configurator/check', { items }),
}
