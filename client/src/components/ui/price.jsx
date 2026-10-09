import React from 'react'
import { clsx } from 'clsx'

export function Price({
  price,
  mrp,
  discount,
  size = 'md',
  className,
}) {
  const formatRupee = (amt) => `₹${Number(amt).toLocaleString('en-IN')}`

  const sizeClasses = {
    sm: 'text-sm gap-1.5',
    md: 'text-lg gap-2',
    lg: 'text-2xl gap-2.5',
  }

  const calcDiscount = discount || (mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0)

  return (
    <div className={clsx('flex items-baseline flex-wrap tabular-nums font-display font-bold', sizeClasses[size], className)}>
      <span className="text-ink">{formatRupee(price)}</span>
      {mrp && mrp > price && (
        <span className="text-xs sm:text-sm text-ink-muted line-through font-normal">
          {formatRupee(mrp)}
        </span>
      )}
      {calcDiscount > 0 && (
        <span className="text-[11px] sm:text-xs font-bold text-marigold bg-marigold/10 px-1.5 py-0.5 rounded-md">
          {calcDiscount}% off
        </span>
      )}
    </div>
  )
}
