import type { ReactNode } from 'react'

export default function CategoryIcon({ name }: { name: string }): ReactNode {
  const key = name.trim().toLowerCase()

  if (key.includes('moradia')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 11L12 4L21 11V20H3V11Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 20V12H15V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  }

  if (key.includes('aliment')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3V12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M7 12V21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M11 3V17C11 19.2 12.8 21 15 21H15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M17 3V12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" opacity="0.9" />
      </svg>
    )
  }

  if (key.includes('transporte')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 14L5 7H19L21 14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 18C7 19.1 6.1 20 5 20C3.9 20 3 19.1 3 18C3 16.9 3.9 16 5 16C6.1 16 7 16.9 7 18Z" fill="currentColor" opacity="0.15" />
        <path d="M19 18C19 19.1 18.1 20 17 20C15.9 20 15 19.1 15 18C15 16.9 15.9 16 17 16C18.1 16 19 16.9 19 18Z" fill="currentColor" opacity="0.15" />
        <path d="M5 18H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 18H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 14V11H17V14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  }

  if (key.includes('saúde') || key.includes('saude')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s-7-4.6-9.2-9C1.1 8.6 3 6 5.9 6c1.7 0 2.8 1 3.6 2c.8-1 1.9-2 3.6-2C16 6 17.9 8.6 21.2 12c-2.2 4.4-9.2 9-9.2 9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M12 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 11H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (key.includes('lazer')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 7H17L19 9V16L17 18H7L5 16V9L7 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (key.includes('educ')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7L12 3L21 7L12 11L3 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3 7V17L12 21L21 17V7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />
      </svg>
    )
  }

  if (key.includes('cont')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3H17L21 7V21H7V3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M7 7H21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.85" />
        <path d="M10 11H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 15H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (key.includes('salár') || key.includes('salario')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 1V23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
        <path d="M8 7H16C16 10 8 10 8 13C8 16 16 16 16 19H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (key.includes('freelance')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 11C9 9.2 10.2 8 12 8C13.8 8 15 9.2 15 11C15 12.8 13.8 14 12 14C10.2 14 9 12.8 9 11Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 20C6.5 16.5 9 15 12 15C15 15 17.5 16.5 18 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 6H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      </svg>
    )
  }

  // "Outros" and fallback
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

