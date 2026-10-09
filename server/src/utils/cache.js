class MemoryCache {
  constructor(maxSize = 500, defaultTTL = 300000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.value
  }

  set(key, value, ttl = this.defaultTTL) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }

  clear() {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()

export function cacheMiddleware(ttlMs = 300000) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next()
    const key = req.originalUrl || req.url
    const cached = memoryCache.get(key)
    if (cached) {
      return res.status(200).json(cached)
    }
    
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      if (res.statusCode === 200) {
        memoryCache.set(key, body, ttlMs)
      }
      return originalJson(body)
    }
    next()
  }
}
