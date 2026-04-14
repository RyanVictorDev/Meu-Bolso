import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { ApiError } from '../services/apiClient'
import { useAuth } from '../services/useAuth'

type AuthMode = 'login' | 'register'

function resolveNextPath(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: string }).from
    if (typeof from === 'string' && from.startsWith('/')) return from
  }
  return '/'
}

export default function LoginPage() {
  const { login, register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextPath = useMemo(() => resolveNextPath(location.state), [location.state])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void navigate(nextPath, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, nextPath])

  const submit = async () => {
    setError(null)
    setPending(true)
    try {
      if (mode === 'register') {
        if (name.trim().length < 2) {
          throw new Error('Informe um nome válido')
        }
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      void navigate(nextPath, { replace: true })
    } catch (e) {
      if (e instanceof ApiError || e instanceof Error) {
        setError(e.message)
      } else {
        setError('Não foi possível autenticar agora')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authBadge">MeuBolso</div>
        <h1 className="authTitle">{mode === 'login' ? 'Entrar na sua conta' : 'Criar conta'}</h1>
        <p className="authSubtitle">
          {mode === 'login'
            ? 'Acesse seu painel financeiro com segurança.'
            : 'Comece agora a organizar receitas, despesas e orçamentos.'}
        </p>

        <div className="authTabs" role="tablist" aria-label="Modo de autenticação">
          <button
            type="button"
            className={`authTab ${mode === 'login' ? 'authTabActive' : ''}`}
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`authTab ${mode === 'register' ? 'authTabActive' : ''}`}
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register')
              setError(null)
            }}
          >
            Cadastro
          </button>
        </div>

        <div className="authForm">
          {mode === 'register' ? (
            <div className="field">
              <div className="label">Nome</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </div>
          ) : null}

          <div className="field">
            <div className="label">E-mail</div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="label">Senha</div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>
        </div>

        {error ? <div className="emptyState authError">{error}</div> : null}

        <Button className="authSubmit" disabled={pending} onClick={() => void submit()}>
          {pending ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
        </Button>
      </div>
    </div>
  )
}
