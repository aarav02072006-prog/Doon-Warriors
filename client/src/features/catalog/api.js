import { apiClient } from '@/lib/apiClient.js'

export async function fetchHome() {
  return apiClient('/home')
}

export async function fetchCategories() {
  return apiClient('/categories')
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  }
  return apiClient(`/products?${query.toString()}`)
}

export async function fetchSuggest(q) {
  if (!q || q.length < 2) return []
  return apiClient(`/products/suggest?q=${encodeURIComponent(q)}`)
}
