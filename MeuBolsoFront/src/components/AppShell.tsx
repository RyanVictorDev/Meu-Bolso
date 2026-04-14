import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ThemeAppearance from './ThemeAppearance'
import { useAuth } from '../services/useAuth'

type AppShellProps = PropsWithChildren

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12.5C4 11.1193 4 10.4289 4.27149 9.88897C4.5077 9.41654 4.89618 9.02806 5.36861 8.79185C5.90857 8.52036 6.59896 8.52036 7.9797 8.52036H8.52036V4.52036H8.9797C10.3605 4.52036 11.0508 4.52036 11.5908 4.79185C12.0632 5.02806 12.4517 5.41654 12.6879 5.88897C12.9594 6.42893 12.9594 7.11932 12.9594 8.50006V9.52036H16.0001V8.50006C16.0001 7.11932 16.0001 6.42893 16.2716 5.88897C16.5078 5.41654 16.8963 5.02806 17.3687 4.79185C17.9087 4.52036 18.5991 4.52036 19.9798 4.52036H20.5205V9.52036H21.0201C22.4008 9.52036 23.0912 9.52036 23.6312 9.79185C24.1036 10.0281 24.4921 10.4165 24.7283 10.8889C25 11.4289 25 12.1193 25 13.5C25 14.8807 25 15.5711 24.7283 16.1111C24.4921 16.5835 24.1036 16.972 23.6312 17.2082C23.0912 17.4797 22.4008 17.4797 21.0201 17.4797H20.5205V21.4797H19.9798C18.5991 21.4797 17.9087 21.4797 17.3687 21.2082C16.8963 20.972 16.5078 20.5835 16.2716 20.1111C16.0001 19.5711 16.0001 18.8807 16.0001 17.5V16.4797H12.9594V17.5C12.9594 18.8807 12.9594 19.5711 12.6879 20.1111C12.4517 20.5835 12.0632 20.972 11.5908 21.2082C11.0508 21.4797 10.3605 21.4797 8.9797 21.4797H8.52036V17.4797H7.9797C6.59896 17.4797 5.90857 17.4797 5.36861 17.2082C4.89618 16.972 4.5077 16.5835 4.27149 16.1111C4 15.5711 4 14.8807 4 13.5V12.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.9"
      />
    </svg>
  )
}

function IconTx({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 7L17 7M7 12H13.5M7 17H17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCategories({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3H4V11H12V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M20 3H12V11H20V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        opacity="0.8"
      />
      <path d="M12 13H4V21H12V13Z" stroke="currentColor" strokeWidth="1.7" opacity="0.8" />
      <path d="M20 13H12V21H20V13Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconBudgets({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 7V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 7V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M4 10C4.66667 10.3333 6.2 11 8 11C9.8 11 11.3333 10.3333 12 10C12.6667 9.66667 14.2 9 16 9C17.8 9 19.3333 9.66667 20 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M4 14C4.66667 14.3333 6.2 15 8 15C9.8 15 11.3333 14.3333 12 14C12.6667 13.6667 14.2 13 16 13C17.8 13 19.3333 13.6667 20 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}

function NavItem({
  to,
  label,
  icon,
  end,
}: {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => (isActive ? 'sidebarItem sidebarItemActive' : 'sidebarItem')}
      >
        <span className="sidebarIcon">{icon}</span>
        <span className="sidebarLabel">{label}</span>
      </NavLink>
    </li>
  )
}

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
        }) as React.CSSProperties
      }
    >
      <aside className={`sidebar ${collapsed ? 'sidebarCollapsed' : ''}`}>
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

        <div className="sidebarMenuTitle">Menu</div>
        <nav aria-label="Menu principal">
          <ul className="sidebarNavList">
            <NavItem to="/" end label="Dashboard" icon={<IconDashboard />} />
            <NavItem to="/transacoes" label="Transações" icon={<IconTx />} />
            <NavItem to="/categorias" label="Categorias" icon={<IconCategories />} />
            <NavItem to="/orcamentos" label="Orçamentos" icon={<IconBudgets />} />
          </ul>
        </nav>
      </aside>

      <main className="main">
        <div className={`topbar ${scrolled ? 'topbarScrolled' : ''}`}>
          <button
            type="button"
            className="collapseBtn"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            onClick={() => setCollapsed((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {collapsed ? (
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
          <div className="topbarSpacer" />
          <div className="topbarActions">
            <div className="topbarUser">{user?.name ?? 'Usuário'}</div>
            <button
              type="button"
              className="smallBtn"
              onClick={() => {
                logout()
                void navigate('/login', { replace: true })
              }}
            >
              Sair
            </button>
            <ThemeAppearance />
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

