import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { useToast } from '../../components/toast-context'
import {
  createTema,
  getTema,
  updateTema,
  type TemaPayload,
} from '../../services/temas.service'
import './TemaForm.css'

interface TemaFormProps {
  mode: 'create' | 'edit'
}

export function TemaForm({ mode }: TemaFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode !== 'edit' || id === null) return
    let cancelled = false
    getTema(id)
      .then((tema) => {
        if (cancelled) return
        setNome(tema.nome)
      })
      .catch((err) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('Tema não encontrado.')
          navigate('/admin/temas', { replace: true })
        } else {
          toast.error('Não foi possível carregar o tema.')
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

    if (nome.trim().length < 2) {
      toast.error('Informe um nome válido para o tema.')
      return
    }

    const payload: TemaPayload = { nome: nome.trim() }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        await updateTema(id, payload)
        toast.success(`Tema ${payload.nome} atualizado com sucesso.`)
      } else {
        await createTema(payload)
        toast.success(`Tema ${payload.nome} criado com sucesso.`)
      }
      navigate('/admin/temas', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          toast.error('Já existe um tema com esse nome.')
        } else if (status === 400) {
          toast.error('Dados inválidos. Revise os campos e tente novamente.')
        } else if (status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (status === 403) {
          toast.error('Apenas administradores podem gerenciar temas.')
        } else if (status === 404) {
          toast.error('Tema não encontrado.')
        } else {
          toast.error('Não foi possível salvar o tema. Tente novamente.')
        }
      } else {
        toast.error('Não foi possível salvar o tema. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar tema' : 'Novo tema'

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/temas">Temas</Link>
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
          <form className="card tema-form" onSubmit={handleSubmit} noValidate>
            <section className="tema-form__section">
              <span className="h-eyebrow">1 · Identificação</span>
              <p className="tema-form__hint">
                Temas agrupam indicadores por categoria (ex.: Saúde
                Materno-Infantil, Educação, Saneamento).
              </p>
              <div className="tema-form__grid">
                <label className="tema-form__label" htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  className="input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Saúde Materno-Infantil"
                  required
                />
              </div>
            </section>

            <footer className="tema-form__footer">
              <Link to="/admin/temas" className="btn">
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
                    : 'Criar tema →'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </AdminShell>
  )
}
