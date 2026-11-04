import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import type { Category, Component } from '../api/types'
import { Icon } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { StockBadge } from '../components/ProductCard'
import { useToast } from '../components/Toast'
import { EmptyState, ErrorState, PageHead, Spinner } from '../components/ui'
import { useConfigurator } from '../hooks/useConfigurator'
import { useFetch } from '../hooks/useFetch'
import { formatPrice } from '../lib/format'
import { highlights } from '../lib/specs'
import '../styles/catalog.css'
import '../styles/builds.css'
import '../styles/configurator.css'

export default function Configurator() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const cfg = useConfigurator()
  const cats = useFetch(() => api.categories(), [])
  const [active, setActive] = useState('cpu')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'price_asc' | 'price_desc'>('price_asc')

  // ?build=ID — открыть готовую сборку в конфигураторе, ?add=ID — начать с конкретной комплектующей
  const preloaded = useRef(false)
  useEffect(() => {
    if (preloaded.current) return
    const buildId = Number(params.get('build'))
    const addId = Number(params.get('add'))
    if (!buildId && !addId) return
    preloaded.current = true
    const done = () => setParams({}, { replace: true })
    if (buildId) {
      api.build(buildId).then(b => { cfg.replaceAll(b.items.map(i => i.component)); toast(`Сборка «${b.name}» загружена`, 'info') })
        .catch(e => toast(e.message, 'error')).finally(done)
    } else {
      api.component(addId).then(c => { cfg.select(c); if (c.category) setActive(c.category.slug) })
        .catch(e => toast(e.message, 'error')).finally(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = useFetch(() => api.components({ category: active, size: 100, sort }), [active, sort])
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (list.data?.items ?? []).filter(c => !q || `${c.name} ${c.brand}`.toLowerCase().includes(q))
  }, [list.data, search])

  const categories = cats.data ?? []
  const issuesBy = (slug: string) => cfg.check?.issues.filter(i => i.category === slug) ?? []
  const picked = Object.keys(cfg.selection).length
  const activeCat = categories.find(c => c.slug === active)
  const idx = categories.findIndex(c => c.slug === active)

  const choose = (c: Component) => {
    cfg.select(c)
    // после выбора переходим к следующему незаполненному шагу
    const next = categories.slice(idx + 1).find(k => !cfg.selection[k.slug])
    if (next) setActive(next.slug)
  }

  const ready = !!cfg.check && cfg.check.complete && cfg.check.compatible
  const errors = cfg.check?.issues.filter(i => i.severity === 'error') ?? []
  const warnings = cfg.check?.issues.filter(i => i.severity === 'warning') ?? []

  if (cats.error) return <div className="container page"><ErrorState message={cats.error} onRetry={cats.reload} /></div>
  if (!cats.data) return <div className="container page"><Spinner /></div>

  return (
    <div className="container page">
      <PageHead
        crumbs={[{ to: '/', label: 'Главная' }, { label: 'Конфигуратор' }]}
        title="Конфигуратор ПК"
        text="Выберите комплектующие шаг за шагом — несовместимые сочетания мы подсветим сразу. Цена пересчитывается автоматически."
        actions={picked > 0 && <button className="btn btn-ghost" onClick={cfg.reset}><Icon name="trash" size={16} /> Сбросить</button>}
      />

      <div className="cfg">
        <div className="cfg-main">
          <ol className="steps" aria-label="Шаги сборки">
            {categories.map((c: Category, i) => {
              const chosen = cfg.selection[c.slug]
              const bad = issuesBy(c.slug).some(x => x.severity === 'error')
              return (
                <li key={c.id}>
                  <button className={`step ${active === c.slug ? 'step-active' : ''} ${chosen ? 'step-done' : ''} ${bad ? 'step-bad' : ''}`}
                    onClick={() => setActive(c.slug)} aria-current={active === c.slug ? 'step' : undefined}>
                    <span className="step-num">{bad ? <Icon name="alert" size={14} /> : chosen ? <Icon name="check" size={14} /> : i + 1}</span>
                    <span className="step-label">{c.name}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="card cfg-panel">
            <div className="row-between cfg-panel-head">
              <h2>{activeCat?.name}</h2>
              <div className="row">
                <div className="input-icon">
                  <Icon name="search" size={17} />
                  <input className="input" placeholder="Поиск" aria-label="Поиск" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select sort-select" aria-label="Сортировка" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
                  <option value="price_asc">Дешевле</option>
                  <option value="price_desc">Дороже</option>
                </select>
              </div>
            </div>

            {issuesBy(active).map((i, n) => (
              <div key={n} className={`notice notice-${i.severity}`}><Icon name="alert" size={18} /> {i.message}</div>
            ))}

            {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> :
              list.loading ? <Spinner /> :
              visible.length === 0 ? <EmptyState icon="search" title="Ничего не найдено" /> : (
                <ul className="options">
                  {visible.map(c => {
                    const selected = cfg.selection[active]?.id === c.id
                    const out = c.stock_quantity <= 0
                    return (
                      <li key={c.id} className={`option ${selected ? 'option-selected' : ''} ${out ? 'option-out' : ''}`}>
                        <ProductImage category={active} size="sm" label={c.name} />
                        <div className="grow">
                          <div className="option-name">{c.name}</div>
                          <div className="option-specs">{highlights(c).join(' · ')}</div>
                        </div>
                        <StockBadge qty={c.stock_quantity} />
                        <strong className="mono option-price">{formatPrice(c.price)}</strong>
                        {selected
                          ? <button className="btn btn-sm" onClick={() => cfg.remove(active)}><Icon name="check" size={15} /> Выбрано</button>
                          : <button className="btn btn-sm btn-primary" disabled={out} onClick={() => choose(c)}>Выбрать</button>}
                      </li>
                    )
                  })}
                </ul>
              )}
          </div>
        </div>

        <aside className="card cfg-summary">
          <div className="row-between">
            <h3>Ваша сборка</h3>
            <span className="badge">{picked} из {categories.length}</span>
          </div>

          <ul className="sum-list">
            {categories.map(c => {
              const chosen = cfg.selection[c.slug]
              return (
                <li key={c.id} className="sum-row">
                  <div className="grow">
                    <div className="part-cat">{c.name}</div>
                    {chosen
                      ? <div className="sum-name">{chosen.name}</div>
                      : <button className="link-btn" onClick={() => setActive(c.slug)}>Выбрать</button>}
                  </div>
                  {chosen && <>
                    <span className="mono sum-price">{formatPrice(chosen.price)}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-label={`Убрать ${chosen.name}`} onClick={() => cfg.remove(c.slug)}><Icon name="x" size={15} /></button>
                  </>}
                </li>
              )
            })}
          </ul>

          {cfg.checkError && <div className="notice notice-error"><Icon name="alert" size={18} /> {cfg.checkError}</div>}
          {errors.length > 0 && (
            <div className="stack" style={{ gap: 8 }}>
              {errors.map((i, n) => <div key={n} className="notice notice-error"><Icon name="alert" size={18} /> {i.message}</div>)}
            </div>
          )}
          {warnings.map((i, n) => <div key={n} className="notice notice-warning"><Icon name="info" size={18} /> {i.message}</div>)}
          {picked > 0 && cfg.check && !cfg.check.complete && errors.length === 0 && (
            <div className="notice notice-info"><Icon name="info" size={18} /> Выберите все комплектующие, чтобы оформить сборку.</div>
          )}
          {ready && <div className="notice notice-success"><Icon name="shield" size={18} /> Все комплектующие совместимы</div>}

          {cfg.check && (
            <dl className="price-lines">
              <div><dt>Комплектующие</dt><dd className="mono">{formatPrice(cfg.check.components_price)}</dd></div>
              <div><dt>Сборка и тестирование</dt><dd className="mono">{formatPrice(cfg.check.assembly_fee)}</dd></div>
              <div><dt>Потребление</dt><dd className="mono">~{cfg.check.power_draw} Вт</dd></div>
            </dl>
          )}
          <div className={`row-between total-line ${cfg.checking ? 'is-loading' : ''}`}>
            <span>Итого</span>
            <strong className="product-price mono">{formatPrice(cfg.check?.total_price ?? 0)}</strong>
          </div>
        </aside>
      </div>
    </div>
  )
}
