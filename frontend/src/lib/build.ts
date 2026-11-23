import type { Build, Component } from '../api/types'

export const CATEGORY_ORDER = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler']

export function partOf(build: Build, slug: string): Component | undefined {
  return build.items.find(i => i.component.category?.slug === slug)?.component
}

/** Короткая строка характеристик для карточки сборки. */
export function buildSummary(build: Build): { label: string; value: string }[] {
  const cpu = partOf(build, 'cpu')
  const gpu = partOf(build, 'gpu')
  const ram = partOf(build, 'ram')
  const ssd = partOf(build, 'storage')
  const gb = (v: unknown) => (Number(v) >= 1000 ? `${Number(v) / 1000} ТБ` : `${v} ГБ`)
  return [
    { label: 'Процессор', value: cpu?.name.replace(/^(AMD|Intel)\s/, '') ?? '—' },
    { label: 'Видеокарта', value: gpu?.specs.chip ? String(gpu.specs.chip) : '—' },
    { label: 'Память', value: ram ? `${gb(ram.specs.capacity_gb)} ${ram.specs.memory_type}` : '—' },
    { label: 'Накопитель', value: ssd ? gb(ssd.specs.capacity_gb) : '—' },
  ]
}

export function sortedItems(build: Build) {
  return [...build.items].sort((a, b) =>
    CATEGORY_ORDER.indexOf(a.component.category?.slug ?? '') - CATEGORY_ORDER.indexOf(b.component.category?.slug ?? ''))
}

export const inStock = (build: Build) => build.items.every(i => i.component.stock_quantity >= i.quantity)
