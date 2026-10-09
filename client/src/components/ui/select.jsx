import React from 'react'
import { clsx } from 'clsx'

export function Select({
  label,
  error,
  id,
  options = [],
  className,
  containerClassName,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-ink-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full bg-card border border-line rounded-xl px-3.5 py-2.5 text-ink text-sm appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3Y2.0%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B6272%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer',
          error && 'border-chilli focus:ring-chilli',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-chilli mt-0.5">{error}</span>}
    </div>
  )
}
