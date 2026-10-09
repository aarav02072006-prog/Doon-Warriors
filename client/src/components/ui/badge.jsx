import React from 'react'
import { clsx } from 'clsx'

export function Badge({
  variant = 'neutral',
  children,
  className,
  ...props
}) {
  const variants = {
    brand: 'bg-brand-soft text-brand border border-brand/20',
    success: 'bg-leaf/10 text-leaf border border-leaf/20',
    warning: 'bg-marigold/15 text-marigold border border-marigold/30',
    chilli: 'bg-chilli/10 text-chilli border border-chilli/20',
    neutral: 'bg-line/40 text-ink-muted border border-line',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-[999px] tracking-wide',
        variants[variant] || variants.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
