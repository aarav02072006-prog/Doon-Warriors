import React, { useState } from 'react'

export const ProductArt = React.memo(function ProductArt({
  title = 'Product',
  imageUrl = null,
  brand = 'Haat',
  className = '',
}) {
  const [hasImageError, setHasImageError] = useState(false)

  if (imageUrl && !hasImageError) {
    return (
      <div className={`relative w-full aspect-4/5 overflow-hidden bg-line/20 rounded-t-[14px] ${className}`}>
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
    <div className={`relative w-full aspect-4/5 overflow-hidden rounded-t-[14px] bg-brand-soft border-b border-line flex flex-col items-center justify-center p-4 text-brand ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-wider mb-1 opacity-80">{brand}</span>
      <span className="text-xs font-bold text-center line-clamp-2 max-w-[95%] text-ink font-display">
        {title}
      </span>
    </div>
  )
})
