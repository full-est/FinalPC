import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { BuildCard } from '../components/BuildCard'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, PageHead } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import '../styles/catalog.css'
import '../styles/builds.css'

type Sort = 'price_asc' | 'price_desc' | ''

export default function Builds() {
  const [sort, setSort] = useState<Sort>('price_asc')
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useFetch(
    () => api.builds({ sort: sort || undefined, page, size: 9 }), [sort, page])

  return (
    <div className="container page">
      <PageHead
        crumbs={[{ to: '/', label: 'Главная' }, { label: 'Готовые ПК' }]}
        title="Готовые компьютеры"
        text="Проверенные конфигурации: собираем, тестируем 24 часа и отправляем с гарантией. Не нашли подходящую — соберите свою."
        actions={<Link to="/configurator" className="btn btn-primary">Собрать свою</Link>}
      />

      <div className="row-between catalog-bar">
        <span className="muted">{data ? `Сборок: ${data.total}` : ' '}</span>
        <select className="select sort-select" value={sort} aria-label="Сортировка"
          onChange={e => { setSort(e.target.value as Sort); setPage(1) }}>
          <option value="price_asc">Сначала дешёвые</option>
          <option value="price_desc">Сначала дорогие</option>
        </select>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> :
        loading && !data ? <div className="grid-builds">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton" style={{ height: 460 }} />)}</div> :
        data && data.items.length === 0 ? <EmptyState icon="package" title="Пока нет готовых сборок" text="Загляните позже или соберите ПК самостоятельно." /> : (
          <div className={loading ? 'is-loading' : ''}>
            <div className="grid-builds">{data?.items.map(b => <BuildCard key={b.id} build={b} />)}</div>
            <Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </div>
        )}
    </div>
  )
}
