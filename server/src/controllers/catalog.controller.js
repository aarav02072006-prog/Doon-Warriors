import { catalogService } from '../services/catalog.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function setCatalogCacheHeaders(res) {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
}

export const getCategories = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const data = await catalogService.getCategories()
  res.status(200).json({ data })
})

export const getHome = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const data = await catalogService.getHome()
  res.status(200).json({ data })
})

export const searchProducts = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const result = await catalogService.searchProducts(req.query)
  res.status(200).json({ data: result.data, meta: result.meta })
})

export const getProductSuggest = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const data = await catalogService.getProductSuggest(req.query.q)
  res.status(200).json({ data })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const data = await catalogService.getProductBySlug(req.params.slug)
  res.status(200).json({ data })
})

export const getProductReviews = asyncHandler(async (req, res) => {
  setCatalogCacheHeaders(res)
  const result = await catalogService.getProductReviews(req.params.slug, req.query)
  res.status(200).json({ data: result.data, meta: result.meta })
})
