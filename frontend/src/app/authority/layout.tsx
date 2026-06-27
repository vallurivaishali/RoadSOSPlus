'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Map,
  AlertOctagon,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/authority', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/authority/incidents', label: 'Incident Management', icon: ClipboardList },
  { href: '/authority/analytics', label: 'Hotspot Analytics', icon: BarChart3 },
  { href: '/authority/risk-zones', label: 'Risk Zones', icon: AlertOctagon },
  { href: '/authority/map', label: 'Safety Map', icon: Map },
]

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex bg-slate-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          border-r border-amber-900/20
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo — authority variant uses amber accent */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-amber-900/20">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base">
              RoadSOS<span className="text-amber-400">+</span>
            </span>
            <p className="text-xs text-slate-500">Authority Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive(href, exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Authority badge + user */}
        <div className="px-3 py-4 border-t border-amber-900/20">
          <div className="px-3 py-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20 mb-3">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Road Safety Authority
            </p>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-amber-400">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/60 bg-slate-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">
            RoadSOS<span className="text-amber-400">+</span>
          </span>
        </header>

        <main className="flex-1 overflow-auto p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}
