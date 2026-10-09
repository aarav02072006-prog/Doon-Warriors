import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { App } from './App.jsx'
import { RouteErrorBoundary } from './providers.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { RequireAuth } from '@/features/auth/RequireAuth.jsx'

const HomePage = lazy(() => import('@/pages/Home/index.jsx').then(m => ({ default: m.HomePage })))
const CategoryPage = lazy(() => import('@/pages/Category/index.jsx').then(m => ({ default: m.CategoryPage })))
const SearchPage = lazy(() => import('@/pages/Search/index.jsx').then(m => ({ default: m.SearchPage })))
const ProductPage = lazy(() => import('@/pages/Product/index.jsx').then(m => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('@/pages/Cart/index.jsx').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/Checkout/index.jsx').then(m => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('@/pages/Orders/index.jsx').then(m => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetail/index.jsx').then(m => ({ default: m.OrderDetailPage })))
const AccountPage = lazy(() => import('@/pages/Account/index.jsx').then(m => ({ default: m.AccountPage })))
const WishlistPage = lazy(() => import('@/pages/Wishlist/index.jsx').then(m => ({ default: m.WishlistPage })))
const AuthPage = lazy(() => import('@/pages/Auth/index.jsx').then(m => ({ default: m.AuthPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFound/index.jsx').then(m => ({ default: m.NotFoundPage })))

const StyleguidePage = import.meta.env.DEV
  ? lazy(() => import('@/pages/Styleguide/index.jsx').then(m => ({ default: m.StyleguidePage })))
  : null

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Skeleton variant="block" height="200px" className="w-full rounded-[20px]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  )
}

const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary><NotFoundPage /></RouteErrorBoundary>,
    children: [
      {
        index: true,
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><HomePage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'c/:category',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><CategoryPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'c/:category/:sub',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><CategoryPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'search',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'p/:slug',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><ProductPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'cart',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><CartPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'checkout',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><CheckoutPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'orders',
        element: (
          <RouteErrorBoundary>
            <RequireAuth>
              <Suspense fallback={<PageSkeleton />}><OrdersPage /></Suspense>
            </RequireAuth>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RouteErrorBoundary>
            <RequireAuth>
              <Suspense fallback={<PageSkeleton />}><OrderDetailPage /></Suspense>
            </RequireAuth>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'account',
        element: (
          <RouteErrorBoundary>
            <RequireAuth>
              <Suspense fallback={<PageSkeleton />}><AccountPage /></Suspense>
            </RequireAuth>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <RouteErrorBoundary>
            <RequireAuth>
              <Suspense fallback={<PageSkeleton />}><WishlistPage /></Suspense>
            </RequireAuth>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'login',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><AuthPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      {
        path: 'auth',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><AuthPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
      ...(StyleguidePage
        ? [
            {
              path: 'styleguide',
              element: (
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}><StyleguidePage /></Suspense>
                </RouteErrorBoundary>
              ),
            },
          ]
        : []),
      {
        path: '*',
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<PageSkeleton />}><NotFoundPage /></Suspense>
          </RouteErrorBoundary>
        ),
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
