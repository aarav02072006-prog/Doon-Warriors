import React from 'react'
import { Outlet } from 'react-router'
import { Header } from '@/components/layout/Header.jsx'
import { CategoryBar } from '@/components/layout/CategoryBar.jsx'
import { BottomNav } from '@/components/layout/BottomNav.jsx'
import { Footer } from '@/components/layout/Footer.jsx'

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Header />
      <CategoryBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
