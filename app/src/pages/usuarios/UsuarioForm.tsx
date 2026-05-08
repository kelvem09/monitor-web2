import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminShell } from '../../components/AdminShell'
import { useToast } from '../../components/toast-context'
import {
  createUser,
  getUser,
  listMunicipiosSemGestor,
  updateUser,
  USER_ROLE_DESCRIPTION,
  USER_ROLE_LABEL,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserRole,
} from '../../services/users.service'
import type { Municipio } from '../../services/municipios.service'
import './UsuarioForm.css'

interface UsuarioFormProps {
  mode: 'create' | 'edit'
}

const ROLES: ReadonlyArray<UserRole> = ['ADMIN', 'GESTOR_PUBLICO']

export function UsuarioForm({ mode }: UsuarioFormProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams<{ id: string }>()
  const id = mode === 'edit' && params.id ? Number(params.id) : null

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('GESTOR_PUBLICO')
  const [isActive, setIsActive] = useState(true)
  const [municipioId, setMunicipioId] = useState<number | ''>(``)
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [municipiosLoading, setMunicipiosLoading] = useState(false)

  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode !== 'edit' || id === null) return
    let cancelled = false
    getUser(id)
      .then((user) => {
        if (cancelled) return
        setName(user.name)
        setEmail(user.email)
        setRole(user.role)
        setIsActive(user.isActive)
        if (user.municipio) setMunicipioId(user.municipio.id)
      })
      .catch((err) => {
        if (cancelled) return
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('Usuário não encontrado.')
          navigate('/admin/usuarios', { replace: true })
        } else {
          toast.error('Não foi possível carregar o usuário.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id, toast, navigate])

  useEffect(() => {
    if (role !== 'GESTOR_PUBLICO') return
    let cancelled = false
    setMunicipiosLoading(true)
    listMunicipiosSemGestor()
      .then((data) => {
        if (cancelled) return
        setMunicipios(data)
      })
      .catch(() => {
        if (!cancelled) toast.error('Não foi possível carregar os municípios.')
      })
      .finally(() => {
        if (!cancelled) setMunicipiosLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [role, toast])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (name.trim().length < 2) {
      toast.error('Informe o nome do usuário.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('Informe um e-mail válido.')
      return
    }
    if (mode === 'create' && password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (role === 'GESTOR_PUBLICO' && !municipioId) {
      toast.error('Selecione o município para o gestor público.')
      return
    }
    if (mode === 'edit' && password.length > 0 && password.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'edit' && id !== null) {
        const payload: UpdateUserPayload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          isActive,
        }
        if (password.length > 0) payload.password = password
        if (role === 'GESTOR_PUBLICO' && municipioId) payload.municipioId = Number(municipioId)
        await updateUser(id, payload)
        toast.success(`Usuário ${payload.name} atualizado com sucesso.`)
      } else {
        const payload: CreateUserPayload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          isActive,
        }
        if (role === 'GESTOR_PUBLICO' && municipioId) payload.municipioId = Number(municipioId)
        await createUser(payload)
        toast.success(`Usuário ${payload.name} criado com sucesso.`)
      }
      navigate('/admin/usuarios', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          toast.error('Já existe um usuário com este e-mail.')
        } else if (status === 400) {
          toast.error('Dados inválidos. Revise os campos e tente novamente.')
        } else if (status === 401) {
          toast.error('Sessão expirada. Faça login novamente.')
        } else if (status === 403) {
          toast.error('Apenas administradores podem gerenciar usuários.')
        } else if (status === 404) {
          toast.error('Usuário não encontrado.')
        } else {
          toast.error('Não foi possível salvar o usuário. Tente novamente.')
        }
      } else {
        toast.error('Não foi possível salvar o usuário. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'edit' ? 'Editar usuário' : 'Novo usuário'

  return (
    <AdminShell>
      <header className="admin-page__header">
        <div>
          <div className="admin-page__crumbs">
            <Link to="/admin/usuarios">Usuários</Link>
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
          <form
            className="card usuario-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="usuario-form__section">
              <span className="h-eyebrow">1 · Identificação</span>
              <div className="usuario-form__grid">
                <label className="usuario-form__label" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Helena Silva"
                  required
                />

                <label className="usuario-form__label" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@rn.gov.br"
                  autoComplete="off"
                  required
                />

                <label className="usuario-form__label" htmlFor="password">
                  {mode === 'edit' ? 'Nova senha' : 'Senha'}
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'edit'
                      ? 'Deixe em branco para manter a senha atual'
                      : 'Mínimo de 6 caracteres'
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required={mode === 'create'}
                />
              </div>
            </section>

            <section className="usuario-form__section">
              <span className="h-eyebrow">2 · Perfil de acesso</span>
              <div className="usuario-form__roles">
                {ROLES.map((r) => (
                  <label
                    key={r}
                    className={`usuario-form__role${role === r ? ' usuario-form__role--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                    <div>
                      <div className="usuario-form__role-name">
                        {USER_ROLE_LABEL[r]}
                      </div>
                      <div className="usuario-form__role-desc">
                        {USER_ROLE_DESCRIPTION[r]}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="usuario-form__section">
              <span className="h-eyebrow">3 · Status</span>
              <label className="usuario-form__check">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>
                  <strong>Usuário ativo</strong>
                  <span className="usuario-form__check-hint">
                    Usuários inativos não conseguem acessar o sistema.
                  </span>
                </span>
              </label>
            </section>

            {role === 'GESTOR_PUBLICO' && (
              <section className="usuario-form__section">
                <span className="h-eyebrow">4 · Vinculação Municipal</span>
                <div className="usuario-form__grid">
                  <label className="usuario-form__label" htmlFor="municipioId">
                    Município
                  </label>
                  <select
                    id="municipioId"
                    className="input"
                    value={municipioId}
                    onChange={(e) => setMunicipioId(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    disabled={municipiosLoading}
                  >
                    <option value="">
                      {municipiosLoading ? 'Carregando…' : 'Selecione um município'}
                    </option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </section>
            )}

            <footer className="usuario-form__footer">
              <Link to="/admin/usuarios" className="btn">
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
                    : 'Criar usuário →'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </AdminShell>
  )
}
