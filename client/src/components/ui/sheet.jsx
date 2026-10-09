import React, { useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { IconButton } from './button.jsx'

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}) {
  const sheetRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className={clsx(
          'relative w-full max-w-lg bg-card border border-line rounded-t-[20px] sm:rounded-[20px] p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <h2 className="text-lg font-bold text-ink font-display">{title}</h2>
          <IconButton
            icon={X}
            label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
