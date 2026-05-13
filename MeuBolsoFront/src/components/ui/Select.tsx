import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, ReactNode, SelectHTMLAttributes } from 'react'

function SelectCheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Select({
  className = '',
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  id: htmlId,
  name,
  required,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string>(() => String(value ?? defaultValue ?? ''))

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child) => {
          const props = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean }
          return {
            value: String(props.value ?? ''),
            label: props.children,
            disabled: Boolean(props.disabled),
          }
        }),
    [children],
  )

  const fallbackValue = (internalValue || options[0]?.value) ?? ''
  const selectedValue = String(value ?? fallbackValue)
  const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const commitValue = (nextValue: string) => {
    if (disabled) return
    setInternalValue(nextValue)
    setOpen(false)
    onChange?.({ target: { value: nextValue }, currentTarget: { value: nextValue } } as ChangeEvent<HTMLSelectElement>)
  }

  const moveSelection = (direction: 1 | -1) => {
    const enabledOptions = options.filter((option) => !option.disabled)
    if (enabledOptions.length === 0) return
    const currentIndex = enabledOptions.findIndex((option) => option.value === selectedValue)
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + enabledOptions.length) % enabledOptions.length
    commitValue(enabledOptions[nextIndex].value)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      else moveSelection(1)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) setOpen(true)
      else moveSelection(-1)
    }
  }

  return (
    <div className={`selectControl ${open ? 'selectControlOpen' : ''} ${className}`.trim()} ref={wrapRef}>
      <button
        type="button"
        id={htmlId}
        name={name}
        className="select"
        disabled={disabled}
        role="combobox"
        aria-required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="selectValue">{selectedOption?.label ?? 'Selecione'}</span>
        <span className="selectChevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="selectMenu" id={id} role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`selectOption ${option.value === selectedValue ? 'selectOptionActive' : ''}`}
              disabled={option.disabled}
              role="option"
              aria-selected={option.value === selectedValue}
              onClick={() => commitValue(option.value)}
            >
              <span>{option.label}</span>
              {option.value === selectedValue ? (
                <span className="selectCheck">
                  <SelectCheckIcon />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

