import test from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import app from '../src/app.js'

test('GET /api/v1/health returns ok', async () => {
  const res = await request(app).get('/api/v1/health')
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.status, 'ok')
})

test('GET /api/v1/products with invalid limit returns 400', async () => {
  const res = await request(app).get('/api/v1/products?limit=abc')
  assert.strictEqual(res.status, 400)
  assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR')
})

test('GET /api/v1/me without token returns 401', async () => {
  const res = await request(app).get('/api/v1/me')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.error.code, 'UNAUTHORIZED')
})
