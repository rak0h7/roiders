import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-text-secondary hover:text-text"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-semibold">ROIDERS.CLUB</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border flex justify-around py-2 px-1 z-40">
          {[
            { to: '/', label: 'Home' },
            { to: '/cycles', label: 'Cycles' },
            { to: '/bloodwork', label: 'Labs' },
            { to: '/library', label: 'Library' },
            { to: '/profile', label: 'Profile' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[10px] text-text-secondary hover:text-accent px-2 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="lg:hidden h-14" />
      </div>
    </div>
  )
}