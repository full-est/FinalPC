import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { Icon } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { StockBadge } from '../components/ProductCard'
import { ErrorState, PageHead, Spinner } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { inStock, sortedItems } from '../lib/build'
import { formatPrice } from '../lib/format'
import '../styles/catalog.css'
import '../styles/builds.css'

export default function BuildPage() {
  const id = Number(useParams().id)
  const { data: build, loading, error, reload } = useFetch(() => api.build(id), [id])

  if (loading) return <div className="container page"><Spinner /></div>
  if (error || !build) return <div className="container page"><ErrorState message={error ?? 'Сборка не найдена'} onRetry={reload} /></div>

  const partsTotal = build.items.reduce((s, i) => s + Number(i.component.price) * i.quantity, 0)
  const fee = Number(build.price) - partsTotal
  const available = inStock(build)

  return (
    <div className="container page">
      <PageHead
        crumbs={[{ to: '/', label: 'Главная' }, { to: '/builds', label: 'Готовые ПК' }, { label: build.name }]}
        title={build.name}
        text={build.description}
      />

      <div className="build-layout">
        <section className="card">
          <h2 className="block-title">Комплектация</h2>
          <ul className="parts">
            {sortedItems(build).map(({ component: c, quantity }) => (
              <li key={c.id} className="part">
                <ProductImage category={c.category?.slug} size="sm" label={c.name} />
                <div className="grow">
                  <div className="part-cat">{c.category?.name}</div>
                  <Link to={`/catalog/${c.id}`} className="part-name">{c.name}</Link>
                </div>
                <StockBadge qty={c.stock_quantity} />
                <span className="mono part-price">{formatPrice(Number(c.price) * quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card summary">
          <ProductImage src={build.image_url} category="build" label={build.name} />
          <dl className="price-lines">
            <div><dt>Комплектующие</dt><dd className="mono">{formatPrice(partsTotal)}</dd></div>
            <div><dt>Сборка и тестирование</dt><dd className="mono">{formatPrice(fee)}</dd></div>
          </dl>
          <div className="row-between total-line">
            <span>Итого</span>
            <strong className="product-price mono">{formatPrice(build.price)}</strong>
          </div>
          {!available && <p className="field-error">Часть комплектующих временно отсутствует — сборка недоступна для заказа.</p>}
          <Link to={`/configurator?build=${build.id}`} className="btn btn-block">
            <Icon name="wrench" size={18} /> Изменить в конфигураторе
          </Link>
          <ul className="perks">
            <li><Icon name="bolt" size={18} /> Стресс-тест 24 часа</li>
            <li><Icon name="shield" size={18} /> Гарантия на сборку</li>
            <li><Icon name="truck" size={18} /> Доставка по России</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
