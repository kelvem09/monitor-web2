import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../components/toast-context'
import {
  deleteUser,
  listUsers,
  USER_ROLE_DESCRIPTION,
  USER_ROLE_LABEL,
  type User,
  type UserRole,
} from '../../services/users.service'
import './UsuariosList.css'

type RoleFilter = 'all' | UserRole

export function UsuariosList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [toDelete, setToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar a lista de usuários.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [toast])

  const counts = useMemo(() => {
    return {
      total: users.length,
      ADMIN: users.filter((u) => u.role === 'ADMIN').length,
      GESTOR_PUBLICO: users.filter((u) => u.role === 'GESTOR_PUBLICO').length,
    }
  }, [users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [users, query, roleFilter])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const alvo = toDelete
    try {
      const updated = await deleteUser(alvo.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === alvo.id ? { ...u, ...updated } : u)),
      )
      setToDelete(null)
      toast.success(`Usuário ${alvo.name} desativado com sucesso.`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        toast.error('Apenas administradores podem desativar usuários.')
      } else {
        toast.error(`Não foi possível desativar ${alvo.name}.`)
      }
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  function avatarInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('')
  }

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <span className="h-eyebrow">Cadastros · perfis</span>
          <h1 className="h-display admin-page__title">Usuários</h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar por nome ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/usuarios/novo')}
          >
            + Novo usuário
          </button>
        </div>
      </header>

      <div className="admin-page__body usuarios-page">
        <aside className="usuarios-page__roles">
          <span className="h-eyebrow">Perfis</span>
          <div className="usuarios-page__roles-list">
            <button
              type="button"
              className={`usuarios-role-card${roleFilter === 'all' ? ' usuarios-role-card--active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              <div className="usuarios-role-card__head">
                <span>Todos</span>
                <span className="num">{counts.total}</span>
              </div>
              <div className="usuarios-role-card__desc">
                Lista completa de usuários cadastrados
              </div>
            </button>

            {(['ADMIN', 'GESTOR_PUBLICO'] as const).map((role) => (
              <button
                key={role}
                type="button"
                className={`usuarios-role-card${roleFilter === role ? ' usuarios-role-card--active' : ''}`}
                onClick={() => setRoleFilter(role)}
              >
                <div className="usuarios-role-card__head">
                  <span>{USER_ROLE_LABEL[role]}</span>
                  <span className="num">{counts[role]}</span>
                </div>
                <div className="usuarios-role-card__desc">
                  {USER_ROLE_DESCRIPTION[role]}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="usuarios-page__content">
          <div className="admin-page__toolbar">
            <span className="chip chip-active">
              {roleFilter === 'all' ? 'Todos' : USER_ROLE_LABEL[roleFilter]} ·{' '}
              {String(filtered.length).padStart(2, '0')}
            </span>
            {query && (
              <span className="chip">{filtered.length} resultado(s)</span>
            )}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div className="admin-page__loading">Carregando usuários…</div>
            ) : filtered.length === 0 ? (
              <div className="admin-page__empty">
                {users.length === 0
                  ? 'Nenhum usuário cadastrado. Comece criando o primeiro.'
                  : 'Nenhum usuário encontrado para os filtros aplicados.'}
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th style={{ width: 180 }}>Perfil</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const isAdmin = user.role === 'ADMIN'
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="usuarios-page__name-cell">
                            <span
                              className={`usuarios-page__avatar usuarios-page__avatar--${isAdmin ? 'admin' : 'gestor'}`}
                              aria-hidden="true"
                            >
                              {avatarInitials(user.name)}
                            </span>
                            <span style={{ fontWeight: 500 }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                          {user.email}
                        </td>
                        <td>
                          <span
                            className={`chip${isAdmin ? ' chip-accent' : ''}`}
                          >
                            {USER_ROLE_LABEL[user.role]}
                          </span>
                        </td>
                        <td>
                          {user.isActive ? (
                            <StatusBadge label="Ativo" kind="success" />
                          ) : (
                            <StatusBadge label="Inativo" kind="neutral" />
                          )}
                        </td>
                        <td>
                          <div className="actions-cell">
                            <Link
                              to={`/admin/usuarios/${user.id}/editar`}
                              className="btn btn-sm"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setToDelete(user)}
                              disabled={!user.isActive}
                              title={
                                user.isActive
                                  ? undefined
                                  : 'Usuário já está inativo'
                              }
                            >
                              Desativar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Desativar usuário"
        description={
          toDelete && (
            <>
              Tem certeza que deseja desativar <strong>{toDelete.name}</strong>?
              O acesso ao sistema será revogado, mas o histórico será
              preservado.
            </>
          )
        }
        confirmLabel="Desativar"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AdminShell>
  )
}
