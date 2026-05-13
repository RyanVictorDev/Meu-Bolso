import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export type SnackbarTone = 'success' | 'error'

export default function Snackbar({
  tone,
  message,
  onClose,
  durationMs = 4500,
}: {
  tone: SnackbarTone
  message: string
  onClose?: () => void
  durationMs?: number
}) {
  useEffect(() => {
    if (!onClose) return
    const timeoutId = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timeoutId)
  }, [durationMs, onClose])

  return createPortal(
    <div
      className={`snackbar ${tone === 'error' ? 'snackbarError' : 'snackbarSuccess'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body,
  )
}
