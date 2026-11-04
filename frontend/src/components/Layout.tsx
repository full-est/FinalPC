import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import '../styles/layout.css'

const NAV = [
  { to: '/catalog', label: 'Комплектующие' },
  { to: '/builds', label: 'Готовые ПК' },
  { to: '/configurator', label: 'Конфигуратор' },
]

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="FinalPC — на главную">
      <span className="logo-mark">F</span>
      <span>Final<span className="gradient-text">PC</span></span>
    </Link>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="header-actions" />
        <button className="btn btn-ghost btn-icon burger" aria-label="Меню" onClick={() => setOpen(o => !o)}>
          <Icon name={open ? 'x' : 'menu'} />
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo />
          <p className="muted footer-text">Игровые и рабочие компьютеры под ключ. Собираем, тестируем и привозим.</p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Магазин</h4>
            <Link to="/catalog">Комплектующие</Link>
            <Link to="/builds">Готовые ПК</Link>
            <Link to="/configurator">Конфигуратор</Link>
          </div>
          <div>
            <h4>Гарантии</h4>
            <span>Тест 24 часа</span>
            <span>Гарантия на сборку</span>
            <span>Доставка по России</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom muted">© {new Date().getFullYear()} FinalPC · Учебный проект</div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}
