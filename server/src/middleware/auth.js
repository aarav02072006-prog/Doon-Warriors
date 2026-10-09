import crypto from 'crypto'
import { supabase } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'

const tokenCache = new Map()

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token missing or malformed', 'UNAUTHORIZED')
    }

    const token = authHeader.split(' ')[1]
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const cached = tokenCache.get(tokenHash)
    if (cached && Date.now() < cached.expiry) {
      req.user = cached.user
      return next()
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED')
    }

    const userInfo = { id: user.id, email: user.email }
    tokenCache.set(tokenHash, { user: userInfo, expiry: Date.now() + 60000 })

    req.user = userInfo
    next()
  } catch (error) {
    next(error)
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const cached = tokenCache.get(tokenHash)
    if (cached && Date.now() < cached.expiry) {
      req.user = cached.user
      return next()
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      const userInfo = { id: user.id, email: user.email }
      tokenCache.set(tokenHash, { user: userInfo, expiry: Date.now() + 60000 })
      req.user = userInfo
    }
    next()
  } catch {
    next()
  }
}
