import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge, type StatusKind } from '../../components/StatusBadge'
import { useToast } from '../../components/toast-context'
import {
  deleteIndicador,
  listIndicadoresAdmin,
  type Indicador,
} from '../../services/indicadores.service'
import { listTemas, type Tema } from '../../services/temas.service'

function statusVisual(status: string): { label: string; kind: StatusKind } {
  const upper = status?.toUpperCase()
  if (upper === 'ATIVO') return { label: 'Ativo', kind: 'success' }
  if (upper === 'RASCUNHO') return { label: 'Rascunho', kind: 'warning' }
  if (upper === 'INATIVO') return { label: 'Inativo', kind: 'neutral' }
  return { label: status || '—', kind: 'neutral' }
}

export function IndicadoresList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [temas, setTemas] = useState<Tema[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [temaFilter, setTemaFilter] = useState<'all' | number>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all')
  const [toDelete, setToDelete] = useState<Indicador | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([listIndicadoresAdmin(), listTemas()])
      .then(([inds, ts]) => {
        if (cancelled) return
        setIndicadores(inds)
        setTemas(ts)
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível carregar a lista de indicadores.')
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
    return indicadores.filter((ind) => {
      if (temaFilter !== 'all' && ind.tema?.id !== temaFilter) return false
      if (statusFilter !== 'all' && ind.status?.toUpperCase() !== statusFilter) return false
      if (!q) return true
      return (
        ind.nome.toLowerCase().includes(q) ||
        (ind.descricao ?? '').toLowerCase().includes(q) ||
        (ind.fonte ?? '').toLowerCase().includes(q)
      )
    })
  }, [indicadores, temaFilter, statusFilter, query])

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    const alvo = toDelete
    try {
      await deleteIndicador(alvo.id)
      setIndicadores((prev) => prev.filter((i) => i.id !== alvo.id))
      setToDelete(null)
      toast.success(`Indicador "${alvo.nome}" inativado com sucesso.`)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        toast.error('Apenas administradores podem inativar indicadores.')
      } else {
        toast.error(`Não foi possível inativar "${alvo.nome}".`)
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
          <h1 className="h-display admin-page__title">Indicadores</h1>
        </div>
        <div className="admin-page__actions">
          <input
            className="input"
            style={{ width: 240, height: 36 }}
            placeholder="Buscar por nome ou fonte…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/indicadores/novo')}
            disabled={temas.length === 0 && !loading}
            title={
              temas.length === 0 && !loading
                ? 'Cadastre ao menos um tema antes de criar um indicador.'
                : undefined
            }
          >
            + Novo indicador
          </button>
        </div>
      </header>

      <div className="admin-page__body">
        <div className="admin-page__toolbar">
          <span className="chip chip-active">
            Todos · {String(indicadores.length).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>
            Filtrar por tema:
          </span>
          <select
            className="input"
            style={{ height: 32, width: 220 }}
            value={temaFilter === 'all' ? '' : String(temaFilter)}
            onChange={(e) =>
              setTemaFilter(
                e.target.value === '' ? 'all' : Number(e.target.value),
              )
            }
          >
            <option value="">Todos os temas</option>
            {temas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>
            Status:
          </span>
          <select
            className="input"
            style={{ height: 32, width: 160 }}
            value={statusFilter === 'all' ? '' : statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value === '' ? 'all' : e.target.value)
            }
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="INATIVO">Inativo</option>
          </select>
          {(query || temaFilter !== 'all' || statusFilter !== 'all') && (
            <span className="chip">{filtered.length} resultado(s)</span>
          )}
        </div>

        {!loading && temas.length === 0 && (
          <div className="admin-page__alert admin-page__alert--info">
            Nenhum tema cadastrado.{' '}
            <Link to="/admin/temas/novo">Cadastre um tema</Link> antes de criar
            indicadores.
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="admin-page__loading">Carregando indicadores…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-page__empty">
              {indicadores.length === 0
                ? 'Nenhum indicador cadastrado.'
                : 'Nenhum indicador encontrado para os filtros aplicados.'}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th style={{ width: 200 }}>Tema</th>
                  <th style={{ width: 130 }}>Fonte</th>
                  <th style={{ width: 90 }}>ODS</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 180, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ind) => {
                  const sv = statusVisual(ind.status)
                  return (
                    <tr key={ind.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ind.nome}</div>
                        {ind.descricao && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--ink-3)',
                              marginTop: 2,
                              maxWidth: 520,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ind.descricao}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{ind.tema?.nome ?? '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {ind.fonte ?? '—'}
                      </td>
                      <td>
                        {ind.previstoOds ? (
                          <span className="chip chip-accent">
                            {ind.numeroOds ? `ODS ${ind.numeroOds}` : 'ODS'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge label={sv.label} kind={sv.kind} />
                      </td>
                      <td>
                        <div className="actions-cell">
                          <Link
                            to={`/admin/indicadores/${ind.id}/editar`}
                            className="btn btn-sm"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => setToDelete(ind)}
                          >
                            Inativar
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

      <ConfirmDialog
        open={toDelete !== null}
        title="Inativar indicador"
        description={
          toDelete && (
            <>
              Tem certeza que deseja inativar{' '}
              <strong>{toDelete.nome}</strong>? Ele deixará de aparecer no
              portal público, mas o histórico será preservado.
            </>
          )
        }
        confirmLabel="Inativar"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AdminShell>
  )
}
