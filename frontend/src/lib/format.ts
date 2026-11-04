const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** Цены с бэкенда приходят строкой (Decimal) — приводим к числу и форматируем. */
export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return `${rub.format(Number.isFinite(n) ? n : 0)} ₽`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function plural(n: number, forms: [string, string, string]): string {
  const m = Math.abs(n) % 100
  const d = m % 10
  if (m > 10 && m < 20) return forms[2]
  if (d > 1 && d < 5) return forms[1]
  if (d === 1) return forms[0]
  return forms[2]
}
