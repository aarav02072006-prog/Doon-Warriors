import { z } from 'zod'

const indianPhoneRegex = /^[6-9]\d{9}$/
const pincodeRegex = /^[1-9][0-9]{5}$/

export const createOrderSchema = z.object({
  body: z.object({
    is_buy_now: z.boolean().default(false),
    buy_now_item: z.object({
      product_id: z.string().min(1),
      qty: z.number().int().min(1).max(10),
      size: z.string().default(''),
    }).optional().nullable(),
    payment_method: z.enum(['cod', 'upi', 'card', 'simulated']),
    address: z.object({
      name: z.string().min(1).max(100),
      phone: z.string().regex(indianPhoneRegex, 'Invalid Indian mobile number'),
      line1: z.string().min(1).max(200),
      line2: z.string().max(200).optional().nullable(),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      pincode: z.string().regex(pincodeRegex, 'Invalid 6-digit pincode'),
    }),
  }).strict(),
})

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
})
