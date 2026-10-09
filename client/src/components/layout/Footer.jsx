import React from 'react'

export function Footer() {
  return (
    <footer className="bg-card border-t border-line py-8 px-4 text-center text-xs text-ink-muted mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Magic by Meesho. Made for Bharat with warmth & speed.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ink transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-ink transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-ink transition-colors">Bharat Lite Mode</a>
        </div>
      </div>
    </footer>
  )
}
