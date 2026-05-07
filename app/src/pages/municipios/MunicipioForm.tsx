import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { useToast } from '../../components/toast-context'
import {
  createMunicipio,
  getMunicipio,
  updateMunicipio,
  type MunicipioPayload,
} from '../../services/municipios.service'
import { listEstados, type Estado } from '../../services/estados.service'
import './MunicipioForm.css'

interface MunicipioFormProps {
  mode: 'create' | 'edit'
}

export function MunicipioForm({ mode }: MunicipioFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [estados, setEstados] = useState<Estado[]>([])
  const [estadoId, setEstadoId] = useState<number | ''>('')
  const [codigoIbge, setCodigoIbge] = useState('')
  const [nome, setNome] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tasks: Promise<unknown>[] = [listEstados()]
    if (mode === 'edit' && id !== null) tasks.push(getMunicipio(id))

    Promise.all(tasks)
      .then((results) => {
        if (cancelled) return
        const estadosData = results[0] as Estado[]
        setEstados(estadosData)
        if (mode === 'edit' && id !== null) {
          const m = results[1] as Awaited<ReturnType<typeof getMunicipio>>
          setNome(m.nome)
          setCodigoIbge(String(m.codigoIbge))
          setEstadoId(m.estado?.id ?? '')
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('Município não encontrado.')
          navigate('/admin/municipios', { replace: true })
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

  const selectedEstado = estados.find((e) => e.id === estadoId) ?? null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (estadoId === '' || !selectedEstado) {
      toast.error('Selecione o estado ao qual o município pertence.')
      return
    }

    const codigoNum = Number(codigoIbge)
    if (!Number.isInteger(codigoNum) || codigoNum <= 0) {
      toast.error('Código IBGE deve ser um número inteiro positivo.')
      return
    }
    if (nome.trim().length < 2) {
      toast.error('Informe um nome válido para o município.')
      return
    }

    const payload: MunicipioPayload = {
      codigoIbge: codigoNum,
      nome: nome.trim(),
      estadoId: selectedEstado.id,
    }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        await updateMunicipio(id, payload)
        toast.success(`Município ${payload.nome} atualizado com sucesso.`)
      } else {
        await createMunicipio(payload)
        toast.success(`Município ${payload.nome} criado com sucesso.`)
      }
      navigate('/admin/municipios', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          toast.error('Já existe um município com esse código IBGE.')
        } else if (status === 400) {
          toast.error('Dados inválidos. Revise os campos e tente novamente.')
        } else if (status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (status === 404) {
          toast.error('Município ou estado não encontrado.')
        } else {
          toast.error('Não foi possível salvar o município. Tente novamente.')
        }
      } else {
        toast.error('Não foi possível salvar o município. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar município' : 'Novo município'

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/municipios">Municípios</Link>
            <span>›</span>
            <strong>{mode === 'edit' ? 'Editar' : 'Novo'}</strong>
          </div>
          <h1 className="h-display admin-page__title">{title}</h1>
        </div>
      </header>

      <div className="admin-page__body">
        {loading ? (
          <div className="admin-page__loading">Carregando…</div>
        ) : estados.length === 0 ? (
          <div className="admin-page__alert admin-page__alert--info">
            Nenhum estado cadastrado.{' '}
            <Link to="/admin/estados/novo">Cadastre um estado</Link> antes de
            criar um município.
          </div>
        ) : (
          <div className="municipio-form__layout">
            <form
              className="card municipio-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <section className="municipio-form__section">
                <span className="h-eyebrow">1 · Estado</span>
                <p className="municipio-form__hint">
                  Todo município pertence obrigatoriamente a um estado.
                </p>
                <div className="municipio-form__grid">
                  <label className="municipio-form__label" htmlFor="estado">
                    Estado
                  </label>
                  <select
                    id="estado"
                    className="input"
                    value={estadoId === '' ? '' : String(estadoId)}
                    onChange={(e) =>
                      setEstadoId(
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    required
                  >
                    <option value="">Selecione um estado…</option>
                    {estados.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.uf} — {est.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="municipio-form__section">
                <span className="h-eyebrow">2 · Identificação</span>
                <div className="municipio-form__grid">
                  <label className="municipio-form__label" htmlFor="codigo">
                    Código IBGE
                  </label>
                  <input
                    id="codigo"
                    className="input"
                    inputMode="numeric"
                    style={{
                      maxWidth: 220,
                      fontFamily: 'var(--font-mono)',
                    }}
                    value={codigoIbge}
                    onChange={(e) =>
                      setCodigoIbge(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="2408102"
                    required
                  />

                  <label className="municipio-form__label" htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    className="input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Natal"
                    required
                  />
                </div>
              </section>

              <footer className="municipio-form__footer">
                <Link to="/admin/municipios" className="btn">
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
                      : 'Criar município →'}
                </button>
              </footer>
            </form>

            <aside className="municipio-form__aside">
              <span className="h-eyebrow">Pré-visualização</span>
              <div className="card municipio-form__preview">
                <div className="municipio-form__preview-uf">
                  {selectedEstado ? (
                    <span className="chip chip-accent">{selectedEstado.uf}</span>
                  ) : (
                    <span className="chip">UF</span>
                  )}
                </div>
                <h3 className="h-display municipio-form__preview-name">
                  {nome.trim() || 'Nome do município'}
                </h3>
                <div className="municipio-form__preview-meta">
                  <span className="num">
                    IBGE {codigoIbge || '—'}
                  </span>
                  <span>•</span>
                  <span>{selectedEstado?.nome ?? 'Estado não selecionado'}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
