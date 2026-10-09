import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { apiClient } from '@/lib/apiClient.js'
import { Button } from '@/components/ui/button.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { Package, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/format.js'

export function OrdersPage() {
  const navigate = useNavigate()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient('/orders'),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <title>My Orders | haat.</title>
      <meta name="description" content="View your order history and status on Haat." />

      <h1 className="text-2xl font-bold font-display text-ink">My Orders ({orders.length})</h1>

      {orders.length === 0 && !isLoading ? (
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Start exploring our catalog!"
          actionLabel="Explore Catalog"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-card border border-line rounded-[16px] p-5 hover:border-brand transition-all shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-line pb-3">
                <div>
                  <span className="font-bold text-ink">Order ID: {order.id}</span>
                  <span className="text-ink-muted ml-3">{formatDate(order.created_at)}</span>
                </div>
                <span className="bg-leaf/10 text-leaf font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-ink-muted">
                    {order.order_items?.length || 0} items • Paid via {order.payment_method?.toUpperCase()}
                  </p>
                  <p className="text-sm font-bold text-ink mt-0.5">₹{order.total?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-brand">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
