import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

export function Spinner() {
  return <div className="center-box"><div className="spinner" role="status" aria-label="Загрузка" /></div>
}

export function EmptyState({ icon = 'box', title, text, action }: {
  icon?: IconName; title: string; text?: string; action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="icon-wrap"><Icon name={icon} size={30} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState icon="alert" title="Что-то пошло не так" text={message}
      action={onRetry && <button className="btn" onClick={onRetry}>Повторить</button>} />
  )
}

export function PageHead({ title, text, crumbs, actions }: {
  title: ReactNode; text?: ReactNode; crumbs?: { to?: string; label: string }[]; actions?: ReactNode
}) {
  return (
    <>
      {crumbs && (
        <nav className="breadcrumbs" aria-label="Навигация">
          {crumbs.map((c, i) => (
            <span key={i}>{c.to ? <Link to={c.to}>{c.label}</Link> : c.label}{i < crumbs.length - 1 && ' /'}</span>
          ))}
        </nav>
      )}
      <div className="page-head">
        <div><h1>{title}</h1>{text && <p>{text}</p>}</div>
        {actions}
      </div>
    </>
  )
}
