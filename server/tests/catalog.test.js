import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { ApiError } from '../src/utils/ApiError.js'

vi.mock('../src/services/catalog.service.js', () => ({
  catalogService: {
    searchProducts: vi.fn(async (query) => {
      if (query.fields === 'lite') {
        return {
          data: [
            {
              id: 'MEESHO_1',
              slug: 'saree-1',
              title: 'Beautiful Saree',
              price: 499,
              mrp: 999,
              discount_pct: 50,
              rating: 4.5,
              stock_available: 20,
            },
          ],
          meta: { page: 1, limit: 24, total: 1, totalPages: 1, facets: {} },
        }
      }
      return {
        data: [{ id: 'MEESHO_1', slug: 'saree-1', title: 'Beautiful Saree' }],
        meta: { page: 1, limit: 24, total: 1, totalPages: 1, facets: {} },
      }
    }),
    getProductBySlug: vi.fn(async (slug) => {
      if (slug === 'not-found') {
        throw new ApiError(404, 'Product not found', 'NOT_FOUND')
      }
      return { id: 'MEESHO_1', slug, title: 'Product 1' }
    }),
  },
}))

describe('Catalog API Tests', () => {
  it('GET /api/v1/health returns ok', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('ok')
  })

  it('GET /api/v1/products with invalid limit=abc returns 400 validation error', async () => {
    const res = await request(app).get('/api/v1/products?limit=abc')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('GET /api/v1/products?q=saree happy path', async () => {
    const res = await request(app).get('/api/v1/products?q=saree')
    expect(res.status).toBe(200)
    expect(res.body.data).toBeDefined()
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/v1/products/:slug returns 404 for missing product', async () => {
    const res = await request(app).get('/api/v1/products/not-found')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('GET /api/v1/products?fields=lite projection only contains allowed keys', async () => {
    const res = await request(app).get('/api/v1/products?fields=lite')
    expect(res.status).toBe(200)
    const item = res.body.data[0]
    const allowedKeys = ['id', 'slug', 'title', 'price', 'mrp', 'discount_pct', 'rating', 'stock_available']
    const keys = Object.keys(item)
    for (const key of keys) {
      expect(allowedKeys).toContain(key)
    }
  })
})
