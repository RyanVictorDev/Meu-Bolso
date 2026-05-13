export type AppLocale = 'pt-BR' | 'en'

const STORAGE_KEY = 'meubolso_lang'

export function getStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return 'pt-BR'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en') return 'en'
    return 'pt-BR'
  } catch {
    return 'pt-BR'
  }
}

export function setStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale === 'en' ? 'en' : 'pt-BR')
  } catch {
    /* ignore */
  }
}
