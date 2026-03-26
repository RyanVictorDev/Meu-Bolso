import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
  }
>

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'secondary' ? 'btn btnSecondary' : 'btn'
  return <button {...props} className={`${variantClass} ${className}`.trim()} />
}

