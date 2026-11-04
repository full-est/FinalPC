import type { CompatibilityIssue, Component, ConfigCheck } from '../api/types'

/**
 * Правила совместимости — зеркало api/configurator/compatibility.py на бэкенде.
 * Используется только мок-API; при работе с настоящим бэкендом проверку делает он.
 */

export const REQUIRED_CATEGORIES = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler'] as const

const LABEL: Record<string, string> = {
  cpu: 'процессор', motherboard: 'материнская плата', ram: 'оперативная память', gpu: 'видеокарта',
  storage: 'накопитель', psu: 'блок питания', case: 'корпус', cooler: 'охлаждение',
}

export const ASSEMBLY_FEE = 2000

/** Запас по мощности: (CPU + GPU + 100 Вт на остальное) × 1.2 */
export function requiredWattage(cpuTdp: number, gpuTdp: number) {
  return Math.ceil(((cpuTdp + gpuTdp + 100) * 1.2) / 10) * 10
}

export function checkConfiguration(items: { component: Component; quantity: number }[]): ConfigCheck {
  const slug = (c: Component) => c.category?.slug ?? ''
  const by: Record<string, Component | undefined> = {}
  for (const { component } of items) by[slug(component)] = component

  const issues: CompatibilityIssue[] = []
  const err = (message: string, category: string) => issues.push({ severity: 'error', message, category })
  const warn = (message: string, category: string) => issues.push({ severity: 'warning', message, category })

  const { cpu, motherboard: mb, ram, gpu, psu, case: pcCase, cooler } = by
  const s = (c: Component | undefined, k: string) => c?.specs[k]
  const n = (c: Component | undefined, k: string) => Number(c?.specs[k] ?? 0)

  for (const { component, quantity } of items) {
    if (component.stock_quantity < quantity) err(`«${component.name}» нет в наличии`, slug(component))
  }

  if (cpu && mb && s(cpu, 'socket') !== s(mb, 'socket')) {
    err(`Сокет процессора (${s(cpu, 'socket')}) не подходит к материнской плате (${s(mb, 'socket')})`, 'cpu')
  }
  if (mb && ram && s(mb, 'memory_type') !== s(ram, 'memory_type')) {
    err(`Материнская плата работает с ${s(mb, 'memory_type')}, а выбрана память ${s(ram, 'memory_type')}`, 'ram')
  }
  if (mb && ram) {
    if (n(ram, 'modules') > n(mb, 'ram_slots')) err('Памяти больше, чем слотов на материнской плате', 'ram')
    if (n(ram, 'capacity_gb') > n(mb, 'max_ram_gb')) err(`Плата поддерживает не более ${n(mb, 'max_ram_gb')} ГБ памяти`, 'ram')
  }
  if (mb && pcCase && !(s(pcCase, 'form_factors') as string[]).includes(s(mb, 'form_factor') as string)) {
    err(`Корпус не вмещает материнскую плату формата ${s(mb, 'form_factor')}`, 'case')
  }
  if (gpu && pcCase && n(gpu, 'length_mm') > n(pcCase, 'max_gpu_length_mm')) {
    err(`Видеокарта (${n(gpu, 'length_mm')} мм) не помещается в корпус (до ${n(pcCase, 'max_gpu_length_mm')} мм)`, 'gpu')
  }
  if (cpu && cooler) {
    if (!(s(cooler, 'sockets') as string[]).includes(s(cpu, 'socket') as string)) {
      err(`Кулер не поддерживает сокет ${s(cpu, 'socket')}`, 'cooler')
    } else if (n(cooler, 'tdp') < n(cpu, 'tdp')) {
      err(`Кулер рассчитан на ${n(cooler, 'tdp')} Вт, а процессору нужно ${n(cpu, 'tdp')} Вт`, 'cooler')
    }
  }

  const powerDraw = n(cpu, 'tdp') + n(gpu, 'tdp') + (cpu || gpu ? 100 : 0)
  if (psu && (cpu || gpu)) {
    const need = requiredWattage(n(cpu, 'tdp'), n(gpu, 'tdp'))
    if (n(psu, 'wattage') < need) err(`Для этой сборки нужен блок питания от ${need} Вт`, 'psu')
    else if (n(psu, 'wattage') < need * 1.15) warn('Блок питания работает на пределе — лучше взять с запасом', 'psu')
  }
  if (gpu && cpu && n(gpu, 'tdp') > 250 && n(cpu, 'cores') < 8) warn('Процессор может ограничивать производительность такой видеокарты', 'cpu')

  const missing = REQUIRED_CATEGORIES.filter(k => !by[k])
  const componentsPrice = items.reduce((sum, i) => sum + Number(i.component.price) * i.quantity, 0)
  const fee = items.length ? ASSEMBLY_FEE : 0

  return {
    compatible: !issues.some(i => i.severity === 'error'),
    complete: missing.length === 0,
    components_price: componentsPrice.toFixed(2),
    assembly_fee: fee.toFixed(2),
    total_price: (componentsPrice + fee).toFixed(2),
    power_draw: powerDraw,
    issues,
  }
}

export const missingLabel = (slug: string) => LABEL[slug] ?? slug
