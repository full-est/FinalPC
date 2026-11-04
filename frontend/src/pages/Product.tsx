import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { StockBadge } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { Icon } from '../components/Icon'
import { ErrorState, PageHead, Spinner } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { formatPrice } from '../lib/format'
import { specRows } from '../lib/specs'
import '../styles/catalog.css'

export default function Product() {
  const id = Number(useParams().id)
  const { data: item, loading, error, reload } = useFetch(() => api.component(id), [id])

  if (loading) return <div className="container page"><Spinner /></div>
  if (error || !item) return <div className="container page"><ErrorState message={error ?? 'Товар не найден'} onRetry={reload} /></div>

  return (
    <div className="container page">
      <PageHead
        crumbs={[
          { to: '/', label: 'Главная' },
          { to: '/catalog', label: 'Комплектующие' },
          { to: `/catalog?category=${item.category?.slug}`, label: item.category?.name ?? '' },
          { label: item.name },
        ]}
        title={item.name}
      />

      <div className="product">
        <div className="card product-media"><ProductImage src={item.image_url} category={item.category?.slug} label={item.name} size="lg" /></div>

        <div className="stack product-info">
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-accent">{item.brand}</span>
            <StockBadge qty={item.stock_quantity} />
            <span className="muted">Артикул: {item.sku}</span>
          </div>
          {item.description && <p className="muted product-desc">{item.description}</p>}

          <div className="card buy-box">
            <div>
              <div className="muted">Цена</div>
              <div className="product-price mono">{formatPrice(item.price)}</div>
            </div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <Link to={`/configurator?add=${item.id}`} className="btn btn-primary btn-lg">
                <Icon name="wrench" size={18} /> Использовать в сборке
              </Link>
            </div>
          </div>

          <ul className="perks">
            <li><Icon name="shield" size={18} /> Официальная гарантия производителя</li>
            <li><Icon name="truck" size={18} /> Доставка по всей России</li>
          </ul>
        </div>
      </div>

      <section className="specs card">
        <h2>Характеристики</h2>
        <dl className="spec-list">
          {specRows(item.specs).map(r => (
            <div key={r.label} className="spec-row"><dt>{r.label}</dt><dd>{r.value}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  )
}
