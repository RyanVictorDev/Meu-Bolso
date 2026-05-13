import type { AppLocale } from './localeStorage'

const FIELD_EN: Record<string, string> = {
  Valor: 'Amount',
  'Valor alvo': 'Target amount',
  Aporte: 'Contribution',
}

export function labelField(field: string, locale: AppLocale): string {
  if (locale === 'en') return FIELD_EN[field] ?? field
  return field
}

/** Mensagens do repositório local com interpolação de nome de campo. */
export function repoFieldPositive(field: string, locale: AppLocale): string {
  return locale === 'en' ? `${field} must be greater than zero` : `${field} deve ser maior que zero`
}

export function repoFieldExceeds(field: string, locale: AppLocale): string {
  return locale === 'en' ? `${field} exceeds the allowed limit` : `${field} excede o limite permitido`
}

export function repoFieldNonNegative(field: string, locale: AppLocale): string {
  return locale === 'en' ? `${field} must be greater than or equal to zero` : `${field} deve ser maior ou igual a zero`
}
