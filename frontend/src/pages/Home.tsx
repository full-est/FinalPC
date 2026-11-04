import { Link } from 'react-router-dom'
import { api } from '../api'
import { Icon, type IconName } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { useFetch } from '../hooks/useFetch'
import '../styles/home.css'

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'wrench', title: 'Сборка под ключ', text: 'Соберём, настроим и протестируем компьютер перед отправкой.' },
  { icon: 'shield', title: 'Проверка совместимости', text: 'Конфигуратор не даст выбрать несовместимые комплектующие.' },
  { icon: 'bolt', title: 'Тест 24 часа', text: 'Каждая сборка проходит стресс-тесты под нагрузкой.' },
  { icon: 'truck', title: 'Доставка по России', text: 'Бережно упакуем и привезём домой или в пункт выдачи.' },
]

export default function Home() {
  const cats = useFetch(() => api.categories(), [])

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="badge badge-accent"><Icon name="bolt" size={14} /> Компьютеры под ключ</span>
            <h1>Соберите ПК мечты — <span className="gradient-text">мы сделаем остальное</span></h1>
            <p className="muted hero-lead">
              Выберите готовую сборку или создайте свою в конфигураторе с проверкой совместимости и мгновенным расчётом цены.
            </p>
            <div className="row hero-cta">
              <Link to="/configurator" className="btn btn-primary btn-lg"><Icon name="wrench" size={18} /> Собрать свой ПК</Link>
              <Link to="/builds" className="btn btn-lg">Готовые сборки</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-ring" />
            <div className="hero-chip"><Icon name="cpu" size={110} strokeWidth={1.1} /></div>
            <span className="float-tag t1"><Icon name="gpu" size={16} /> RTX 4080 SUPER</span>
            <span className="float-tag t2"><Icon name="cpu" size={16} /> Ryzen 9 7950X</span>
            <span className="float-tag t3"><Icon name="bolt" size={16} /> DDR5 6400</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Категории</h2>
          <Link to="/catalog" className="btn btn-ghost">Весь каталог <Icon name="arrowRight" size={16} /></Link>
        </div>
        <div className="cat-grid">
          {cats.data?.map(c => (
            <Link key={c.id} to={`/catalog?category=${c.slug}`} className="card card-hover cat-card">
              <ProductImage category={c.slug} size="sm" label={c.name} />
              <span>{c.name}</span>
              <Icon name="chevron" size={16} />
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="feature-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="card feature">
              <div className="feature-icon"><Icon name={f.icon} size={22} /></div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
