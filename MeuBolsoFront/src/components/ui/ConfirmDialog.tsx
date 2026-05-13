import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!loading) onCancel()
      }}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="secondary" className="dangerBtn" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirmDialogText">{description}</p>
      {errorMessage ? (
        <div className="emptyState environmentError" role="alert" style={{ marginTop: 12 }}>
          {errorMessage}
        </div>
      ) : null}
    </Modal>
  )
}
