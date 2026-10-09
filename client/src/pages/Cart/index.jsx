import React from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '@/features/cart/CartProvider.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Price } from '@/components/ui/price.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react'

export function CartPage() {
  const { items, updateQty, removeFromCart, subtotal, deliveryFee, total, totalCount } = useCart()
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <title>Shopping Cart | haat.</title>
      <meta name="description" content="View items in your Haat shopping cart and proceed to secure checkout." />

      <h1 className="text-2xl font-bold font-display text-ink">My Cart ({totalCount} items)</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="Explore our vast catalog and discover lowest wholesale prices."
          actionLabel="Start Shopping"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            {items.map(({ product, qty, size }) => (
              <div
                key={`${product.id}-${size}`}
                className="bg-card border border-line rounded-[16px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 aspect-4/5 rounded-xl bg-paper border border-line overflow-hidden shrink-0 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-ink-muted p-1 text-center">No Image</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Link to={`/p/${product.slug}`} className="text-sm font-bold text-ink hover:text-brand line-clamp-1">
                      {product.title}
                    </Link>
                    <p className="text-xs text-ink-muted">Brand: {product.brand}</p>
                    {size && <p className="text-xs font-semibold text-ink">Size: {size}</p>}
                    <Price price={product.price} mrp={product.mrp} discount={product.discount_pct} size="sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                  <div className="flex items-center border border-line rounded-xl bg-paper">
                    <button
                      type="button"
                      onClick={() => updateQty(product.id, size, qty - 1)}
                      className="px-3 py-1.5 text-ink hover:bg-line/40 rounded-l-xl font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-ink">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(product.id, size, qty + 1)}
                      className="px-3 py-1.5 text-ink hover:bg-line/40 rounded-r-xl font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id, size)}
                    className="text-chilli hover:opacity-80 p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 bg-card border border-line rounded-[16px] p-6 space-y-6 sticky top-24 shadow-xs">
            <h3 className="text-base font-bold font-display text-ink pb-3 border-b border-line">Order Summary</h3>

            <div className="space-y-3 text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-ink">
                  {deliveryFee === 0 ? <span className="text-leaf font-bold">FREE (Orders ≥ ₹299)</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-3 border-t border-line flex justify-between text-sm font-bold text-ink">
                <span>Total Amount</span>
                <span className="text-brand">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-ink-muted bg-paper p-3 rounded-xl border border-line">
              <ShieldCheck className="w-4 h-4 text-leaf shrink-0" />
              <span>Safe and secure payments. Easy returns & refunds.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
