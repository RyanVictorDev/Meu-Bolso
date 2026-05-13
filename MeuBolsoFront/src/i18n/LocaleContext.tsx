import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppLocale } from './localeStorage'
import { getStoredLocale, setStoredLocale } from './localeStorage'
import { translate, type MessageKey } from './messages'

export type LocaleContextValue = {
  locale: AppLocale
  setLocale: (next: AppLocale) => void
  t: (key: MessageKey) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getStoredLocale())

  const setLocale = useCallback((next: AppLocale) => {
    setStoredLocale(next)
    setLocaleState(next)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR'
  }, [locale])

  const t = useCallback((key: MessageKey) => translate(key, locale), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
