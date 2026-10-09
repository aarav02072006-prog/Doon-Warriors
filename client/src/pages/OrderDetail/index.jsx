import React from 'react'
import { useParams } from 'react-router'

export function OrderDetailPage() {
  const { id } = useParams()
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold font-display text-ink mb-2">Order Details</h1>
      <p className="text-sm text-ink-muted">Order ID: {id}</p>
    </div>
  )
}
