import React, { Component } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/toast.jsx'
import { AuthProvider } from '@/features/auth/AuthProvider.jsx'
import { LiteModeProvider } from '@/features/lite-mode/LiteModeProvider.jsx'
import { CartProvider } from '@/features/cart/CartProvider.jsx'
import { Button } from '@/components/ui/button.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-card border border-line rounded-[16px] my-8 max-w-lg mx-auto">
          <h2 className="text-xl font-bold font-display text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-ink-muted mb-6">An unexpected error occurred while loading this page.</p>
          <Button variant="primary" onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
            Retry
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <LiteModeProvider>
              {children}
            </LiteModeProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
