import type { ButtonHTMLAttributes } from 'react'

type ActionIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  action: 'edit' | 'delete'
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4.5L19 9.5a2.8 2.8 0 0 0-4-4L4.5 16 4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13.5 7 17 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M10 11v6M14 11v6M9 7l.7-2h4.6L15 7M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ActionIconButton({ action, className = '', 'aria-label': ariaLabel, title, ...props }: ActionIconButtonProps) {
  const label = ariaLabel ?? (action === 'edit' ? 'Editar' : 'Excluir')
  const variantClass = action === 'delete' ? 'dangerBtn' : ''

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`iconActionBtn ${variantClass} ${className}`.trim()}
      aria-label={label}
      title={title ?? label}
    >
      {action === 'edit' ? <EditIcon /> : <DeleteIcon />}
    </button>
  )
}
