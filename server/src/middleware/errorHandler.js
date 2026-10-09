export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error')

  if (req.log) {
    req.log.error({ err }, message)
  } else {
    console.error(err)
  }

  const responseBody = {
    error: {
      code,
      message,
      ...(err.details && { details: err.details }),
    },
  }

  res.status(statusCode).json(responseBody)
}
