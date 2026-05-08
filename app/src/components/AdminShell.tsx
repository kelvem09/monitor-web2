import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { clearToken, clearUser } from '../lib/auth'
import './AdminShell.css'

interface AdminShellProps {
  children: ReactNode
}

const NAV_ITEMS: ReadonlyArray<{ to: string; label: string; glyph: string }> = [
  { to: '/admin/indicadores', label: 'Indicadores', glyph: '◇' },
  { to: '/admin/temas', label: 'Temas', glyph: '◈' },
  { to: '/admin/estados', label: 'Estados', glyph: '◰' },
  { to: '/admin/municipios', label: 'Municípios', glyph: '◳' },
  { to: '/admin/usuarios', label: 'Usuários', glyph: '◔' },
]

export function AdminShell({ children }: AdminShellProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    clearUser()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <Logo />
        </div>

        <span className="h-eyebrow admin-shell__section">Cadastros</span>
        <nav className="admin-shell__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-shell__nav-item${isActive ? ' admin-shell__nav-item--active' : ''}`
              }
            >
              <span className="admin-shell__nav-glyph" aria-hidden="true">
                {item.glyph}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="admin-shell__public-link">
          <span className="admin-shell__nav-glyph" aria-hidden="true">↗</span>
          Área Pública
        </Link>

        <div className="admin-shell__user">
          <div className="admin-shell__avatar">LV</div>
          <div className="admin-shell__user-info">
            <span className="admin-shell__user-name">Lucas Vieira</span>
            <span className="admin-shell__user-role">Administrador</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm admin-shell__logout"
            onClick={handleLogout}
            aria-label="Sair"
            title="Sair"
          >
            ↗
          </button>
        </div>
      </aside>

      <main className="admin-shell__main">{children}</main>
    </div>
  )
}
