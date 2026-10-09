import React from 'react'
import { clsx } from 'clsx'
import { Star } from 'lucide-react'

export function Rating({
  rating = 4.5,
  count = 0,
  compact = false,
  className,
}) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold tabular-nums',
        rating >= 4 ? 'bg-leaf/10 text-leaf' : 'bg-marigold/15 text-marigold',
        className
      )}
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      <span className="flex items-center gap-0.5">
        <span>{rating.toFixed(1)}</span>
        <Star className="w-3.5 h-3.5 fill-current" />
      </span>
      {!compact && count > 0 && (
        <span className="text-ink-muted font-normal text-[11px]">
          ({count.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  )
}
