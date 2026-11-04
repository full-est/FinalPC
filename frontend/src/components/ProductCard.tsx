import { Link } from 'react-router-dom'
import type { Component } from '../api/types'
import { formatPrice } from '../lib/format'
import { highlights } from '../lib/specs'
import { ProductImage } from './ProductImage'

export function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0) return <span className="badge badge-danger">Нет в наличии</span>
  if (qty <= 5) return <span className="badge badge-warning">Осталось {qty} шт.</span>
  return <span className="badge badge-success">В наличии</span>
}

export function ProductCard({ item, action }: { item: Component; action?: React.ReactNode }) {
  return (
    <article className="card card-hover pcard">
      <Link to={`/catalog/${item.id}`} className="pcard-link" aria-label={item.name}>
        <ProductImage src={item.image_url} category={item.category?.slug} label={item.name} />
      </Link>
      <div className="pcard-body">
        <div className="row-between">
          <span className="pcard-brand">{item.brand}</span>
          <StockBadge qty={item.stock_quantity} />
        </div>
        <Link to={`/catalog/${item.id}`} className="pcard-title">{item.name}</Link>
        <ul className="pcard-specs">
          {highlights(item).map(h => <li key={h}>{h}</li>)}
        </ul>
      </div>
      <div className="pcard-foot">
        <strong className="pcard-price mono">{formatPrice(item.price)}</strong>
        {action}
      </div>
    </article>
  )
}
