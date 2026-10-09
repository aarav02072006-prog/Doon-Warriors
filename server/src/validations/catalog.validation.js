import { z } from 'zod'

export const searchProductsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    brands: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    minRating: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    minDiscount: z.string().regex(/^\d+$/).transform(Number).optional(),
    inStock: z.enum(['true', 'false', '1', '0']).transform((val) => val === 'true' || val === '1').optional(),
    cod: z.enum(['true', 'false', '1', '0']).transform((val) => val === 'true' || val === '1').optional(),
    sort: z.enum([
      'relevance',
      'price_asc',
      'price_desc',
      'rating',
      'rating_desc',
      'rating_asc',
      'name_asc',
      'name_desc',
      'discount',
      'newest',
      'popularity',
    ]).optional(),
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('24').transform((v) => Math.min(Number(v), 48)),
    fields: z.enum(['full', 'lite']).default('full'),
  }),
})

export const suggestSchema = z.object({
  query: z.object({
    q: z.string().min(2, 'Query must be at least 2 characters'),
  }),
})

export const slugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
})

export const reviewsSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    sort: z.enum(['recent', 'helpful', 'rating_high', 'rating_low']).default('recent'),
  }),
})
