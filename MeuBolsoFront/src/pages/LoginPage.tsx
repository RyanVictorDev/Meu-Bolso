import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { ApiError } from '../services/apiClient'
import { useAuth } from '../services/useAuth'
import { useTheme } from '../theme/useTheme'

type AuthMode = 'login' | 'register'
type AuthFieldErrors = Partial<Record<'name' | 'email' | 'password', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGISTER_RULES = {
  name: { min: 2, max: 120 },
  email: { max: 180 },
  password: { min: 8, max: 80 },
} as const

function resolveNextPath(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: string }).from
    if (typeof from === 'string' && from.startsWith('/')) return from
  }
  return '/'
}

function validateAuth(mode: AuthMode, name: string, email: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()

  if (mode === 'register') {
    if (trimmedName.length < REGISTER_RULES.name.min) {
      errors.name = 'Informe um nome com pelo menos 2 caracteres.'
    } else if (trimmedName.length > REGISTER_RULES.name.max) {
      errors.name = 'O nome deve ter no máximo 120 caracteres.'
    }
  }

  if (!trimmedEmail) {
    errors.email = 'Informe seu e-mail.'
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Informe um e-mail válido.'
  } else if (mode === 'register' && trimmedEmail.length > REGISTER_RULES.email.max) {
    errors.email = 'O e-mail deve ter no máximo 180 caracteres.'
  }

  if (!password) {
    errors.password = 'Informe sua senha.'
  } else if (mode === 'register' && password.length < REGISTER_RULES.password.min) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.'
  } else if (mode === 'register' && password.length > REGISTER_RULES.password.max) {
    errors.password = 'A senha deve ter no máximo 80 caracteres.'
  }

  return errors
}

function apiFieldsToAuthErrors(fields: Record<string, string>): AuthFieldErrors {
  const next: AuthFieldErrors = {}
  if (fields.name) next.name = 'Informe um nome entre 2 e 120 caracteres.'
  if (fields.email) next.email = 'Informe um e-mail válido com até 180 caracteres.'
  if (fields.password) next.password = 'A senha deve ter entre 8 e 80 caracteres.'
  return next
}

function authApiMessage(error: ApiError, fieldErrors: AuthFieldErrors): string {
  if (error.status === 401) return 'E-mail ou senha inválidos.'
  if (error.status === 409) return 'Este e-mail já está cadastrado.'
  if (Object.keys(fieldErrors).length > 0) return 'Revise os campos destacados para continuar.'
  return error.message
}

export default function LoginPage() {
  const { login, register, loading, isAuthenticated } = useAuth()
  const { mode: themeMode, setMode: setThemeMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})

  const nextPath = useMemo(() => resolveNextPath(location.state), [location.state])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void navigate(nextPath, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, nextPath])

  const submit = async () => {
    setError(null)
    const validationErrors = validateAuth(mode, name, email, password)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setError('Revise os campos destacados para continuar.')
      return
    }

    setPending(true)
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      void navigate(nextPath, { replace: true })
    } catch (e) {
      if (e instanceof ApiError) {
        const apiFieldErrors = apiFieldsToAuthErrors(e.fields)
        setFieldErrors(apiFieldErrors)
        setError(authApiMessage(e, apiFieldErrors))
      } else if (e instanceof Error) {
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
        <div className="authTop">
          <div className="authBadge">MeuBolso</div>
          <div className="authThemeToggle" role="group" aria-label="Tema da aplicação">
            <button
              type="button"
              className={`authThemeBtn ${themeMode === 'light' ? 'authThemeBtnActive' : ''}`}
              onClick={() => setThemeMode('light')}
            >
              Claro
            </button>
            <button
              type="button"
              className={`authThemeBtn ${themeMode === 'dark' ? 'authThemeBtnActive' : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              Escuro
            </button>
          </div>
        </div>
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
              setFieldErrors({})
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
              setFieldErrors({})
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
                onChange={(e) => {
                  setName(e.target.value)
                  setFieldErrors((current) => ({ ...current, name: undefined }))
                }}
                placeholder="Seu nome completo"
                autoComplete="name"
                required
                minLength={REGISTER_RULES.name.min}
                maxLength={REGISTER_RULES.name.max}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
              />
              {fieldErrors.name ? (
                <div id="auth-name-error" className="fieldError">
                  {fieldErrors.name}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="field">
            <div className="label">E-mail</div>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldErrors((current) => ({ ...current, email: undefined }))
              }}
              placeholder="voce@empresa.com"
              autoComplete="email"
              required
              maxLength={REGISTER_RULES.email.max}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
            />
            {fieldErrors.email ? (
              <div id="auth-email-error" className="fieldError">
                {fieldErrors.email}
              </div>
            ) : null}
          </div>

          <div className="field">
            <div className="label">Senha</div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFieldErrors((current) => ({ ...current, password: undefined }))
              }}
              placeholder="********"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'register' ? REGISTER_RULES.password.min : undefined}
              maxLength={mode === 'register' ? REGISTER_RULES.password.max : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'auth-password-error' : mode === 'register' ? 'auth-password-hint' : undefined
              }
            />
            {mode === 'register' ? (
              <div id="auth-password-hint" className="fieldHint">
                Use entre 8 e 80 caracteres.
              </div>
            ) : null}
            {fieldErrors.password ? (
              <div id="auth-password-error" className="fieldError">
                {fieldErrors.password}
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="authNotification authNotificationError" role="alert" aria-live="assertive">
            {error}
          </div>
        ) : null}

        <Button className="authSubmit" disabled={pending} onClick={() => void submit()}>
          {pending ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}
        </Button>
      </div>
    </div>
  )
}
