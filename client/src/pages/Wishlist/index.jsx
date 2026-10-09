import React from 'react'
import { useWishlist } from '@/features/wishlist/hooks.js'
import { ProductGrid } from '@/components/ui/ProductGrid.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router'

export function WishlistPage() {
  const navigate = useNavigate()
  const { wishlist = [], isLoading } = useWishlist()

  const products = wishlist.map((w) => w.product).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <title>My Wishlist | magic.</title>
      <meta name="description" content="View and manage your saved items on Magic." />

      <h1 className="text-2xl font-bold font-display text-ink">My Wishlist ({products.length})</h1>
      {products.length === 0 && !isLoading ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save items you love by clicking the heart icon on products."
          actionLabel="Explore Catalog"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="space-y-6">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}
