import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient.js'
import { useToast } from '@/components/ui/toast.jsx'

export function useWishlist() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient('/me/wishlist'),
    staleTime: 1000 * 60 * 5,
  })

  const wishlistedIds = new Set((wishlist || []).map((w) => w.product_id))

  const addMutation = useMutation({
    mutationFn: (productId) => apiClient(`/me/wishlist/${productId}`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      addToast({ title: 'Added to Wishlist', variant: 'success' })
    },
    onError: (err) => {
      addToast({ title: 'Please sign in to manage wishlist', description: err.message, variant: 'error' })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (productId) => apiClient(`/me/wishlist/${productId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      addToast({ title: 'Removed from Wishlist', variant: 'info' })
    },
    onError: (err) => {
      addToast({ title: 'Error updating wishlist', description: err.message, variant: 'error' })
    },
  })

  const isWishlisted = (productId) => wishlistedIds.has(productId)

  const toggleWishlist = (productId) => {
    if (isWishlisted(productId)) {
      removeMutation.mutate(productId)
    } else {
      addMutation.mutate(productId)
    }
  }

  return {
    wishlist,
    isWishlisted,
    toggleWishlist,
    isLoading: addMutation.isPending || removeMutation.isPending,
  }
}
