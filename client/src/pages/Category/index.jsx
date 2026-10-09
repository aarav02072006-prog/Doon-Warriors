import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router'
import { useCategories, useInfiniteProducts } from '@/features/catalog/hooks.js'
import { ProductGrid } from '@/components/ui/ProductGrid.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Sheet } from '@/components/ui/sheet.jsx'
import { Filter, ArrowUpDown, X, ChevronRight, Check } from 'lucide-react'

export function CategoryPage() {
  const { category, sub } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: categories = [] } = useCategories()

  const currentCat = categories.find((c) => c.slug === category)
  const currentSub = currentCat?.children?.find((s) => s.slug === sub)

  const q = searchParams.get('q') || ''
  const brandParam = searchParams.get('brands') || ''
  const brands = brandParam ? brandParam.split(',') : []
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const minRating = searchParams.get('minRating') || ''
  const minDiscount = searchParams.get('minDiscount') || ''
  const inStock = searchParams.get('inStock') === 'true'
  const cod = searchParams.get('cod') === 'true'
  const sort = searchParams.get('sort') || 'popularity'

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')

  const queryParams = {
    category,
    subcategory: sub,
    q,
    brands: brandParam,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    minDiscount: minDiscount ? Number(minDiscount) : undefined,
    inStock,
    cod,
    sort,
    limit: 24,
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteProducts(queryParams)

  const allItems = data?.pages.flatMap((page) => page.data) || []
  const totalResults = data?.pages[0]?.meta?.total || 0
  const facets = data?.pages[0]?.meta?.facets || { brands: [], price: { min: 0, max: 10000 }, categories: [] }

  const sentinelRef = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const toggleBrand = (brandName) => {
    const updated = brands.includes(brandName)
      ? brands.filter((b) => b !== brandName)
      : [...brands, brandName]
    updateParam('brands', updated.join(','))
  }

  const clearAllFilters = () => {
    setSearchParams({})
  }

  const filteredBrands = facets.brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <title>{`${currentSub?.name || currentCat?.name || 'Category'} | haat.`}</title>
      <meta name="description" content={`Shop ${currentSub?.name || currentCat?.name || 'products'} at lowest wholesale prices on Haat.`} />

      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink font-semibold">{currentCat?.name || category}</span>
          {currentSub && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-ink font-semibold">{currentSub.name}</span>
            </>
          )}
        </nav>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold font-display text-ink">{currentSub?.name || currentCat?.name || 'Catalog'}</h1>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-muted">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-card border border-line rounded-xl px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <option value="popularity">Relevance / Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating: High to Low</option>
                <option value="rating_asc">Rating: Low to High</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
            <span className="text-xs font-semibold text-ink-muted">{totalResults.toLocaleString('en-IN')} products found</span>
          </div>
        </div>
      </div>

      <div className="md:hidden sticky top-14 z-20 bg-paper/95 backdrop-blur-md py-2.5 border-b border-line flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setIsFilterSheetOpen(true)}
        >
          <Filter className="w-4 h-4" />
          <span>Filters ({brands.length + (minPrice ? 1 : 0) + (minRating ? 1 : 0)})</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setIsSortSheetOpen(true)}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <aside className="hidden md:block md:col-span-3 sticky top-24 bg-card border border-line rounded-[16px] p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-sm font-bold font-display text-ink">Filters</h3>
            {(brands.length > 0 || minPrice || minRating || minDiscount || inStock || cod) && (
              <button type="button" onClick={clearAllFilters} className="text-xs text-brand hover:underline">
                Clear All
              </button>
            )}
          </div>

          {currentCat?.children && currentCat.children.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Subcategories</h4>
              <div className="space-y-1">
                {currentCat.children.map((subItem) => (
                  <Link
                    key={subItem.slug}
                    to={`/c/${currentCat.slug}/${subItem.slug}`}
                    className={`block px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      sub === subItem.slug ? 'bg-brand-soft text-brand font-bold' : 'text-ink hover:bg-line/40'
                    }`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {facets.brands.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Brands</h4>
              {facets.brands.length > 8 && (
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-paper border border-line rounded-xl px-3 py-1.5 text-xs text-ink"
                />
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {filteredBrands.map((b) => (
                  <label key={b.name} className="flex items-center justify-between text-xs text-ink cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={brands.includes(b.name)}
                        onChange={() => toggleBrand(b.name)}
                        className="rounded border-line text-brand focus:ring-brand"
                      />
                      <span>{b.name}</span>
                    </span>
                    <span className="text-[11px] text-ink-muted">({b.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Customer Rating</h4>
            <div className="space-y-1.5">
              {[{ label: '4★ & above', val: '4' }, { label: '3★ & above', val: '3' }].map((r) => (
                <label key={r.val} className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r.val}
                    onChange={() => updateParam('minRating', r.val)}
                    className="text-brand focus:ring-brand"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
              {minRating && (
                <button type="button" onClick={() => updateParam('minRating', '')} className="text-[11px] text-brand hover:underline">
                  Reset rating
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-line">
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="rounded border-line text-brand focus:ring-brand"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={cod}
                onChange={(e) => updateParam('cod', e.target.checked ? 'true' : '')}
                className="rounded border-line text-brand focus:ring-brand"
              />
              <span>COD Available</span>
            </label>
          </div>
        </aside>

        <div className="md:col-span-9 space-y-6">
          {(brands.length > 0 || minPrice || minRating || minDiscount || inStock || cod) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-muted">Active filters:</span>
              {brands.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
                  <span>{b}</span>
                  <button type="button" onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {minRating && (
                <span className="inline-flex items-center gap-1 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
                  <span>{minRating}★ & above</span>
                  <button type="button" onClick={() => updateParam('minRating', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
                  <span>In Stock</span>
                  <button type="button" onClick={() => updateParam('inStock', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {cod && (
                <span className="inline-flex items-center gap-1 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
                  <span>COD</span>
                  <button type="button" onClick={() => updateParam('cod', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button type="button" onClick={clearAllFilters} className="text-xs text-chilli hover:underline font-semibold ml-2">
                Clear all
              </button>
            </div>
          )}

          {allItems.length === 0 && !isLoading ? (
            <EmptyState
              title="No Products Found"
              description="Try adjusting your filters or search criteria."
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <ProductGrid products={allItems} isLoading={isLoading} />

              {hasNextPage && (
                <div className="text-center pt-8">
                  <Button variant="secondary" size="lg" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading more...' : 'Load More Products'}
                  </Button>
                </div>
              )}
              <div ref={sentinelRef} className="h-4" />
            </>
          )}
        </div>
      </div>

      <Sheet isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)} title="Filters">
        <div className="space-y-6 pb-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Brands</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {facets.brands.map((b) => (
                <label key={b.name} className="flex items-center justify-between text-xs text-ink cursor-pointer">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brands.includes(b.name)}
                      onChange={() => toggleBrand(b.name)}
                      className="rounded border-line text-brand focus:ring-brand"
                    />
                    <span>{b.name}</span>
                  </span>
                  <span className="text-[11px] text-ink-muted">({b.count})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-line">
            <Button variant="secondary" size="lg" className="flex-1" onClick={clearAllFilters}>
              Clear
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={() => setIsFilterSheetOpen(false)}>
              Show {totalResults} Results
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet isOpen={isSortSheetOpen} onClose={() => setIsSortSheetOpen(false)} title="Sort By">
        <div className="space-y-2 pb-6">
          {[
            { label: 'Relevance / Popularity', val: 'popularity' },
            { label: 'Price: Low to High', val: 'price_asc' },
            { label: 'Price: High to Low', val: 'price_desc' },
            { label: 'Rating: High to Low', val: 'rating_desc' },
            { label: 'Rating: Low to High', val: 'rating_asc' },
            { label: 'Name: A to Z', val: 'name_asc' },
            { label: 'Name: Z to A', val: 'name_desc' },
          ].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => { updateParam('sort', s.val); setIsSortSheetOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                sort === s.val ? 'bg-brand-soft text-brand font-bold' : 'text-ink hover:bg-paper'
              }`}
            >
              <span>{s.label}</span>
              {sort === s.val && <Check className="w-4 h-4 text-brand" />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
