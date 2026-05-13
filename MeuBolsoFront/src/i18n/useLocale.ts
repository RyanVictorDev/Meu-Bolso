import { useContext } from 'react'
import { LocaleContext } from './localeContext'

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale deve ser usado dentro de LocaleProvider')
  }
  return ctx
}
