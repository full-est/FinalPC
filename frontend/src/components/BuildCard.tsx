import { Link } from 'react-router-dom'
import type { Build } from '../api/types'
import { buildSummary, inStock } from '../lib/build'
import { formatPrice } from '../lib/format'
import { ProductImage } from './ProductImage'

export function BuildCard({ build, action }: { build: Build; action?: React.ReactNode }) {
  const available = inStock(build)
  return (
    <article className="card card-hover bcard">
      <Link to={`/builds/${build.id}`} aria-label={build.name}>
        <ProductImage src={build.image_url} category="build" label={build.name} />
      </Link>
      <div className="pcard-body">
        <div className="row-between">
          <span className="pcard-brand">Готовая сборка</span>
          {!available && <span className="badge badge-danger">Нет в наличии</span>}
        </div>
        <Link to={`/builds/${build.id}`} className="bcard-title">{build.name}</Link>
        <dl className="bcard-specs">
          {buildSummary(build).map(s => (
            <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
          ))}
        </dl>
      </div>
      <div className="pcard-foot">
        <div>
          <div className="muted" style={{ fontSize: 12 }}>под ключ</div>
          <strong className="pcard-price mono">{formatPrice(build.price)}</strong>
        </div>
        {action ?? <Link to={`/builds/${build.id}`} className="btn btn-sm">Подробнее</Link>}
      </div>
    </article>
  )
}
