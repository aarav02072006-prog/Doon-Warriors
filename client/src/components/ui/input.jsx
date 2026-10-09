import React from 'react'
import { clsx } from 'clsx'

export function Input({
  label,
  error,
  id,
  className,
  containerClassName,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-ink-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full bg-card border border-line rounded-xl px-3.5 py-2.5 text-ink text-sm placeholder:text-ink-muted/65',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all',
          error && 'border-chilli focus:ring-chilli',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-chilli mt-0.5">{error}</span>}
    </div>
  )
}
