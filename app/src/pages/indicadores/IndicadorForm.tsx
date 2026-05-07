import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { StatusBadge, type StatusKind } from '../../components/StatusBadge'
import { useToast } from '../../components/toast-context'
import {
  createIndicador,
  DIRECAO_LABEL,
  getIndicador,
  updateIndicador,
  type DirecaoInterpretativa,
  type IndicadorPayload,
} from '../../services/indicadores.service'
import {
  indicadorJaFoiCalculado,
  processarIndicador,
} from '../../services/indicadores-calculados.service'
import { listTemas, type Tema } from '../../services/temas.service'
import './IndicadorForm.css'

interface IndicadorFormProps {
  mode: 'create' | 'edit'
}

type StatusOption = 'ATIVO' | 'INATIVO' | 'RASCUNHO'

const STATUS_OPTIONS: ReadonlyArray<StatusOption> = [
  'ATIVO',
  'RASCUNHO',
  'INATIVO',
]

function statusVisual(status: string): { label: string; kind: StatusKind } {
  if (status === 'ATIVO') return { label: 'Ativo', kind: 'success' }
  if (status === 'RASCUNHO') return { label: 'Rascunho', kind: 'warning' }
  if (status === 'INATIVO') return { label: 'Inativo', kind: 'neutral' }
  return { label: status || '—', kind: 'neutral' }
}

export function IndicadorForm({ mode }: IndicadorFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [temas, setTemas] = useState<Tema[]>([])
  const [temaId, setTemaId] = useState<number | ''>('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fonte, setFonte] = useState('')
  const [previstoOds, setPrevistoOds] = useState(false)
  const [numeroOds, setNumeroOds] = useState('')
  const [metaOds, setMetaOds] = useState('')
  const [direcao, setDirecao] = useState<DirecaoInterpretativa | ''>('')
  const [status, setStatus] = useState<StatusOption>('ATIVO')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [calculado, setCalculado] = useState(false)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tasks: Promise<unknown>[] = [listTemas()]
    if (mode === 'edit' && id !== null) {
      tasks.push(getIndicador(id))
      tasks.push(indicadorJaFoiCalculado(id).catch(() => false))
    }

    Promise.all(tasks)
      .then((results) => {
        if (cancelled) return
        const temasData = results[0] as Tema[]
        setTemas(temasData)
        if (mode === 'edit' && id !== null) {
          const ind = results[1] as Awaited<ReturnType<typeof getIndicador>>
          const jaCalculado = results[2] as boolean
          setCalculado(jaCalculado)
          setNome(ind.nome)
          setDescricao(ind.descricao ?? '')
          setFonte(ind.fonte ?? '')
          setPrevistoOds(ind.previstoOds)
          setNumeroOds(ind.numeroOds != null ? String(ind.numeroOds) : '')
          setMetaOds(ind.metaOds ?? '')
          setDirecao((ind.direcaoInterpretativa as DirecaoInterpretativa) ?? '')
          setTemaId(ind.tema?.id ?? '')
          const upper = (ind.status ?? 'ATIVO').toUpperCase()
          setStatus(
            upper === 'INATIVO' || upper === 'RASCUNHO' || upper === 'ATIVO'
              ? (upper as StatusOption)
              : 'ATIVO',
          )
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('Indicador não encontrado.')
          navigate('/admin/indicadores', { replace: true })
        } else {
          toast.error('Não foi possível carregar os dados do formulário.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode, id, toast, navigate])

  const selectedTema = useMemo(
    () => temas.find((t) => t.id === temaId) ?? null,
    [temas, temaId],
  )

  async function handleProcessar() {
    if (mode !== 'edit' || id === null) return
    setProcessando(true)
    try {
      await processarIndicador(id)
      setCalculado(true)
      toast.success('Indicador processado com sucesso.')
    } catch (err) {
      if (isAxiosError(err)) {
        const httpStatus = err.response?.status
        if (httpStatus === 400) {
          toast.error('Este indicador ainda não possui rotina de processamento.')
        } else if (httpStatus === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (httpStatus === 403) {
          toast.error('Apenas administradores podem processar indicadores.')
        } else if (httpStatus === 404) {
          toast.error('Indicador não encontrado.')
        } else {
          toast.error('Não foi possível processar o indicador.')
        }
      } else {
        toast.error('Não foi possível processar o indicador.')
      }
    } finally {
      setProcessando(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (temaId === '' || !selectedTema) {
      toast.error('Selecione o tema do indicador.')
      return
    }
    if (nome.trim().length < 2) {
      toast.error('Informe um nome válido para o indicador.')
      return
    }

    let numeroOdsNum: number | undefined
    if (previstoOds && numeroOds.trim() !== '') {
      const n = Number(numeroOds)
      if (!Number.isInteger(n) || n < 1 || n > 17) {
        toast.error('Número do ODS deve ser um inteiro entre 1 e 17.')
        return
      }
      numeroOdsNum = n
    }

    const payload: IndicadorPayload = {
      previstoOds,
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      temaId: selectedTema.id,
      fonte: fonte.trim() || null,
      direcaoInterpretativa: direcao === '' ? null : direcao,
      metaOds: previstoOds ? metaOds.trim() || null : null,
      numeroOds: previstoOds ? numeroOdsNum ?? null : null,
      status,
    }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        await updateIndicador(id, payload)
        toast.success(`Indicador "${payload.nome}" atualizado com sucesso.`)
      } else {
        await createIndicador(payload)
        toast.success(`Indicador "${payload.nome}" criado com sucesso.`)
      }
      navigate('/admin/indicadores', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const httpStatus = err.response?.status
        if (httpStatus === 400) {
          toast.error('Dados inválidos. Revise os campos e tente novamente.')
        } else if (httpStatus === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (httpStatus === 403) {
          toast.error('Apenas administradores podem gerenciar indicadores.')
        } else if (httpStatus === 404) {
          toast.error('Indicador ou tema não encontrado.')
        } else {
          toast.error('Não foi possível salvar o indicador. Tente novamente.')
        }
      } else {
        toast.error('Não foi possível salvar o indicador. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar indicador' : 'Novo indicador'
  const sv = statusVisual(status)

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/indicadores">Indicadores</Link>
            <span>›</span>
            <strong>{mode === 'edit' ? 'Editar' : 'Novo'}</strong>
          </div>
          <h1 className="h-display admin-page__title">{title}</h1>
        </div>
        {mode === 'edit' && id !== null && !loading && (
          <div className="admin-page__actions">
            <StatusBadge
              label={calculado ? 'Calculado' : 'Não calculado'}
              kind={calculado ? 'success' : 'neutral'}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleProcessar}
              disabled={processando}
            >
              {processando ? 'Processando…' : 'Processar'}
            </button>
          </div>
        )}
      </header>

      <div className="admin-page__body">
        {loading ? (
          <div className="admin-page__loading">Carregando…</div>
        ) : temas.length === 0 ? (
          <div className="admin-page__alert admin-page__alert--info">
            Nenhum tema cadastrado.{' '}
            <Link to="/admin/temas/novo">Cadastre um tema</Link> antes de criar
            indicadores.
          </div>
        ) : (
          <div className="indicador-form__layout">
            <form
              className="card indicador-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <section className="indicador-form__section">
                <span className="h-eyebrow">1 · Identificação</span>
                <div className="indicador-form__grid">
                  <label className="indicador-form__label" htmlFor="tema">
                    Tema
                  </label>
                  <select
                    id="tema"
                    className="input"
                    value={temaId === '' ? '' : String(temaId)}
                    onChange={(e) =>
                      setTemaId(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    required
                  >
                    <option value="">Selecione um tema…</option>
                    {temas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>

                  <label className="indicador-form__label" htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    className="input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Taxa de mortalidade infantil"
                    required
                  />

                  <label
                    className="indicador-form__label"
                    htmlFor="descricao"
                    style={{ alignSelf: 'flex-start', paddingTop: 10 }}
                  >
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    className="input"
                    rows={3}
                    style={{ height: 'auto' }}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Resumo do indicador, fórmula simplificada, observações…"
                  />

                  <label className="indicador-form__label" htmlFor="fonte">
                    Fonte
                  </label>
                  <input
                    id="fonte"
                    className="input"
                    value={fonte}
                    onChange={(e) => setFonte(e.target.value)}
                    placeholder="SINASC / SIM / IBGE…"
                  />
                </div>
              </section>

              <section className="indicador-form__section">
                <span className="h-eyebrow">2 · Interpretação</span>
                <div className="indicador-form__grid">
                  <label className="indicador-form__label" htmlFor="direcao">
                    Direção
                  </label>
                  <select
                    id="direcao"
                    className="input"
                    value={direcao}
                    onChange={(e) =>
                      setDirecao(e.target.value as DirecaoInterpretativa | '')
                    }
                  >
                    <option value="">Não especificada</option>
                    <option value="maior_melhor">
                      {DIRECAO_LABEL.maior_melhor}
                    </option>
                    <option value="menor_melhor">
                      {DIRECAO_LABEL.menor_melhor}
                    </option>
                  </select>

                  <label className="indicador-form__label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusOption)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusVisual(s).label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="indicador-form__section">
                <span className="h-eyebrow">3 · Objetivos de Desenvolvimento Sustentável</span>
                <label className="indicador-form__check">
                  <input
                    type="checkbox"
                    checked={previstoOds}
                    onChange={(e) => setPrevistoOds(e.target.checked)}
                  />
                  <span>
                    <strong>Previsto nos ODS</strong>
                    <span className="indicador-form__check-hint">
                      Indica se o indicador está vinculado aos Objetivos de
                      Desenvolvimento Sustentável da ONU.
                    </span>
                  </span>
                </label>

                {previstoOds && (
                  <div className="indicador-form__grid">
                    <label
                      className="indicador-form__label"
                      htmlFor="numero-ods"
                    >
                      Nº ODS
                    </label>
                    <input
                      id="numero-ods"
                      className="input"
                      inputMode="numeric"
                      style={{ maxWidth: 120, fontFamily: 'var(--font-mono)' }}
                      value={numeroOds}
                      onChange={(e) =>
                        setNumeroOds(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="3"
                    />

                    <label
                      className="indicador-form__label"
                      htmlFor="meta-ods"
                    >
                      Meta ODS
                    </label>
                    <input
                      id="meta-ods"
                      className="input"
                      value={metaOds}
                      onChange={(e) => setMetaOds(e.target.value)}
                      placeholder="3.2 — Reduzir mortalidade neonatal"
                    />
                  </div>
                )}
              </section>

              <footer className="indicador-form__footer">
                <Link to="/admin/indicadores" className="btn">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Salvando…'
                    : mode === 'edit'
                      ? 'Salvar alterações'
                      : 'Criar indicador →'}
                </button>
              </footer>
            </form>

            <aside className="indicador-form__aside">
              <span className="h-eyebrow">Pré-visualização</span>
              <div className="card indicador-form__preview">
                <div className="indicador-form__preview-head">
                  {selectedTema ? (
                    <span className="chip chip-accent">
                      {selectedTema.nome}
                    </span>
                  ) : (
                    <span className="chip">Tema</span>
                  )}
                  <StatusBadge label={sv.label} kind={sv.kind} />
                </div>
                <h3 className="h-display indicador-form__preview-name">
                  {nome.trim() || 'Nome do indicador'}
                </h3>
                {descricao.trim() && (
                  <p className="indicador-form__preview-desc">
                    {descricao.trim()}
                  </p>
                )}
                <div className="indicador-form__preview-meta">
                  <span>{fonte.trim() || 'Fonte não informada'}</span>
                  {direcao && (
                    <>
                      <span>•</span>
                      <span>{DIRECAO_LABEL[direcao]}</span>
                    </>
                  )}
                  {previstoOds && (
                    <>
                      <span>•</span>
                      <span className="num">
                        ODS {numeroOds || '—'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
