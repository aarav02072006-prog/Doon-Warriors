import { userService } from '../services/user.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.user.id)
  res.status(200).json({ data })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.user.id, req.body)
  res.status(200).json({ data })
})

export const getAddresses = asyncHandler(async (req, res) => {
  const data = await userService.getAddresses(req.user.id)
  res.status(200).json({ data })
})

export const addAddress = asyncHandler(async (req, res) => {
  const data = await userService.addAddress(req.user.id, req.body)
  res.status(201).json({ data })
})

export const updateAddress = asyncHandler(async (req, res) => {
  const data = await userService.updateAddress(req.user.id, req.params.id, req.body)
  res.status(200).json({ data })
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const data = await userService.deleteAddress(req.user.id, req.params.id)
  res.status(200).json({ data })
})

export const getWishlist = asyncHandler(async (req, res) => {
  const data = await userService.getWishlist(req.user.id)
  res.status(200).json({ data })
})

export const addToWishlist = asyncHandler(async (req, res) => {
  const data = await userService.addToWishlist(req.user.id, req.params.productId)
  res.status(200).json({ data })
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const data = await userService.removeFromWishlist(req.user.id, req.params.productId)
  res.status(200).json({ data })
})

export const createReview = asyncHandler(async (req, res) => {
  const data = await userService.createReview(req.user.id, req.user.email, req.params.slug, req.body)
  res.status(201).json({ data })
})
