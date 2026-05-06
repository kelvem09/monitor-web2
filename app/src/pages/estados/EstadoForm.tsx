import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import {
  createEstado,
  getEstado,
  updateEstado,
  type EstadoPayload,
} from '../../services/estados.service'
import './EstadoForm.css'

interface EstadoFormProps {
  mode: 'create' | 'edit'
}

export function EstadoForm({ mode }: EstadoFormProps) {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [uf, setUf] = useState('')
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || id === null) return
    let cancelled = false
    getEstado(id)
      .then((estado) => {
        if (cancelled) return
        setCodigo(String(estado.codigo))
        setNome(estado.nome)
        setUf(estado.uf)
      })
      .catch(() => {
        if (cancelled) return
        setError('Não foi possível carregar o estado.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const codigoNum = Number(codigo)
    if (!Number.isInteger(codigoNum) || codigoNum <= 0) {
      setError('Código IBGE deve ser um número inteiro positivo.')
      return
    }
    if (uf.trim().length !== 2) {
      setError('UF deve conter exatamente 2 letras (ex.: RN).')
      return
    }
    if (nome.trim().length < 2) {
      setError('Informe um nome válido.')
      return
    }

    const payload: EstadoPayload = {
      codigo: codigoNum,
      nome: nome.trim(),
      uf: uf.trim().toUpperCase(),
    }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        await updateEstado(id, payload)
      } else {
        await createEstado(payload)
      }
      navigate('/admin/estados', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('Já existe um estado com esse código ou UF.')
      } else {
        setError('Não foi possível salvar o estado. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar estado' : 'Novo estado'

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/estados">Estados</Link>
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
          <form className="card estado-form" onSubmit={handleSubmit} noValidate>
            <section className="estado-form__section">
              <span className="h-eyebrow">1 · Identificação</span>
              <div className="estado-form__grid">
                <label className="estado-form__label" htmlFor="codigo">
                  Código IBGE
                </label>
                <input
                  id="codigo"
                  className="input"
                  inputMode="numeric"
                  style={{ maxWidth: 180, fontFamily: 'var(--font-mono)' }}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="24"
                  required
                />

                <label className="estado-form__label" htmlFor="uf">
                  UF
                </label>
                <input
                  id="uf"
                  className="input"
                  style={{
                    maxWidth: 90,
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                  }}
                  maxLength={2}
                  value={uf}
                  onChange={(e) =>
                    setUf(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())
                  }
                  placeholder="RN"
                  required
                />

                <label className="estado-form__label" htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  className="input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Rio Grande do Norte"
                  required
                />
              </div>
            </section>

            {error && (
              <div className="admin-page__alert admin-page__alert--error">
                {error}
              </div>
            )}

            <footer className="estado-form__footer">
              <Link to="/admin/estados" className="btn">
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
                    : 'Criar estado →'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </AdminShell>
  )
}
