import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { useToast } from '../../components/toast-context'
import {
  createOds,
  getOds,
  updateOds,
  type OdsPayload,
} from '../../services/ods.service'
import './OdsForm.css'

interface OdsFormProps {
  mode: 'create' | 'edit'
}

export function OdsForm({ mode }: OdsFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [numeroOds, setNumeroOds] = useState('')
  const [temaOds, setTemaOds] = useState('')
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode !== 'edit' || id === null) return
    let cancelled = false
    getOds(id)
      .then((ods) => {
        if (cancelled) return
        setNumeroOds(String(ods.numeroOds))
        setTemaOds(ods.temaOds)
      })
      .catch((err) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('ODS não encontrado.')
          navigate('/admin/ods', { replace: true })
        } else {
          toast.error('Não foi possível carregar o ODS.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id, toast, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const num = Number(numeroOds)
    if (!Number.isInteger(num) || num < 1 || num > 17) {
      toast.error('O número do ODS deve ser um inteiro entre 1 e 17.')
      return
    }

    if (temaOds.trim().length < 2) {
      toast.error('Informe um tema válido para o ODS.')
      return
    }

    const payload: OdsPayload = { numeroOds: num, temaOds: temaOds.trim() }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        await updateOds(id, payload)
        toast.success(`ODS ${payload.numeroOds} atualizado com sucesso.`)
      } else {
        await createOds(payload)
        toast.success(`ODS ${payload.numeroOds} criado com sucesso.`)
      }
      navigate('/admin/ods', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          toast.error('Já existe um ODS com esse número.')
        } else if (status === 400) {
          toast.error('Dados inválidos. Revise os campos e tente novamente.')
        } else if (status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (status === 403) {
          toast.error('Apenas administradores podem gerenciar ODS.')
        } else if (status === 404) {
          toast.error('ODS não encontrado.')
        } else {
          toast.error('Não foi possível salvar o ODS. Tente novamente.')
        }
      } else {
        toast.error('Não foi possível salvar o ODS. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar ODS' : 'Novo ODS'

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/ods">ODS</Link>
            <span>›</span>
            <strong>{mode === 'edit' ? 'Editar' : 'Novo'}</strong>
          </div>
          <h1 className="h-display admin-page__title">{title}</h1>
        </div>
      </header>

      <div className="admin-page__body">
        {loading ? (
          <div className="admin-page__loading">Carregando…</div>
        ) : (
          <form className="card ods-form" onSubmit={handleSubmit} noValidate>
            <section className="ods-form__section">
              <span className="h-eyebrow">1 · Identificação</span>
              <p className="ods-form__hint">
                Os ODS são os 17 Objetivos de Desenvolvimento Sustentável da
                Agenda 2030 da ONU. O número deve ser único e estar entre 1 e 17.
              </p>
              <div className="ods-form__grid">
                <label className="ods-form__label" htmlFor="numeroOds">
                  Número do ODS
                </label>
                <input
                  id="numeroOds"
                  className="input"
                  type="number"
                  min={1}
                  max={17}
                  value={numeroOds}
                  onChange={(e) => setNumeroOds(e.target.value)}
                  placeholder="3"
                  required
                />

                <label className="ods-form__label" htmlFor="temaOds">
                  Tema
                </label>
                <input
                  id="temaOds"
                  className="input"
                  value={temaOds}
                  onChange={(e) => setTemaOds(e.target.value)}
                  placeholder="Saúde e bem-estar"
                  required
                />
              </div>
            </section>

            <footer className="ods-form__footer">
              <Link to="/admin/ods" className="btn">
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
                    : 'Criar ODS →'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </AdminShell>
  )
}
