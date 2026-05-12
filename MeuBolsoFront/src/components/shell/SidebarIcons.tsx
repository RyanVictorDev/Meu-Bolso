type IconProps = { className?: string }

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12.5C4 8 7.5 4.5 12 4.5S20 8 20 12.5 16.5 20.5 12 20.5 4 17 4 12.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M8 13h3V8H8v5ZM13 16h3V8h-3v8ZM8 17h3v-2H8v2Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function IconTx({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 7h10M7 12h6.5M7 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconCategories({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3H4v8h8V3ZM20 3h-8v8h8V3ZM12 13H4v8h8v-8ZM20 13h-8v8h8v-8Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function IconBudgets({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 7v10M17 7v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 10c.7.3 2.2 1 4 1s3.3-.7 4-1 2.2-1 4-1 3.3.7 4 1M4 14c.7.3 2.2 1 4 1s3.3-.7 4-1 2.2-1 4-1 3.3.7 4 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconGoals({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 4V2M20 12h2M12 20v2M4 12H2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function IconCharts({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 19V9M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconEnvironment({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5 12 3l8 3.5v11L12 21l-8-3.5v-11Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12 20 8.5M12 12 4 8.5M12 12v9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
