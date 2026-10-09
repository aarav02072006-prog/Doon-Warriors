import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthProvider.jsx'
import { Spinner } from '@/components/ui/spinner.jsx'

export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}
