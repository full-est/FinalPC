import type { Component, Specs } from '../api/types'

const LABELS: Record<string, [string, string?]> = {
  socket: ['Сокет'],
  chipset: ['Чипсет'],
  cores: ['Ядра'],
  threads: ['Потоки'],
  base_ghz: ['Базовая частота', 'ГГц'],
  boost_ghz: ['Максимальная частота', 'ГГц'],
  tdp: ['Тепловыделение (TDP)', 'Вт'],
  memory_type: ['Тип памяти'],
  form_factor: ['Форм-фактор'],
  form_factors: ['Поддерживаемые форм-факторы'],
  ram_slots: ['Слотов памяти'],
  max_ram_gb: ['Максимум памяти', 'ГБ'],
  capacity_gb: ['Объём', 'ГБ'],
  speed_mhz: ['Частота', 'МГц'],
  modules: ['Модулей в комплекте'],
  chip: ['Графический чип'],
  vram_gb: ['Видеопамять', 'ГБ'],
  length_mm: ['Длина', 'мм'],
  max_gpu_length_mm: ['Макс. длина видеокарты', 'мм'],
  type: ['Тип'],
  interface: ['Интерфейс'],
  wattage: ['Мощность', 'Вт'],
  certification: ['Сертификат'],
  color: ['Цвет'],
  sockets: ['Поддерживаемые сокеты'],
}

export function specRows(specs: Specs): { label: string; value: string }[] {
  return Object.entries(specs).map(([key, raw]) => {
    const [label, unit] = LABELS[key] ?? [key]
    const text = Array.isArray(raw) ? raw.join(', ') : typeof raw === 'boolean' ? (raw ? 'Да' : 'Нет') : String(raw)
    return { label, value: unit ? `${text} ${unit}` : text }
  })
}

const gb = (v: unknown) => (Number(v) >= 1000 ? `${Number(v) / 1000} ТБ` : `${v} ГБ`)

/** Ключевые характеристики для карточки товара (до трёх штук). */
export function highlights(c: Component): string[] {
  const s = c.specs
  switch (c.category?.slug) {
    case 'cpu': return [`${s.cores} ядер / ${s.threads} потоков`, `до ${s.boost_ghz} ГГц`, `Сокет ${s.socket}`]
    case 'motherboard': return [`Сокет ${s.socket}`, `${s.memory_type}`, `${s.form_factor}`]
    case 'ram': return [`${s.memory_type}`, gb(s.capacity_gb), `${s.speed_mhz} МГц`]
    case 'gpu': return [`${s.vram_gb} ГБ VRAM`, `${s.tdp} Вт`, `${s.length_mm} мм`]
    case 'storage': return [`${s.type}`, gb(s.capacity_gb), `${s.interface}`]
    case 'psu': return [`${s.wattage} Вт`, `${s.certification}`]
    case 'case': return [(s.form_factors as string[]).join(' / '), `GPU до ${s.max_gpu_length_mm} мм`]
    case 'cooler': return [`${s.type}`, `до ${s.tdp} Вт`]
    default: return []
  }
}
