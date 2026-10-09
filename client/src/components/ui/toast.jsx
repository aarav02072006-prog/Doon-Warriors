import React, { createContext, useContext, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, description, variant = 'success', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-leaf shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-chilli shrink-0" />,
            info: <Info className="w-5 h-5 text-brand shrink-0" />,
          }

          const borderColors = {
            success: 'border-leaf/30 bg-card',
            error: 'border-chilli/30 bg-card',
            info: 'border-brand/30 bg-card',
          }

          return (
            <div
              key={toast.id}
              className={clsx(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-right duration-200',
                borderColors[toast.variant] || borderColors.info
              )}
            >
              {icons[toast.variant] || icons.info}
              <div className="flex-1">
                {toast.title && (
                  <h4 className="text-sm font-bold text-ink font-display">
                    {toast.title}
                  </h4>
                )}
                {toast.description && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-ink-muted hover:text-ink transition-colors"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
