import type { CSSProperties, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EnvironmentSwitcher from './shell/EnvironmentSwitcher'
import HamburgerIcon from './shell/HamburgerIcon'
import SidebarBrand from './shell/SidebarBrand'
import SidebarNav from './shell/SidebarNav'
import UserMenu from './shell/UserMenu'

type AppShellProps = PropsWithChildren

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="appShell"
      style={
        ({
          ['--sidebarWidth' as string]: collapsed ? '88px' : '260px',
        }) as CSSProperties
      }
    >
      <aside className={`sidebar ${collapsed ? 'sidebarCollapsed' : ''}`}>
        <SidebarBrand />
        <SidebarNav collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      <main className="main">
        <div className={`topbar ${scrolled ? 'topbarScrolled' : ''}`}>
          {!collapsed ? (
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
        <div className="content">
          <div className="contentInner" key={location.pathname}>
            <div className="pageEnter">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

