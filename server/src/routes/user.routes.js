import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  createReview,
} from '../controllers/user.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  addressIdSchema,
  wishlistSchema,
  createReviewSchema,
} from '../validations/user.validation.js'

const router = Router()

router.get('/me', requireAuth, getProfile)
router.patch('/me', requireAuth, validate(updateProfileSchema), updateProfile)

router.get('/me/addresses', requireAuth, getAddresses)
router.post('/me/addresses', requireAuth, validate(addressSchema), addAddress)
router.patch('/me/addresses/:id', requireAuth, validate(updateAddressSchema), updateAddress)
router.delete('/me/addresses/:id', requireAuth, validate(addressIdSchema), deleteAddress)

router.get('/me/wishlist', requireAuth, getWishlist)
router.put('/me/wishlist/:productId', requireAuth, validate(wishlistSchema), addToWishlist)
router.delete('/me/wishlist/:productId', requireAuth, validate(wishlistSchema), removeFromWishlist)

router.post('/products/:slug/reviews', requireAuth, validate(createReviewSchema), createReview)

export default router
