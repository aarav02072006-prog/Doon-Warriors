import React from 'react'
import { NavLink } from 'react-router'
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react'

export function BottomNav() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/c/women-ethnic', label: 'Categories', icon: Grid },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/cart', label: 'Cart', icon: ShoppingBag },
    { to: '/account', label: 'Account', icon: User },
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-line px-2 py-1 pb-[env(safe-area-inset-bottom)] flex justify-around items-center shadow-lg"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center py-1.5 px-3 rounded-xl text-xs font-medium transition-colors ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          <Icon className="w-5 h-5 mb-1" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
