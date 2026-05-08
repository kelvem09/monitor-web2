import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { login } from '../services/auth.service'
import { setToken, setUser } from '../lib/auth'
import { Logo } from '../components/Logo'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepConnected, setKeepConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { access_token, user } = await login({ email, password })
      setToken(access_token)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role })
      navigate('/admin/indicadores', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Credenciais inválidas.')
      } else {
        setError('Não foi possível realizar o login. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login">
      <section className="login__panel">
        <div className="login__brand">
          <Logo size={26} />
        </div>

        <div className="login__form-wrap">
          <span className="h-eyebrow login__eyebrow">Painel administrativo</span>
          <h1 className="h-display login__title">
            Entrar no <span className="login__title-em">IndicaRN</span>
          </h1>
          <p className="login__lede">
            Acesso restrito a gestores públicos e administradores cadastrados.
          </p>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <label className="login__field">
              <span className="h-eyebrow">E-mail institucional</span>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@rn.gov.br"
                autoComplete="email"
                required
              />
            </label>

            <label className="login__field">
              <span className="login__field-row">
                <span className="h-eyebrow">Senha</span>
                <a className="login__forgot" href="#">
                  Esqueci a senha
                </a>
              </span>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            <label className="login__keep">
              <input
                type="checkbox"
                checked={keepConnected}
                onChange={(e) => setKeepConnected(e.target.checked)}
              />
              <span>Manter conectado por 7 dias</span>
            </label>

            {error && (
              <p className="login__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando…' : 'Entrar →'}
            </button>

            <p className="login__hint">
              Sem cadastro? <a href="#">Solicitar acesso ao gestor</a>
            </p>
          </form>
        </div>

        <div className="login__meta">
          <span>API REST · NestJS</span>
          <span>•</span>
          <span>Autenticação JWT</span>
          <span>•</span>
          <span>v1.0</span>
        </div>
      </section>

      <aside className="login__aside" aria-hidden="true">
        <span className="h-eyebrow login__aside-eyebrow">
          167 municípios · 5 anos · 2 bases
        </span>
        <div>
          <h2 className="h-display login__aside-title">
            Indicadores municipais a partir das bases{' '}
            <em>SINASC</em> e <em>SIM</em>.
          </h2>
          <p className="login__aside-lede">
            Plataforma para criação, gestão e visualização pública de
            indicadores derivados de fontes do Ministério da Saúde.
          </p>
        </div>
      </aside>
    </main>
  )
}
