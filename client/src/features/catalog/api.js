import { apiClient } from '@/lib/apiClient.js'
import { supabase } from '@/lib/supabase.js'

export async function fetchHome() {
  return apiClient('/home')
}

export async function fetchCategories() {
  return apiClient('/categories')
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      query.append(key, value)
    }
  }

  const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to fetch products')
  }
  return json // returns { data, meta }
}

export async function fetchSuggest(q) {
  if (!q || q.length < 2) return []
  return apiClient(`/products/suggest?q=${encodeURIComponent(q)}`)
}
