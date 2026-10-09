import React from 'react'
import { clsx } from 'clsx'

export function Skeleton({ variant = 'block', className, width, height }) {
  const baseClasses = 'animate-pulse bg-line/60 rounded'

  if (variant === 'text') {
    return (
      <div
        className={clsx(baseClasses, 'h-4 w-full rounded-sm my-1', className)}
        style={{ width }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx(
          'bg-card border border-line rounded-[14px] p-4 flex flex-col gap-3',
          className
        )}
      >
        <div className="w-full h-40 bg-line/60 rounded-lg animate-pulse" />
        <div className="h-4 bg-line/60 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-line/60 rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className={clsx(baseClasses, className)}
      style={{ width, height }}
    />
  )
}
