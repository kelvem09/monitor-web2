import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/toast-context'
import {
  deleteMunicipio,
  listMunicipios,
  type Municipio,
} from '../../services/municipios.service'
import { listEstados, type Estado } from '../../services/estados.service'

export function MunicipiosList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<'all' | number>('all')
  const [toDelete, setToDelete] = useState<Municipio | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([listMunicipios(), listEstados()])
      .then(([muns, ests]) => {
        if (cancelled) return
        setMunicipios(muns)
        setEstados(ests)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar a lista de municípios.')
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
    return municipios.filter((m) => {
      if (estadoFilter !== 'all' && m.estado?.id !== estadoFilter) return false
      if (!q) return true
      return (
        m.nome.toLowerCase().includes(q) ||
        String(m.codigoIbge).includes(q) ||
        m.estado?.uf?.toLowerCase().includes(q)
      )
    })
  }, [municipios, estadoFilter, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const alvo = toDelete
    try {
      await deleteMunicipio(alvo.id)
      setMunicipios((prev) => prev.filter((m) => m.id !== alvo.id))
      setToDelete(null)
      toast.success(`Município ${alvo.nome} excluído com sucesso.`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error(
          `Não foi possível excluir ${alvo.nome}: existem registros vinculados.`,
        )
      } else if (isAxiosError(err) && err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
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
          <h1 className="h-display admin-page__title">Municípios</h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar por nome, IBGE ou UF…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/municipios/novo')}
            disabled={estados.length === 0 && !loading}
            title={
              estados.length === 0 && !loading
                ? 'Cadastre ao menos um estado antes de criar um município.'
                : undefined
            }
          >
            + Novo município
          </button>
        </div>
      </header>

      <div className="admin-page__body">
        <div className="admin-page__toolbar">
          <span className="chip chip-active">
            Todos · {String(municipios.length).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>
            Filtrar por estado:
          </span>
          <select
            className="input"
            style={{ height: 32, width: 200 }}
            value={estadoFilter === 'all' ? '' : String(estadoFilter)}
            onChange={(e) =>
              setEstadoFilter(e.target.value === '' ? 'all' : Number(e.target.value))
            }
          >
            <option value="">Todos os estados</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.uf} — {e.nome}
              </option>
            ))}
          </select>
          {(query || estadoFilter !== 'all') && (
            <span className="chip">{filtered.length} resultado(s)</span>
          )}
        </div>

        {!loading && estados.length === 0 && (
          <div className="admin-page__alert admin-page__alert--info">
            Nenhum estado cadastrado.{' '}
            <Link to="/admin/estados/novo">Cadastre um estado</Link> antes de
            criar municípios.
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="admin-page__loading">Carregando municípios…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-page__empty">
              {municipios.length === 0
                ? 'Nenhum município cadastrado.'
                : 'Nenhum município encontrado para os filtros aplicados.'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>Código IBGE</th>
                  <th>Nome</th>
                  <th style={{ width: 220 }}>Estado</th>
                  <th style={{ width: 80 }}>UF</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="num" style={{ fontSize: 12 }}>
                        {m.codigoIbge}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{m.nome}</td>
                    <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      {m.estado?.nome ?? '—'}
                    </td>
                    <td>
                      {m.estado?.uf ? (
                        <span className="chip chip-accent">{m.estado.uf}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          to={`/admin/municipios/${m.id}/editar`}
                          className="btn btn-sm"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setToDelete(m)}
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
        title="Excluir município"
        description={
          toDelete && (
            <>
              Tem certeza que deseja excluir <strong>{toDelete.nome}</strong>?
              Esta ação não pode ser desfeita.
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
