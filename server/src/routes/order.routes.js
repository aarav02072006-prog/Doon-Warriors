import { Router } from 'express'
import { createOrder, getOrders, getOrderById } from '../controllers/order.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createOrderSchema, orderIdSchema } from '../validations/order.validation.js'

const router = Router()

router.post('/', requireAuth, validate(createOrderSchema), createOrder)
router.get('/', requireAuth, getOrders)
router.get('/:id', requireAuth, validate(orderIdSchema), getOrderById)

export default router
