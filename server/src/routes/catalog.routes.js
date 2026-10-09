import { Router } from 'express'
import {
  getCategories,
  getHome,
  searchProducts,
  getProductSuggest,
  getProductBySlug,
  getProductReviews,
} from '../controllers/catalog.controller.js'
import { validate } from '../middleware/validate.js'
import { suggestLimiter } from '../middleware/rateLimit.js'
import {
  searchProductsSchema,
  suggestSchema,
  slugSchema,
  reviewsSchema,
} from '../validations/catalog.validation.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/home', getHome)
router.get('/products', validate(searchProductsSchema), searchProducts)
router.get('/products/suggest', suggestLimiter, validate(suggestSchema), getProductSuggest)
router.get('/products/:slug', validate(slugSchema), getProductBySlug)
router.get('/products/:slug/reviews', validate(reviewsSchema), getProductReviews)

export default router
