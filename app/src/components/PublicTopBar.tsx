import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import './PublicTopBar.css'

interface NavItem {
  key: string
  label: string
  to: string
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: 'home', label: 'Início', to: '/inicio' },
  { key: 'mapa', label: 'Mapa', to: '/' },
  { key: 'ranking', label: 'Ranking', to: '/ranking' },
  { key: 'sobre', label: 'Sobre os dados', to: '/sobre' },
]

interface PublicTopBarProps {
  active: NavItem['key']
}

export function PublicTopBar({ active }: PublicTopBarProps) {
  const location = useLocation()

  return (
    <header className="public-topbar">
      <Link to="/" className="public-topbar__brand" aria-label="IndicaRN — Início">
        <Logo />
      </Link>
      <span className="public-topbar__sep" aria-hidden="true" />
      <span className="h-eyebrow public-topbar__tag">Portal Público</span>
      <nav className="public-topbar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`public-topbar__link${isActive ? ' public-topbar__link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
        <Link
          to="/login"
          state={{ from: location }}
          className="public-topbar__link public-topbar__link--cta"
        >
          Acessar
        </Link>
      </nav>
    </header>
  )
}
