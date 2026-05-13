import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseISO(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function formatDisplay(value: string) {
  const date = parseISO(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

/** Cola / atalho: ISO ou data BR completa. */
function parseFlexible(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return parseISO(t) ? t : null
  }
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t)
  if (!m) return null
  const d = Number(m[1])
  const mo = Number(m[2])
  const y = Number(m[3])
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return toISO(date)
}

/** Só dígitos ddmmaaaa → ISO ou null. */
function digitBufferToISO(buf: string): string | null {
  const d = buf.replace(/\D/g, '').slice(0, 8)
  if (d.length !== 8) return null
  const day = Number(d.slice(0, 2))
  const month = Number(d.slice(2, 4))
  const year = Number(d.slice(4, 8))
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return toISO(date)
}

function isoToDigitBuffer(iso: string): string {
  const date = parseISO(iso)
  if (!date) return ''
  return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}`
}

/** Exibe dd/mm/aaaa a partir só dos dígitos (barras são só visuais). */
function formatDigitsBR(digits: string): string {
  const x = digits.replace(/\D/g, '').slice(0, 8)
  if (x.length === 0) return ''
  if (x.length <= 2) return x
  if (x.length <= 4) return `${x.slice(0, 2)}/${x.slice(2)}`
  return `${x.slice(0, 2)}/${x.slice(2, 4)}/${x.slice(4)}`
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}

function isOutsideRange(value: string, min?: string, max?: string) {
  return Boolean((min && value < min) || (max && value > max))
}

export default function DateInput({
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  placeholder = 'dd/mm/aaaa',
}: {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  const today = useMemo(() => toISO(new Date()), [])
  const initialMonth = parseISO(value) ?? parseISO(min ?? '') ?? new Date()
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1))
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 320 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [focused, setFocused] = useState(false)
  /** Só dígitos, até 8 (ddmmyyyy). Barras vêm só da formatação. */
  const [digitBuffer, setDigitBuffer] = useState('')

  const revertBufferToValue = useCallback(() => {
    setDigitBuffer(value ? isoToDigitBuffer(value) : '')
  }, [value])

  const commitDigits = useCallback(() => {
    const digits = digitBuffer.replace(/\D/g, '')
    if (digits.length === 0) {
      if (!required) {
        onChange('')
        setDigitBuffer('')
      } else {
        revertBufferToValue()
      }
      return
    }
    if (digits.length < 8) {
      revertBufferToValue()
      return
    }
    const iso = digitBufferToISO(digits)
    if (!iso) {
      revertBufferToValue()
      return
    }
    if (isOutsideRange(iso, min, max)) {
      revertBufferToValue()
      return
    }
    onChange(iso)
    setDigitBuffer(isoToDigitBuffer(iso))
  }, [digitBuffer, min, max, onChange, required, revertBufferToValue])

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      const menuWidth = Math.min(320, window.innerWidth - 32)
      const left = Math.min(Math.max(16, rect.left), window.innerWidth - menuWidth - 16)
      const preferredTop = rect.bottom + 6
      const estimatedHeight = 390
      const top =
        preferredTop + estimatedHeight > window.innerHeight
          ? Math.max(16, rect.top - estimatedHeight - 6)
          : Math.min(preferredTop, window.innerHeight - estimatedHeight - 16)
      setMenuPosition({ top, left, width: menuWidth })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  /** Mantém o cursor no fim: edição é sempre “no último dígito” (melhor com máscara derivada). */
  useLayoutEffect(() => {
    if (!focused || !inputRef.current) return
    const el = inputRef.current
    const len = el.value.length
    el.setSelectionRange(len, len)
  }, [digitBuffer, focused])

  const days = useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - firstDay.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const iso = toISO(date)
      return {
        date,
        iso,
        inMonth: date.getMonth() === viewMonth.getMonth(),
        disabled: isOutsideRange(iso, min, max),
      }
    })
  }, [max, min, viewMonth])

  const moveMonth = (direction: 1 | -1) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1))
  }

  const toggleOpen = () => {
    if (disabled) return
    if (!open) {
      const selected = parseISO(value)
      if (selected) setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    }
    setOpen((current) => !current)
  }

  const selectDate = (nextValue: string) => {
    if (!nextValue) {
      onChange('')
      setDigitBuffer('')
      setOpen(false)
      return
    }
    if (isOutsideRange(nextValue, min, max)) return
    onChange(nextValue)
    setDigitBuffer(isoToDigitBuffer(nextValue))
    setOpen(false)
  }

  const fieldText = focused ? formatDigitsBR(digitBuffer) : value ? formatDisplay(value) : ''

  const onDigitsFromString = (raw: string) => {
    setDigitBuffer(raw.replace(/\D/g, '').slice(0, 8))
  }

  return (
    <div className={`dateControl ${open ? 'dateControlOpen' : ''}`} ref={wrapRef}>
      <div className={`dateFieldShell ${disabled ? 'dateFieldShellDisabled' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="dateTextInput dateTextInputMasked"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Data"
          value={fieldText}
          onFocus={() => {
            setFocused(true)
            setDigitBuffer(value ? isoToDigitBuffer(value) : '')
          }}
          onBlur={() => {
            commitDigits()
            setFocused(false)
          }}
          onChange={(e) => onDigitsFromString(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitDigits()
              inputRef.current?.blur()
              return
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
              e.preventDefault()
              setDigitBuffer((d) => d.slice(0, Math.max(0, d.length - 1)))
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            const t = e.clipboardData.getData('text').trim()
            const iso = parseFlexible(t)
            if (iso && !isOutsideRange(iso, min, max)) {
              setDigitBuffer(isoToDigitBuffer(iso))
              return
            }
            onDigitsFromString(t)
          }}
        />
        <button
          type="button"
          className="dateCalendarBtn"
          aria-label="Abrir calendário"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleOpen}
        >
          <span className="dateCalendarBtnIcon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      {open
        ? createPortal(
            <div
              className="dateMenu"
              role="dialog"
              aria-label="Selecionar data"
              ref={menuRef}
              style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
            >
              <div className="dateMenuHeader">
                <button type="button" className="dateNavBtn" onClick={() => moveMonth(-1)} aria-label="Mês anterior">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="dateMonthLabel">{monthLabel(viewMonth)}</div>
                <button type="button" className="dateNavBtn" onClick={() => moveMonth(1)} aria-label="Próximo mês">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="dateWeekdays">
                {WEEKDAYS.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>

              <div className="dateGrid">
                {days.map((day) => (
                  <button
                    type="button"
                    key={day.iso}
                    className={[
                      'dateDay',
                      day.inMonth ? '' : 'dateDayMuted',
                      day.iso === value ? 'dateDaySelected' : '',
                      day.iso === today ? 'dateDayToday' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={day.disabled}
                    onClick={() => selectDate(day.iso)}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>

              <div className="dateMenuFooter">
                {!required ? (
                  <button type="button" className="dateFooterBtn" onClick={() => selectDate('')}>
                    Limpar
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" className="dateFooterBtn" disabled={isOutsideRange(today, min, max)} onClick={() => selectDate(today)}>
                  Hoje
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
