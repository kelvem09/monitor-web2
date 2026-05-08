import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/toast-context'
import {
  deleteOds,
  listOds,
  type Ods,
} from '../../services/ods.service'

export function OdsList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [odsList, setOdsList] = useState<Ods[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<Ods | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listOds()
      .then((data) => {
        if (!cancelled) setOdsList(data)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar a lista de ODS.')
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
    if (!q) return odsList
    return odsList.filter(
      (o) =>
        o.temaOds.toLowerCase().includes(q) ||
        String(o.numeroOds).includes(q),
    )
  }, [odsList, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const alvo = toDelete
    try {
      await deleteOds(alvo.id)
      setOdsList((prev) => prev.filter((o) => o.id !== alvo.id))
      setToDelete(null)
      toast.success(`ODS ${alvo.numeroOds} excluído com sucesso.`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error(
          `Não foi possível excluir ODS ${alvo.numeroOds}: existem indicadores vinculados.`,
        )
      } else if (isAxiosError(err) && err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        toast.error('Apenas administradores podem excluir ODS.')
      } else {
        toast.error(`Não foi possível excluir ODS ${alvo.numeroOds}.`)
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
          <h1 className="h-display admin-page__title">
            Objetivos de Desenvolvimento Sustentável
          </h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar ODS…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/ods/novo')}
          >
            + Novo ODS
          </button>
        </div>
      </header>

      <div className="admin-page__body">
        <div className="admin-page__toolbar">
          <span className="chip chip-active">
            Todos · {String(odsList.length).padStart(2, '0')}
          </span>
          {query && (
            <span className="chip">{filtered.length} resultado(s)</span>
          )}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="admin-page__loading">Carregando ODS…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-page__empty">
              {odsList.length === 0
                ? 'Nenhum ODS cadastrado. Comece criando o primeiro.'
                : 'Nenhum ODS encontrado para a busca.'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Nº ODS</th>
                  <th>Tema</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ods) => (
                  <tr key={ods.id}>
                    <td>
                      <span className="num" style={{ fontSize: 12 }}>
                        {String(ods.numeroOds).padStart(2, '0')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{ods.temaOds}</td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/admin/ods/${ods.id}/editar`}
                          className="btn btn-sm"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setToDelete(ods)}
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
        title="Excluir ODS"
        description={
          toDelete && (
            <>
              Tem certeza que deseja excluir{' '}
              <strong>ODS {toDelete.numeroOds} – {toDelete.temaOds}</strong>?
              Indicadores vinculados a este ODS impedirão a exclusão.
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
