import { supabase } from './supabase.js'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function apiClient(endpoint, options = {}) {
  const { headers = {}, body, method = 'GET', ...customOptions } = options

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const config = {
    method,
    ...customOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const url = `${API_BASE}${endpoint}`
  let response

  try {
    response = await fetchWithTimeout(url, config)
  } catch (err) {
    if (method === 'GET') {
      try {
        response = await fetchWithTimeout(url, config)
      } catch (retryErr) {
        throw new ApiError(retryErr.name === 'AbortError' ? 'Request timed out' : 'Network error', 0, 'NETWORK_ERROR')
      }
    } else {
      throw new ApiError(err.name === 'AbortError' ? 'Request timed out' : 'Network error', 0, 'NETWORK_ERROR')
    }
  }

  let json = {}
  try {
    json = await response.json()
  } catch {
    // ignore
  }

  if (!response.ok) {
    const errorMsg = json.error?.message || response.statusText || 'Something went wrong'
    throw new ApiError(errorMsg, response.status, json.error?.code, json.error?.details)
  }

  return json.data
}
