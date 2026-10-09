import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useCart } from '@/features/cart/CartProvider.jsx'
import { apiClient } from '@/lib/apiClient.js'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { MapPin, IndianRupee } from 'lucide-react'

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const buyNowItem = location.state?.buyNowItem

  const { items: cartItems, subtotal: cartSubtotal, total: cartTotal } = useCart()

  const items = buyNowItem ? [{ product: buyNowItem.product, qty: buyNowItem.qty, size: buyNowItem.size }] : cartItems
  const subtotal = buyNowItem ? (buyNowItem.product.price * buyNowItem.qty) : cartSubtotal
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 49
  const total = subtotal + deliveryFee

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isLoading, setIsLoading] = useState(false)

  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    if (items.length === 0 && !buyNowItem) {
      navigate('/cart', { replace: true })
    }
    apiClient('/me/addresses')
      .then((addrs) => {
        setAddresses(addrs || [])
        const def = addrs?.find((a) => a.is_default) || addrs?.[0]
        if (def) {
          setSelectedAddressId(def.id)
          setAddressForm({
            name: def.name,
            phone: def.phone,
            line1: def.line1,
            line2: def.line2 || '',
            city: def.city,
            state: def.state,
            pincode: def.pincode,
          })
        }
      })
      .catch(() => {})
  }, [items, buyNowItem, navigate])

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        is_buy_now: Boolean(buyNowItem),
        buy_now_item: buyNowItem ? {
          product_id: buyNowItem.product.id,
          qty: buyNowItem.qty,
          size: buyNowItem.size || '',
        } : null,
        payment_method: paymentMethod === 'simulated' ? 'upi' : 'cod',
        address: addressForm,
      }

      const order = await apiClient('/orders', {
        method: 'POST',
        body: payload,
      })

      addToast({ title: 'Order Placed Successfully!', description: `Order ID: ${order.id}`, variant: 'success' })
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      addToast({ title: 'Checkout Failed', description: err.message, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <title>Secure Checkout | haat.</title>
      <meta name="description" content="Complete your secure demo checkout on Haat." />

      <h1 className="text-2xl font-bold font-display text-ink">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-line rounded-[16px] p-6 space-y-4">
            <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              <span>Delivery Address</span>
            </h2>

            {addresses.length > 0 && (
              <div className="space-y-2 pb-4 border-b border-line">
                <span className="text-xs font-semibold text-ink-muted">Select saved address:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id ? 'border-brand bg-brand-soft font-semibold' : 'border-line bg-paper'
                      }`}
                    >
                      <p className="font-bold text-ink">{addr.name}</p>
                      <p className="text-ink-muted">{addr.line1}, {addr.city} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
              />
              <Input
                label="Phone Number (Indian Mobile)"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <Input
              label="Address Line 1"
              required
              value={addressForm.line1}
              onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
            />
            <Input
              label="Address Line 2 (Optional)"
              value={addressForm.line2 || ''}
              onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
              <Input
                label="State"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              />
              <Input
                label="Pincode"
                required
                maxLength={6}
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-card border border-line rounded-[16px] p-6 space-y-4">
            <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-brand" />
              <span>Demo Payment Method</span>
            </h2>
            <div className="space-y-3">
              {[
                { id: 'cod', label: 'Cash on Delivery (Demo)' },
                { id: 'simulated', label: 'Simulated Online Payment / UPI / Card (Demo)' },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-3 p-3 bg-paper rounded-xl border border-line cursor-pointer text-xs font-semibold text-ink">
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand focus:ring-brand"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-card border border-line rounded-[16px] p-6 space-y-6 sticky top-24 shadow-xs">
          <h3 className="text-base font-bold font-display text-ink pb-3 border-b border-line">Order Summary ({items.length} items)</h3>

          <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
            {items.map(({ product, qty, size }) => (
              <div key={`${product.id}-${size}`} className="flex justify-between items-center text-xs">
                <span className="text-ink truncate max-w-[70%]">{product.title} (x{qty})</span>
                <span className="font-semibold text-ink">₹{(product.price * qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs text-ink-muted pt-3 border-t border-line">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-ink">
                {deliveryFee === 0 ? <span className="text-leaf font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="pt-3 border-t border-line flex justify-between text-sm font-bold text-ink">
              <span>Total Payable</span>
              <span className="text-brand">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            isLoading={isLoading}
          >
            <span>Place Demo Order</span>
          </Button>

          <p className="text-[10px] text-ink-muted text-center">
            Demo order only — no real payment has been processed.
          </p>
        </div>
      </form>
    </div>
  )
}
