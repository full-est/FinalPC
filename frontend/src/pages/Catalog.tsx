import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import type { ComponentFilters } from '../api/types'
import { Icon } from '../components/Icon'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorState, PageHead } from '../components/ui'
import { useDebounced, useFetch } from '../hooks/useFetch'
import { plural } from '../lib/format'
import '../styles/catalog.css'

const SORTS: { value: NonNullable<ComponentFilters['sort']>; label: string }[] = [
  { value: 'name', label: 'По названию' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'newest', label: 'Новинки' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const brands = useMemo(() => (params.get('brand') ?? '').split(',').filter(Boolean), [params])
  const sort = (params.get('sort') as ComponentFilters['sort']) ?? 'name'
  const inStock = params.get('stock') === '1'
  const page = Number(params.get('page')) || 1

  const [search, setSearch] = useState(params.get('q') ?? '')
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')
  const dSearch = useDebounced(search)
  const dMin = useDebounced(min)
  const dMax = useDebounced(max)

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
      if (resetPage) next.delete('page')
      return next
    }, { replace: true })
  }

  // поиск и цена применяются после паузы в наборе
  useEffect(() => {
    if (dSearch !== (params.get('q') ?? '')) update({ q: dSearch || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dSearch])
  useEffect(() => {
    if (dMin !== (params.get('min') ?? '') || dMax !== (params.get('max') ?? '')) update({ min: dMin || null, max: dMax || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dMin, dMax])

  const cats = useFetch(() => api.categories(), [])
  // для списка брендов берём все товары категории (без остальных фильтров)
  const facets = useFetch(() => api.components({ category: category || undefined, size: 100 }), [category])
  const brandList = useMemo(() => [...new Set((facets.data?.items ?? []).map(c => c.brand))].sort(), [facets.data])

  const list = useFetch(() => api.components({
    category: category || undefined,
    brand: brands.join(',') || undefined,
    search: params.get('q') || undefined,
    min_price: Number(params.get('min')) || undefined,
    max_price: Number(params.get('max')) || undefined,
    in_stock: inStock || undefined,
    sort, page, size: 12,
  }), [params.toString()])

  const toggleBrand = (b: string) => {
    const next = brands.includes(b) ? brands.filter(x => x !== b) : [...brands, b]
    update({ brand: next.join(',') || null })
  }
  const reset = () => { setSearch(''); setMin(''); setMax(''); setParams(category ? { category } : {}, { replace: true }) }

  const activeCategory = cats.data?.find(c => c.slug === category)
  const hasFilters = !!(brands.length || inStock || params.get('q') || params.get('min') || params.get('max'))
  const total = list.data?.total ?? 0

  return (
    <div className="container page">
      <PageHead
        crumbs={[{ to: '/', label: 'Главная' }, { label: 'Комплектующие' }]}
        title={activeCategory?.name ?? 'Комплектующие'}
        text="Всё для самостоятельной сборки: процессоры, видеокарты, память и другое. Остатки обновляются в реальном времени."
      />

      <div className="chips" role="tablist" aria-label="Категории">
        <button className={`chip ${!category ? 'chip-active' : ''}`} onClick={() => update({ category: null, brand: null })}>Все</button>
        {cats.data?.map(c => (
          <button key={c.id} className={`chip ${category === c.slug ? 'chip-active' : ''}`}
            onClick={() => update({ category: c.slug, brand: null })}>{c.name}</button>
        ))}
      </div>

      <div className="catalog">
        <aside className="filters card">
          <div className="row-between">
            <h3>Фильтры</h3>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={reset}>Сбросить</button>}
          </div>

          <div className="field">
            <label htmlFor="search">Поиск</label>
            <div className="input-icon">
              <Icon name="search" size={17} />
              <input id="search" className="input" placeholder="Название или артикул" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <span className="label">Цена, ₽</span>
            <div className="row">
              <input className="input" inputMode="numeric" placeholder="от" aria-label="Цена от" value={min} onChange={e => setMin(e.target.value.replace(/\D/g, ''))} />
              <input className="input" inputMode="numeric" placeholder="до" aria-label="Цена до" value={max} onChange={e => setMax(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          {brandList.length > 1 && (
            <div className="field">
              <span className="label">Бренд</span>
              <div className="stack" style={{ gap: 9 }}>
                {brandList.map(b => (
                  <label key={b} className="checkbox">
                    <input type="checkbox" checked={brands.includes(b)} onChange={() => toggleBrand(b)} /> {b}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="checkbox">
            <input type="checkbox" checked={inStock} onChange={e => update({ stock: e.target.checked ? '1' : null })} /> Только в наличии
          </label>
        </aside>

        <section>
          <div className="row-between catalog-bar">
            <span className="muted">{list.data ? `${total} ${plural(total, ['товар', 'товара', 'товаров'])}` : ' '}</span>
            <select className="select sort-select" value={sort} aria-label="Сортировка" onChange={e => update({ sort: e.target.value }, false)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> :
            list.loading && !list.data ? <div className="grid-products">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}</div> :
            list.data && list.data.items.length === 0 ? (
              <EmptyState icon="search" title="Ничего не найдено" text="Попробуйте изменить или сбросить фильтры."
                action={<button className="btn" onClick={reset}>Сбросить фильтры</button>} />
            ) : (
              <div className={list.loading ? 'is-loading' : ''}>
                <div className="grid-products">
                  {list.data?.items.map(item => <ProductCard key={item.id} item={item} />)}
                </div>
                <Pagination page={list.data?.page ?? 1} pages={list.data?.pages ?? 1}
                  onChange={p => { update({ page: p > 1 ? String(p) : null }, false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </div>
            )}
        </section>
      </div>
    </div>
  )
}
