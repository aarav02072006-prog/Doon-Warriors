import React from 'react'
import { clsx } from 'clsx'
import { ProductCard } from './ProductCard.jsx'
import { Skeleton } from './skeleton.jsx'

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-line rounded-[14px] overflow-hidden flex flex-col">
      <Skeleton variant="block" className="w-full aspect-4/5 bg-line/50" />
      <div className="p-3.5 space-y-3">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="70%" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="text" width="40%" height="20px" />
          <Skeleton variant="text" width="30%" height="20px" />
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ products = [], isLoading = false, skeletonCount = 8, className }) {
  if (isLoading) {
    return (
      <div
        className={clsx(
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const validProducts = (products || []).filter((p) => p && typeof p === 'object' && p.id)

  return (
    <div
      className={clsx(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5',
        className
      )}
    >
      {validProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
