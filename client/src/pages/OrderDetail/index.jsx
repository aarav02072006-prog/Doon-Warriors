import React from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient.js'
import { Button } from '@/components/ui/button.jsx'
import { CheckCircle2, Package, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/format.js'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient(`/orders/${id}`),
  })

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-ink-muted">Loading order details...</div>
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h1 className="text-xl font-bold font-display text-ink">Order Not Found</h1>
        <Button variant="primary" onClick={() => navigate('/orders')}>View All Orders</Button>
      </div>
    )
  }

  const addr = order.address || {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <title>Order Confirmation | haat.</title>
      <meta name="description" content="View your order confirmation and details on Haat." />

      <div className="bg-card border border-line rounded-[24px] p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-leaf/10 text-leaf flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink">Order Placed Successfully!</h1>
        <p className="text-xs text-ink-muted bg-marigold/10 text-marigold font-bold px-4 py-2 rounded-full inline-block">
          Demo order only — no real payment has been processed.
        </p>
        <p className="text-xs text-ink-muted">Order ID: <span className="font-mono font-bold text-ink">{order.id}</span> • Placed on {formatDate(order.created_at)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-line rounded-[16px] p-6 space-y-3">
          <h3 className="text-sm font-bold font-display text-ink flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand" />
            <span>Delivery Address</span>
          </h3>
          <div className="text-xs text-ink-muted space-y-1">
            <p className="font-bold text-ink">{addr.name}</p>
            <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
            <p>Phone: {addr.phone}</p>
          </div>
        </div>

        <div className="bg-card border border-line rounded-[16px] p-6 space-y-3">
          <h3 className="text-sm font-bold font-display text-ink flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            <span>Payment & Totals</span>
          </h3>
          <div className="text-xs text-ink-muted space-y-1">
            <p><strong className="text-ink">Payment Method:</strong> {order.payment_method?.toUpperCase()} (Demo)</p>
            <p><strong className="text-ink">Subtotal:</strong> ₹{order.subtotal?.toLocaleString('en-IN')}</p>
            <p><strong className="text-ink">Delivery Fee:</strong> ₹{order.delivery_fee?.toLocaleString('en-IN')}</p>
            <p className="text-sm font-bold text-ink pt-1"><strong className="text-ink">Total Paid:</strong> ₹{order.total?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-line rounded-[16px] p-6 space-y-4">
        <h3 className="text-sm font-bold font-display text-ink">Ordered Items</h3>
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs p-3 bg-paper rounded-xl border border-line">
              <div>
                <p className="font-bold text-ink">{item.title}</p>
                {item.size && <p className="text-ink-muted">Size: {item.size}</p>}
                <p className="text-ink-muted">Qty: {item.qty}</p>
              </div>
              <span className="font-semibold text-ink">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/orders')}>
          View All Orders
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/search')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
