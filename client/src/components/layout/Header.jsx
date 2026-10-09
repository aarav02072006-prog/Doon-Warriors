import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { SearchBox } from './SearchBox.jsx'
import { ShoppingBag, Heart, User } from 'lucide-react'
import { IconButton } from '@/components/ui/button.jsx'
import { useCart } from '@/features/cart/CartProvider.jsx'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { totalCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 bg-card/95 backdrop-blur-md transition-shadow duration-200 ${
        isScrolled ? 'shadow-md border-b border-line' : 'border-b border-line'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-extrabold font-display text-ink tracking-tight">
            magic<span className="text-brand">.</span>
          </span>
          <span className="text-[10px] bg-brand-soft text-brand font-semibold px-2 py-0.5 rounded-[999px] hidden sm:inline-block ml-1">
            Magic by Meesho
          </span>
        </Link>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-2">
          <Link to="/wishlist">
            <IconButton icon={Heart} label="Wishlist" variant="ghost" size="md" />
          </Link>
          <Link to="/cart" className="relative">
            <IconButton icon={ShoppingBag} label="Cart" variant="ghost" size="md" />
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </Link>
          <Link to="/account">
            <IconButton icon={User} label="Account" variant="ghost" size="md" />
          </Link>
        </div>
      </div>

      <div className="md:hidden px-4 pb-2.5 pt-1">
        <SearchBox />
      </div>
    </header>
  )
}
