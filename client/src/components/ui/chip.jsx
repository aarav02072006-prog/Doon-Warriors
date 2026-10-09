import React from 'react'
import { clsx } from 'clsx'

export function Chip({
  selected = false,
  onClick,
  children,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-[999px] transition-all cursor-pointer border',
        selected
          ? 'bg-brand text-white border-brand shadow-sm'
          : 'bg-card text-ink border-line hover:border-brand/50 active:bg-line/30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
