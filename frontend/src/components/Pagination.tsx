import { Icon } from './Icon'

function range(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(pages - 1, page + 1)
  if (from > 2) out.push('…')
  for (let i = from; i <= to; i++) out.push(i)
  if (to < pages - 1) out.push('…')
  out.push(pages)
  return out
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav className="pagination" aria-label="Страницы">
      <button className="btn btn-icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Назад">
        <Icon name="arrowLeft" size={18} />
      </button>
      {range(page, pages).map((p, i) => p === '…'
        ? <span key={`d${i}`} className="muted">…</span>
        : <button key={p} className={`btn btn-icon page-btn ${p === page ? 'btn-primary' : ''}`} onClick={() => onChange(p)} aria-current={p === page}>{p}</button>)}
      <button className="btn btn-icon" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Вперёд">
        <Icon name="arrowRight" size={18} />
      </button>
    </nav>
  )
}
