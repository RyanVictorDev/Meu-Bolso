import type { CSSProperties, PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EnvironmentSwitcher from './shell/EnvironmentSwitcher'
import HamburgerIcon from './shell/HamburgerIcon'
import SidebarBrand from './shell/SidebarBrand'
import SidebarNav from './shell/SidebarNav'
import UserMenu from './shell/UserMenu'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useFinance } from '../services/useFinance'

const NARROW_QUERY = '(max-width: 900px)'

type AppShellProps = PropsWithChildren

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const { error, refresh } = useFinance()
  const narrow = useMediaQuery(NARROW_QUERY)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!narrow) {
      const id = window.setTimeout(() => setDrawerOpen(false), 0)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [narrow])

  useEffect(() => {
    const id = window.setTimeout(() => setDrawerOpen(false), 0)
    return () => window.clearTimeout(id)
  }, [location.pathname])

  useEffect(() => {
    if (!narrow || !drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [narrow, drawerOpen])

  useEffect(() => {
    if (!narrow || !drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [narrow, drawerOpen])

  useEffect(() => {
    if (!narrow || !drawerOpen) return
    const id = window.setTimeout(() => {
      sidebarRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus()
    }, 0)
    return () => window.clearTimeout(id)
  }, [narrow, drawerOpen])

  const sidebarWidth = narrow ? '0px' : collapsed ? '88px' : '260px'

  const shellClass = [
    'appShell',
    narrow ? 'appShellNarrow' : '',
    narrow && drawerOpen ? 'appShellDrawerOpen' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const asideClass = narrow
    ? `sidebar sidebarDrawer${drawerOpen ? ' sidebarDrawerOpen' : ''}`
    : `sidebar${collapsed ? ' sidebarCollapsed' : ''}`

  const sidebarNavCollapsed = narrow ? false : collapsed
  const onSidebarNavToggle = narrow ? () => setDrawerOpen(false) : () => setCollapsed((v) => !v)

  return (
    <div
      className={shellClass}
      style={
        ({
          ['--sidebarWidth' as string]: sidebarWidth,
        }) as CSSProperties
      }
    >
      {narrow && drawerOpen ? (
        <div className="sidebarBackdrop" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
      ) : null}

      <aside
        ref={sidebarRef}
        id="app-sidebar"
        className={asideClass}
        aria-hidden={narrow ? !drawerOpen : undefined}
        {...(narrow && !drawerOpen ? { inert: true } : {})}
      >
        <SidebarBrand />
        <SidebarNav
          collapsed={sidebarNavCollapsed}
          onToggle={onSidebarNavToggle}
          drawerCloseMode={narrow}
        />
      </aside>

      <main className="main" id="app-main">
        <div className={`topbar ${scrolled ? 'topbarScrolled' : ''}`}>
          {narrow ? (
            <button
              type="button"
              className="collapseBtn"
              aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={drawerOpen}
              aria-controls="app-sidebar"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <HamburgerIcon open={drawerOpen} />
            </button>
          ) : !collapsed ? (
            <button
              type="button"
              className="collapseBtn"
              aria-label="Colapsar sidebar"
              onClick={() => setCollapsed(true)}
            >
              <HamburgerIcon open />
            </button>
          ) : null}
          <EnvironmentSwitcher />
          <div className="topbarSpacer" />
          <div className="topbarActions">
            <UserMenu />
          </div>
        </div>
        <div className="content" {...(narrow && drawerOpen ? { inert: true } : {})}>
          {error ? (
            <div className="emptyState" role="alert">
              {error}{' '}
              <button type="button" className="smallBtn" onClick={() => void refresh()}>
                Tentar novamente
              </button>
            </div>
          ) : null}
          <div className="contentInner" key={location.pathname}>
            <div className="pageEnter">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
