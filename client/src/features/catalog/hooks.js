import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchHome, fetchCategories, fetchProducts, fetchSuggest } from './api.js'

export function useHome() {
  return useQuery({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  })
}

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
  })
}

export function useInfiniteProducts(params = {}) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', params],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta || {}
      return page < totalPages ? page + 1 : undefined
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
  })
}

export function useSuggest(q) {
  return useQuery({
    queryKey: ['suggest', q],
    queryFn: () => fetchSuggest(q),
    enabled: Boolean(q && q.length >= 2),
    staleTime: 1000 * 60,
  })
}
