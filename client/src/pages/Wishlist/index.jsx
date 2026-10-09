import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient.js'
import { ProductGrid } from '@/components/ui/ProductGrid.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router'

export function WishlistPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/me/wishlist'),
  })

  const removeMutation = useMutation({
    mutationFn: (productId) => apiClient(`/me/wishlist/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      addToast({ title: 'Removed from Wishlist', variant: 'info' })
    },
  })

  const products = wishlist.map((w) => w.product).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <title>My Wishlist | haat.</title>
      <meta name="description" content="View and manage your saved items on Haat." />

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
