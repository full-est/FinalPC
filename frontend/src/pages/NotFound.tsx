import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState icon="search" title="Страница не найдена" text="Возможно, ссылка устарела или адрес введён с ошибкой."
        action={<Link to="/" className="btn btn-primary">На главную</Link>} />
    </div>
  )
}
