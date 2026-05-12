import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import HamburgerIcon from './HamburgerIcon'
import { IconCategories, IconCharts, IconDashboard, IconGoals, IconTx } from './SidebarIcons'

function NavItem({ to, label, icon, end }: { to: string; label: string; icon: ReactNode; end?: boolean }) {
  return (
    <li>
      <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'sidebarItem sidebarItemActive' : 'sidebarItem')}>
        <span className="sidebarIcon">{icon}</span>
        <span className="sidebarLabel">{label}</span>
      </NavLink>
    </li>
  )
}

export default function SidebarNav({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <>
      <div className="sidebarMenuTitle">Menu</div>
      <nav aria-label="Menu principal">
        <ul className="sidebarNavList">
          <li className="sidebarToggleItem">
            <button
              type="button"
              className="sidebarItem sidebarToggleBtn"
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              onClick={onToggle}
            >
              <span className="sidebarIcon">
                <HamburgerIcon open={!collapsed} />
              </span>
              <span className="sidebarLabel">Menu</span>
            </button>
          </li>
          <NavItem to="/" end label="Dashboard" icon={<IconDashboard />} />
          <NavItem to="/transacoes" label="Transações" icon={<IconTx />} />
          <NavItem to="/categorias" label="Categorias" icon={<IconCategories />} />
          <NavItem to="/objetivos" label="Objetivos" icon={<IconGoals />} />
          <NavItem to="/graficos" label="Gráficos" icon={<IconCharts />} />
        </ul>
      </nav>
    </>
  )
}
