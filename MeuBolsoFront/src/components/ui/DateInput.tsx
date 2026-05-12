import { useEffect, useMemo, useRef, useState } from 'react'
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
  placeholder = 'Selecione uma data',
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
    if (!open) {
      const selected = parseISO(value)
      if (selected) setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    }
    setOpen((current) => !current)
  }

  const selectDate = (nextValue: string) => {
    if (!nextValue) {
      onChange('')
      setOpen(false)
      return
    }
    if (isOutsideRange(nextValue, min, max)) return
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div className={`dateControl ${open ? 'dateControlOpen' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="dateTrigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={toggleOpen}
      >
        <span className={value ? 'dateTriggerValue' : 'dateTriggerPlaceholder'}>{value ? formatDisplay(value) : placeholder}</span>
        <span className="dateTriggerIcon" aria-hidden="true">
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
