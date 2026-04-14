import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, type ThemeMode } from './themeContext'

const STORAGE_KEY = 'meubolso_ui_v1'
export const DEFAULT_ACCENT = '#22c55e'

type Stored = { mode: ThemeMode; accent: string }

function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'light' || v === 'dark'
}

function normalizeHex(v: string): string | null {
  const s = v.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase()
  return null
}

function readStored(): Stored {
  if (typeof window === 'undefined') {
    return { mode: 'light', accent: DEFAULT_ACCENT }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { mode: 'light', accent: DEFAULT_ACCENT }
    const parsed = JSON.parse(raw) as Partial<Stored>
    const mode = isThemeMode(parsed.mode) ? parsed.mode : 'light'
    const accent = normalizeHex(typeof parsed.accent === 'string' ? parsed.accent : '') ?? DEFAULT_ACCENT
    return { mode, accent }
  } catch {
    return { mode: 'light', accent: DEFAULT_ACCENT }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStored().mode)
  const [accent, setAccentState] = useState(() => readStored().accent)

  if (typeof document !== 'undefined') {
    const root = document.documentElement
    /* Atualiza <html> no render para tokens CSS e getComputedStyle nos filhos ficarem coerentes */
    // eslint-disable-next-line react-hooks/immutability -- sincronização intencional do tema no DOM
    root.dataset.theme = mode
    root.style.setProperty('--accent', accent)
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }))
    } catch {
      /* ignore */
    }
  }, [mode, accent])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
  }, [])

  const setAccent = useCallback((hex: string) => {
    const n = normalizeHex(hex)
    if (n) setAccentState(n)
  }, [])

  const resetAccent = useCallback(() => {
    setAccentState(DEFAULT_ACCENT)
  }, [])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      accent,
      setAccent,
      resetAccent,
    }),
    [mode, setMode, accent, setAccent, resetAccent],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
