import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/toast-context'
import {
  deleteTema,
  listTemas,
  type Tema,
} from '../../services/temas.service'

export function TemasList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<Tema | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listTemas()
      .then((data) => {
        if (!cancelled) setTemas(data)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar a lista de temas.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return temas
    return temas.filter((t) => t.nome.toLowerCase().includes(q))
  }, [temas, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const alvo = toDelete
    try {
      await deleteTema(alvo.id)
      setTemas((prev) => prev.filter((t) => t.id !== alvo.id))
      setToDelete(null)
      toast.success(`Tema ${alvo.nome} excluído com sucesso.`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error(
          `Não foi possível excluir ${alvo.nome}: existem indicadores vinculados.`,
        )
      } else if (isAxiosError(err) && err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        toast.error('Apenas administradores podem excluir temas.')
      } else {
        toast.error(`Não foi possível excluir ${alvo.nome}.`)
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
          <h1 className="h-display admin-page__title">Temas de indicadores</h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar tema…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/temas/novo')}
          >
            + Novo tema
          </button>
        </div>
      </header>

      <div className="admin-page__body">
        <div className="admin-page__toolbar">
          <span className="chip chip-active">
            Todos · {String(temas.length).padStart(2, '0')}
          </span>
          {query && (
            <span className="chip">{filtered.length} resultado(s)</span>
          )}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="admin-page__loading">Carregando temas…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-page__empty">
              {temas.length === 0
                ? 'Nenhum tema cadastrado. Comece criando o primeiro.'
                : 'Nenhum tema encontrado para a busca.'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Nome</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tema) => (
                  <tr key={tema.id}>
                    <td>
                      <span className="num" style={{ fontSize: 12 }}>
                        {String(tema.id).padStart(3, '0')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{tema.nome}</td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/admin/temas/${tema.id}/editar`}
                          className="btn btn-sm"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setToDelete(tema)}
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
        title="Excluir tema"
        description={
          toDelete && (
            <>
              Tem certeza que deseja excluir <strong>{toDelete.nome}</strong>?
              Indicadores vinculados a este tema impedirão a exclusão.
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
