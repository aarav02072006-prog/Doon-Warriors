import { asyncHandler } from '../utils/asyncHandler.js'

export const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      time: new Date().toISOString(),
    },
  })
})
