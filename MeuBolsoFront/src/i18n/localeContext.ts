import { createContext } from 'react'
import type { AppLocale } from './localeStorage'
import type { MessageKey } from './messages'

export type LocaleContextValue = {
  locale: AppLocale
  setLocale: (next: AppLocale) => void
  t: (key: MessageKey) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
