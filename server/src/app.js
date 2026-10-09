import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import pinoHttp from 'pino-http'
import pino from 'pino'
import { env } from './config/env.js'
import healthRoutes from './routes/health.routes.js'
import catalogRoutes from './routes/catalog.routes.js'
import userRoutes from './routes/user.routes.js'
import orderRoutes from './routes/order.routes.js'
import seoRoutes from './routes/seo.routes.js'
import { globalLimiter, authLimiter } from './middleware/rateLimit.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
})

const app = express()

app.set('trust proxy', 1)

// Security & performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "https://images.meesho.com"],
      connectSrc: ["'self'", "https:"],
    },
  },
}))
app.use(compression())

const allowedOrigins = env.CLIENT_ORIGINS.split(',').map((o) => o.trim())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: false,
  })
)

app.use(express.json({ limit: '100kb' }))
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      if (res.writableEnded === false) return 'debug'
      return 'info'
    },
    customSuccessMessage: (req, res) => {
      if (res.writableEnded === false) return 'request aborted by client'
      return 'request completed'
    },
  })
)

// Global rate limiter
app.use(globalLimiter)

// Root SEO routes
app.use('/', seoRoutes)

// API v1 Routes
app.use('/api/v1/health', healthRoutes)
app.use('/api/v1', catalogRoutes)
app.use('/api/v1', authLimiter, userRoutes)
app.use('/api/v1/orders', authLimiter, orderRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

export default app
