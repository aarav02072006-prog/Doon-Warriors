import { z } from 'zod'

const indianPhoneRegex = /^[6-9]\d{9}$/
const pincodeRegex = /^[1-9][0-9]{5}$/

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(100).optional(),
    phone: z.string().regex(indianPhoneRegex, 'Invalid Indian mobile number').optional(),
  }).strict(),
})

export const addressSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(indianPhoneRegex, 'Invalid Indian mobile number'),
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    pincode: z.string().regex(pincodeRegex, 'Invalid 6-digit pincode'),
    is_default: z.boolean().default(false),
  }).strict(),
})

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().regex(indianPhoneRegex, 'Invalid Indian mobile number').optional(),
    line1: z.string().min(1).max(200).optional(),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    pincode: z.string().regex(pincodeRegex, 'Invalid 6-digit pincode').optional(),
    is_default: z.boolean().optional(),
  }).strict(),
})

export const addressIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
})

export const wishlistSchema = z.object({
  params: z.object({
    productId: z.string().min(1),
  }),
})

export const createReviewSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(80),
    body: z.string().min(10).max(1000),
  }).strict(),
})
