export default function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className={`hamburgerIcon ${open ? 'hamburgerIconOpen' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}
