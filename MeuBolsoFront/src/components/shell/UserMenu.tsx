import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/useAuth'
import { useTheme } from '../../theme/useTheme'
import { useLocale } from '../../i18n/useLocale'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { mode, setMode, accent, setAccent, resetAccent } = useTheme()
  const { locale, setLocale, t } = useLocale()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="userMenuWrap" ref={wrapRef}>
      <button
        type="button"
        className="userMenuBtn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="userAvatar">{(user?.name ?? 'U').slice(0, 1).toUpperCase()}</span>
        <span className="userMenuText">
          <span className="userMenuName">{user?.name ?? 'Usuário'}</span>
          <span className="userMenuEmail">{user?.email ?? 'Minha conta'}</span>
        </span>
      </button>

      {open ? (
        <div className="userMenuPanel" id={panelId} role="menu" aria-label="Menu do usuário">
          <p className="appearancePanelTitle">{t('UI_LANGUAGE')}</p>
          <div className="appearanceRow">
            <span className="appearanceLabel">PT / EN</span>
            <div className="themeToggleGroup" role="group" aria-label={t('UI_LANGUAGE')}>
              <button
                type="button"
                className={`themeToggleBtn ${locale === 'pt-BR' ? 'themeToggleBtnActive' : ''}`}
                onClick={() => setLocale('pt-BR')}
              >
                PT
              </button>
              <button
                type="button"
                className={`themeToggleBtn ${locale === 'en' ? 'themeToggleBtnActive' : ''}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
          </div>
          <p className="appearancePanelTitle">Tema</p>
          <div className="appearanceRow">
            <span className="appearanceLabel">Modo</span>
            <div className="themeToggleGroup" role="group" aria-label="Modo de cor">
              <button
                type="button"
                className={`themeToggleBtn ${mode === 'light' ? 'themeToggleBtnActive' : ''}`}
                onClick={() => setMode('light')}
              >
                Claro
              </button>
              <button
                type="button"
                className={`themeToggleBtn ${mode === 'dark' ? 'themeToggleBtnActive' : ''}`}
                onClick={() => setMode('dark')}
              >
                Escuro
              </button>
            </div>
          </div>
          <div className="appearanceRow accentRow">
            <label className="colorPickerLabel" htmlFor={`${panelId}-accent`}>
              <span className="appearanceLabel">Acento</span>
              <input
                id={`${panelId}-accent`}
                className="colorPickerInput"
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                aria-label="Escolher cor de destaque"
              />
            </label>
            <button type="button" className="resetAccentBtn" onClick={resetAccent}>
              Padrão
            </button>
          </div>
          <button
            type="button"
            className="userMenuLogout"
            role="menuitem"
            onClick={() => {
              logout()
              void navigate('/login', { replace: true })
            }}
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}
