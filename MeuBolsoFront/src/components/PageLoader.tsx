export default function PageLoader() {
  return (
    <div className="loadingBlock" role="status" aria-live="polite" aria-label="Carregando">
      <div className="loadingSpinner" aria-hidden />
      <p className="loadingLabel">Carregando…</p>
    </div>
  )
}
