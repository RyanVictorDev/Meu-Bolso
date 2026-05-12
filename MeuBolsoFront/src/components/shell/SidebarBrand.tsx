export default function SidebarBrand() {
  return (
    <div className="sidebarBrand">
      <span className="sidebarLogo" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 14c0-3.5 3-6.5 7-6.5h1.5l1-2h3l1 2H17c1.5 0 2.5 1.2 2.5 2.8V16c0 1.2-1 2.2-2.2 2.2H5.2C4 18.2 3 17.2 3 16v-1.5c0-.8.4-1.5 1-2Z"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <path d="M8 12v-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="10.5" cy="13" r="0.9" fill="currentColor" />
          <circle cx="14" cy="13" r="0.9" fill="currentColor" />
          <path d="M10 16.2c.8.6 1.8.9 2.9.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </span>
      <span className="sidebarBrandText">MeuBolso</span>
    </div>
  )
}
