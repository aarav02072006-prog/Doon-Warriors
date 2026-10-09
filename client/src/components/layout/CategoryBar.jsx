import React, { useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient.js'
import { ChevronDown } from 'lucide-react'

export function CategoryBar() {
  const [activeCategory, setActiveCategory] = useState(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
    staleTime: 1000 * 60 * 10,
  })

  return (
    <nav aria-label="Categories" className="hidden md:block bg-card border-b border-line relative z-30">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="relative group"
            onMouseEnter={() => setActiveCategory(cat)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <Link
              to={`/c/${cat.slug}`}
              className="flex items-center gap-1 py-3 px-3 text-xs font-semibold text-ink hover:text-brand transition-colors whitespace-nowrap"
            >
              <span>{cat.name}</span>
              {cat.children && cat.children.length > 0 && (
                <ChevronDown className="w-3 h-3 text-ink-muted group-hover:text-brand transition-transform group-hover:rotate-180" />
              )}
            </Link>

            {activeCategory?.slug === cat.slug && cat.children && cat.children.length > 0 && (
              <div className="absolute top-full left-0 min-w-[220px] bg-card border border-line rounded-xl shadow-lg p-3 grid grid-cols-1 gap-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 pb-1 border-b border-line">
                  {cat.name} Subcategories
                </div>
                {cat.children.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/c/${cat.slug}/${sub.slug}`}
                    className="px-2.5 py-1.5 text-xs text-ink hover:bg-brand-soft hover:text-brand rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] text-ink-muted font-normal">({sub.product_count})</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
