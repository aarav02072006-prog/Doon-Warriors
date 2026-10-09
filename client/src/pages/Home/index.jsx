import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useHome } from '@/features/catalog/hooks.js'
import { ProductCard } from '@/components/ui/ProductCard.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Sparkles, Zap, Tag, ShieldCheck, RefreshCw, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const { data: homeData } = useHome()
  const { flashDeals = [], topRated = [], bigDiscounts = [], under299 = [], categories = [] } = homeData || {}

  const [timeLeft, setTimeLeft] = useState('00:42:10')
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)
      const diff = Math.max(0, nextHour - now)
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')
      const mins = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0')
      const secs = Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
      setTimeLeft(`${hrs}:${mins}:${secs}`)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const scrollRail = (id, direction) => {
    const el = document.getElementById(id)
    if (el) {
      const scrollAmount = direction === 'left' ? -350 : 350
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      <title>Magic by Meesho — Bazaar Prices, Zero Hassle | Value E-Commerce</title>
      <meta name="description" content="Shop lakhs of top-quality products across ethnic wear, electronics, and home decor at lowest wholesale prices with fast delivery and COD." />

      <section className="bg-card border border-line rounded-[24px] p-6 sm:p-12 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand-soft px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Magic by Meesho Platform</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-ink tracking-tight leading-tight">
            Bazaar prices.{' '}
            <span className="relative whitespace-nowrap">
              <span>Zero hassle.</span>
              <svg className="absolute -bottom-2 left-0 w-full text-marigold" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5C50 2 150 2 199 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-base text-ink-muted">
            Direct from trusted suppliers across Bharat. Unmatched wholesale rates, zero delivery fees on top picks, and secure COD.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/search')}>
              Explore Catalog
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/search?minDiscount=50')}>
              Mega Discounts
            </Button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-4">
          {categories.slice(0, 4).map((cat) => {
            const heroImg = cat.image_url
            return (
              <Link
                key={cat.slug}
                to={`/c/${cat.slug}`}
                className="relative overflow-hidden border border-line rounded-2xl p-6 flex flex-col justify-between hover:border-brand transition-all group aspect-square shadow-xs bg-card"
              >
                {heroImg ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={heroImg}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold z-10">
                    {cat.name[0]}
                  </div>
                )}
                <div className={`relative z-10 ${heroImg ? 'mt-auto text-white' : ''}`}>
                  <h3 className={`text-base font-bold font-display ${heroImg ? 'text-white' : 'text-ink'} group-hover:text-brand`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs ${heroImg ? 'text-white/80' : 'text-ink-muted'}`}>
                    {cat.product_count || 100}+ products
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="lg:hidden flex gap-3 overflow-x-auto no-scrollbar py-2">
          {categories.slice(0, 6).map((cat) => {
            const heroImg = cat.image_url
            return (
              <Link
                key={cat.slug}
                to={`/c/${cat.slug}`}
                className="relative overflow-hidden border border-line rounded-xl p-4 min-w-[130px] h-[130px] flex flex-col justify-end text-center shrink-0 group bg-card"
              >
                {heroImg ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={heroImg}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                ) : null}
                <span className={`relative z-10 text-xs font-bold truncate w-full ${heroImg ? 'text-white' : 'text-ink'}`}>
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-ink">
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-leaf" />
          <span>Lowest Prices Guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-brand" />
          <span>Easy 7/15 Day Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-marigold" />
          <span>100% Safe COD Available</span>
        </div>
      </section>

      {flashDeals.length > 0 && (
        <section className="bg-[#FEF3D6]/60 border border-marigold/30 rounded-[20px] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-marigold text-white flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-ink">Flash Deals</h2>
                <p className="text-xs text-ink-muted">Mega price drop on top items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card border border-line px-4 py-2 rounded-xl text-xs font-bold text-ink tabular-nums">
              <span>Ends in</span>
              <span className="text-chilli font-extrabold">{timeLeft}</span>
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => scrollRail('flash-rail', 'left')}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div id="flash-rail" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
              {flashDeals.map((product) => (
                <div key={product.id} className="min-w-[200px] sm:min-w-[220px] shrink-0">
                  <ProductCard product={product} />
                  <div className="mt-2 space-y-1 bg-card/80 p-2.5 rounded-xl border border-line">
                    <div className="flex justify-between text-[11px] font-semibold text-ink-muted">
                      <span>Stock Status</span>
                      <span className="text-chilli">Only {product.stock_available} left</span>
                    </div>
                    <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-chilli h-full rounded-full"
                        style={{ width: `${Math.min(100, (product.stock_available / 3) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollRail('flash-rail', 'right')}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/c/${cat.slug}`}
              className="relative overflow-hidden bg-card border border-line rounded-[16px] p-4 text-center flex flex-col items-center justify-center gap-2.5 hover:border-brand transition-all group shadow-xs aspect-square"
            >
              {cat.image_url ? (
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-brand-soft text-brand flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shadow-xs z-10">
                  {cat.name[0]}
                </div>
              )}
              <div className={`relative z-10 mt-auto w-full ${cat.image_url ? 'text-white' : 'text-ink'}`}>
                <span className="text-xs font-bold truncate block">
                  {cat.name}
                </span>
                <span className={`text-[10px] ${cat.image_url ? 'text-white/80' : 'text-ink-muted'}`}>{cat.product_count || 50}+ items</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-ink">Pocket-Friendly (Under ₹299)</h2>
          <Link to="/search?maxPrice=299" className="text-xs font-bold text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollRail('under299-rail', 'left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div id="under299-rail" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
            {under299.map((product) => (
              <div key={product.id} className="min-w-[200px] sm:min-w-[220px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollRail('under299-rail', 'right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-ink">Biggest Discounts (50% Off & Above)</h2>
          <Link to="/search?minDiscount=50" className="text-xs font-bold text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollRail('discount-rail', 'left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div id="discount-rail" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
            {bigDiscounts.map((product) => (
              <div key={product.id} className="min-w-[200px] sm:min-w-[220px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollRail('discount-rail', 'right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-ink">Top Rated Favorites (4★ & Above)</h2>
          <Link to="/search?minRating=4" className="text-xs font-bold text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => scrollRail('toprated-rail', 'left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div id="toprated-rail" className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
            {topRated.map((product) => (
              <div key={product.id} className="min-w-[200px] sm:min-w-[220px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollRail('toprated-rail', 'right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-line shadow-md items-center justify-center text-ink hover:bg-paper"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
