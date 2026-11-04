import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { Component, ConfigCheck } from '../api/types'
import { useDebounced } from './useFetch'

export type Selection = Record<string, Component>

const KEY = 'pcstore.configurator'

function readDraft(): Selection {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Selection } catch { return {} }
}

/** Состояние конфигуратора: выбранные комплектующие по категориям + проверка на сервере. */
export function useConfigurator() {
  const [selection, setSelection] = useState<Selection>(readDraft)
  const [check, setCheck] = useState<ConfigCheck | null>(null)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  const items = useMemo(
    () => Object.values(selection).map(c => ({ component_id: c.id, quantity: 1 })),
    [selection],
  )
  const key = useDebounced(items.map(i => i.component_id).sort().join(','), 150)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(selection)) } catch { /* черновик не критичен */ }
  }, [selection])

  useEffect(() => {
    if (!key) { setCheck(null); setCheckError(null); return }
    let cancelled = false
    setChecking(true)
    api.checkConfiguration(key.split(',').map(id => ({ component_id: Number(id), quantity: 1 })))
      .then(res => { if (!cancelled) { setCheck(res); setCheckError(null) } })
      .catch(e => { if (!cancelled) setCheckError(e instanceof Error ? e.message : 'Не удалось проверить сборку') })
      .finally(() => { if (!cancelled) setChecking(false) })
    return () => { cancelled = true }
  }, [key])

  const select = useCallback((c: Component) => {
    const slug = c.category?.slug
    if (slug) setSelection(prev => ({ ...prev, [slug]: c }))
  }, [])
  const remove = useCallback((slug: string) => setSelection(prev => {
    const { [slug]: _removed, ...rest } = prev
    return rest
  }), [])
  const replaceAll = useCallback((components: Component[]) => {
    const next: Selection = {}
    for (const c of components) if (c.category?.slug) next[c.category.slug] = c
    setSelection(next)
  }, [])
  const reset = useCallback(() => setSelection({}), [])

  return { selection, items, check, checking, checkError, select, remove, replaceAll, reset }
}
