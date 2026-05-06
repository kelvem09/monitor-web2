import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import {
  deleteEstado,
  listEstados,
  type Estado,
} from '../../services/estados.service'

export function EstadosList() {
  const navigate = useNavigate()
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<Estado | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listEstados()
      .then((data) => {
        if (!cancelled) setEstados(data)
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar a lista de estados.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return estados
    return estados.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) ||
        e.uf.toLowerCase().includes(q) ||
        String(e.codigo).includes(q),
    )
  }, [estados, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteEstado(toDelete.id)
      setEstados((prev) => prev.filter((e) => e.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError(
          `Não foi possível excluir ${toDelete.nome}: existem municípios vinculados.`,
        )
      } else {
        setError(`Não foi possível excluir ${toDelete.nome}.`)
      }
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <span className="h-eyebrow">Cadastros</span>
          <h1 className="h-display admin-page__title">Estados</h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar por nome, UF ou código…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/estados/novo')}
          >
            + Novo estado
          </button>
        </div>
      </header>

      <div className="admin-page__body">
        <div className="admin-page__toolbar">
          <span className="chip chip-active">
            Todos · {String(estados.length).padStart(2, '0')}
          </span>
          {query && (
            <span className="chip">{filtered.length} resultado(s)</span>
          )}
        </div>

        {error && (
          <div className="admin-page__alert admin-page__alert--error">{error}</div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="admin-page__loading">Carregando estados…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-page__empty">
              {estados.length === 0
                ? 'Nenhum estado cadastrado. Comece criando o primeiro.'
                : 'Nenhum estado encontrado para a busca.'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Código IBGE</th>
                  <th>Nome</th>
                  <th style={{ width: 80 }}>UF</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((estado) => (
                  <tr key={estado.id}>
                    <td>
                      <span className="num" style={{ fontSize: 12 }}>
                        {estado.codigo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{estado.nome}</td>
                    <td>
                      <span className="chip chip-accent">{estado.uf}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/admin/estados/${estado.id}/editar`}
                          className="btn btn-sm"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setToDelete(estado)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir estado"
        description={
          toDelete && (
            <>
              Tem certeza que deseja excluir <strong>{toDelete.nome}</strong>{' '}
              ({toDelete.uf})? Esta ação não pode ser desfeita.
            </>
          )
        }
        confirmLabel="Excluir"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AdminShell>
  )
}
