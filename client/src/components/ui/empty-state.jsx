import React from 'react'
import { clsx } from 'clsx'
import { PackageOpen } from 'lucide-react'
import { Button } from './button.jsx'

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try checking back later or adjusting your filters.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 bg-card border border-line rounded-[14px] my-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-ink mb-1 font-display">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
