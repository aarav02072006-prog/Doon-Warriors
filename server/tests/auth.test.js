import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

vi.mock('../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token) => {
        if (token === 'valid-token') {
          return { data: { user: { id: 'user-uuid-123', email: 'test@example.com' } }, error: null }
        }
        return { data: { user: null }, error: { message: 'Invalid token' } }
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(async () => ({ data: { id: 'user-uuid-123', full_name: 'Test User' }, error: null })),
    })),
  },
}))

describe('Auth Middleware & User API Tests', () => {
  it('GET /api/v1/me without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('GET /api/v1/me with invalid token returns 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/v1/me')
      .set('Authorization', 'Bearer invalid-token')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('GET /api/v1/me with valid token returns user profile', async () => {
    const res = await request(app)
      .get('/api/v1/me')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('user-uuid-123')
  })
})
