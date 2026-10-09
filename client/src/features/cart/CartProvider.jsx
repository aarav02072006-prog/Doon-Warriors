import React, { createContext, useContext, useEffect, useState } from 'react'
import { get, set } from 'idb-keyval'
import { useToast } from '@/components/ui/toast.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    get('haat_cart').then((saved) => {
      if (saved && Array.isArray(saved)) {
        setItems(saved)
      }
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (isLoaded) {
      set('haat_cart', items).catch(() => {})
    }
  }, [items, isLoaded])

  const addToCart = (product, qty = 1, size = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      )
      if (existingIndex > -1) {
        const copy = [...prev]
        const newQty = Math.min(10, copy[existingIndex].qty + qty)
        copy[existingIndex] = { ...copy[existingIndex], qty: newQty }
        return copy
      }
      return [...prev, { product, qty, size }]
    })
  }

  const removeFromCart = (productId, size = '') => {
    setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)))
    addToast({ title: 'Item removed from cart', variant: 'info' })
  }

  const updateQty = (productId, size = '', qty) => {
    if (qty <= 0) {
      removeFromCart(productId, size)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, qty: Math.min(10, qty) }
          : item
      )
    )
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 0) * item.qty, 0)
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 49
  const total = subtotal + deliveryFee
  const totalCount = items.reduce((sum, item) => sum + item.qty, 0)

  const value = {
    items,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    totalCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
