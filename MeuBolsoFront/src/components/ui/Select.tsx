import type { SelectHTMLAttributes } from 'react'

export default function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`select ${className}`.trim()}>
      {children}
    </select>
  )
}

