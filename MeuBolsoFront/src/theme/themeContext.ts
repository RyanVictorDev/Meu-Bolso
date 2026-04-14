import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark'

export type ThemeContextValue = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  accent: string
  setAccent: (hex: string) => void
  resetAccent: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
