import React, { useMemo, useState } from 'react'
import {
  Shirt,
  ShoppingBag,
  Watch,
  Smartphone,
  Home,
  Sparkles,
  BookOpen,
  Package,
} from 'lucide-react'

const categoryTints = [
  'bg-[#F6E4EF] text-[#8E1F6F]',
  'bg-[#FEF3D6] text-[#B45309]',
  'bg-[#E6F4EA] text-[#2E7D5B]',
  'bg-[#FCE8E6] text-[#C2410C]',
  'bg-[#E0F2FE] text-[#0369A1]',
  'bg-[#F3E8FF] text-[#7E22CE]',
  'bg-[#FEE2E2] text-[#B91C1C]',
  'bg-[#FEF9C3] text-[#A16207]',
  'bg-[#CCFBF1] text-[#0F766E]',
  'bg-[#FFEDD5] text-[#C2410C]',
  'bg-[#F1F5F9] text-[#475569]',
  'bg-[#FCE7F3] text-[#BE185D]',
]

function getHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getSubcategoryIcon(subcatSlug = '') {
  const s = subcatSlug.toLowerCase()
  if (s.includes('kurti') || s.includes('saree') || s.includes('ethnic') || s.includes('clothing')) return Shirt
  if (s.includes('bag') || s.includes('footwear') || s.includes('shoe')) return ShoppingBag
  if (s.includes('watch') || s.includes('band')) return Watch
  if (s.includes('electronic') || s.includes('mobile') || s.includes('gadget')) return Smartphone
  if (s.includes('home') || s.includes('decor') || s.includes('kitchen')) return Home
  if (s.includes('beauty') || s.includes('makeup')) return Sparkles
  if (s.includes('book')) return BookOpen
  return Package
}

export const ProductArt = React.memo(function ProductArt({
  id = 'prod_1',
  categorySlug = 'general',
  brand = 'Haat',
  title = 'Product',
  imageUrl = null,
  className = '',
}) {
  const tryRemote = import.meta.env.VITE_TRY_REMOTE_IMAGES === 'true'
  const [hasImageError, setHasImageError] = useState(false)

  const hash = useMemo(() => getHash(id), [id])
  const tintIndex = hash % categoryTints.length
  const tintClass = categoryTints[tintIndex]

  const IconComponent = useMemo(() => getSubcategoryIcon(categorySlug), [categorySlug])

  const shapes = useMemo(() => {
    const list = []
    const count = (hash % 2) + 2
    for (let i = 0; i < count; i++) {
      const shapeHash = hash + i * 37
      const left = (shapeHash % 70) + 15
      const top = ((shapeHash >> 3) % 70) + 15
      const size = (shapeHash % 30) + 20
      const opacity = ((shapeHash % 4) + 1) * 0.08
      list.push({ id: i, left, top, size, opacity })
    }
    return list
  }, [hash])

  if (tryRemote && imageUrl && !hasImageError) {
    return (
      <div className={`relative w-full aspect-4/5 overflow-hidden bg-line/20 rounded-t-xl ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          width="300"
          height="375"
          onError={() => setHasImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full aspect-4/5 overflow-hidden rounded-t-[14px] flex flex-col justify-between p-4 ${tintClass} ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {shapes.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-current"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 bg-white/50 backdrop-blur-xs px-2 py-0.5 rounded-full">
          {categorySlug.replace(/-/g, ' ')}
        </span>
      </div>

      <div className="relative z-10 my-auto flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-xs shadow-sm flex items-center justify-center">
          <IconComponent className="w-8 h-8 opacity-80" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-tight uppercase opacity-80 truncate max-w-[80%]">
          {brand}
        </span>
        <Sparkles className="w-3.5 h-3.5 opacity-50" />
      </div>
    </div>
  )
})
