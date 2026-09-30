import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { useAuthStore } from '../stores/authStore'

const links = [
  { to: '/dashboard', label: 'Dashboard', mark: 'D' },
  { to: '/patients', label: 'Patients', mark: 'P' },
  { to: '/appointments', label: 'Appointments', mark: 'A' },
]

export default function AuthenticatedLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white px-4 py-6 lg:flex">
        <NavLink className="flex items-center gap-3 px-3" to="/dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">C</span>
          <span className="text-sm font-bold tracking-[0.18em]">CLINICFLOW</span>
        </NavLink>
        <p className="mb-3 mt-12 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">
          {links.map((link) => <NavigationLink key={link.to} {...link} />)}
        </nav>
        <div className="mt-auto border-t border-zinc-100 pt-5">
          <div className="mb-3 flex items-center gap-3 px-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{user?.name || user?.email || 'Clinic user'}</p>
              {user?.name && <p className="truncate text-xs text-zinc-500">{user.email}</p>}
            </div>
          </div>
          <Button className="w-full justify-start" variant="ghost" onClick={handleLogout}>Log out</Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <NavLink className="flex items-center gap-2 text-xs font-bold tracking-[0.16em]" to="/dashboard">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">C</span>
              CLINICFLOW
            </NavLink>
            <Button variant="ghost" className="h-9 px-3" onClick={handleLogout}>Log out</Button>
          </div>
          <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-3 py-2">
            {links.map((link) => <NavigationLink key={link.to} {...link} compact />)}
          </nav>
        </header>
        <div className="hidden h-16 items-center justify-end border-b border-zinc-200/80 bg-white px-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{user?.name || user?.email || 'Clinic user'}</p>
              {user?.name && <p className="text-xs text-zinc-500">{user.email}</p>}
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

function NavigationLink({ to, label, mark, compact = false }) {
  return (
    <NavLink
      className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${compact ? '' : 'w-full'} ${isActive ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'}`}
      to={to}
    >
      <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${compact ? 'bg-zinc-100' : 'bg-zinc-100'}`}>{mark}</span>
      {label}
    </NavLink>
  )
}
