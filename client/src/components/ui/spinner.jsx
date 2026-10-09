import React from 'react'
import { clsx } from 'clsx'

export function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-brand border-t-transparent',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  )
}
