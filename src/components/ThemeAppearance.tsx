import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from '../theme/useTheme'

export default function ThemeAppearance() {
  const { mode, setMode, accent, setAccent, resetAccent } = useTheme()
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
    <div className="appearanceWrap" ref={wrapRef}>
      <button
        type="button"
        className="appearanceBtn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        title="Aparência"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .65.38 1.24.97 1.51.59.27 1.28.24 1.85-.09H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div className="appearancePanel" id={panelId} role="dialog" aria-label="Aparência">
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
          <p className="appearancePanelTitle" style={{ marginTop: 14 }}>
            Cor de destaque
          </p>
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
        </div>
      ) : null}
    </div>
  )
}
