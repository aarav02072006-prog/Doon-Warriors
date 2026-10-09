import React from 'react'
import { clsx } from 'clsx'
import { Spinner } from './spinner.jsx'

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

  const variants = {
    primary:
      'bg-brand text-white hover:bg-brand/90 active:bg-brand/95 shadow-sm',
    secondary:
      'bg-card border border-line text-ink hover:bg-paper active:bg-line/40',
    ghost:
      'bg-transparent text-ink hover:bg-line/30 active:bg-line/50',
    danger:
      'bg-chilli text-white hover:bg-chilli/90 active:bg-chilli/95',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-xl min-h-[44px]',
    lg: 'text-base px-6 py-3 rounded-2xl min-h-[48px]',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
  }

  return (
    <Button
      variant={variant}
      size="sm"
      aria-label={label}
      className={clsx('rounded-full !px-0 flex items-center justify-center', sizeClasses[size], className)}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
    </Button>
  )
}
