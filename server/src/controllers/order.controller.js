import { orderService } from '../services/order.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createOrder = asyncHandler(async (req, res) => {
  const data = await orderService.createOrder(req.user.id, req.body)
  res.status(201).json({ data })
})

export const getOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getOrders(req.user.id)
  res.status(200).json({ data })
})

export const getOrderById = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderById(req.user.id, req.params.id)
  res.status(200).json({ data })
})
