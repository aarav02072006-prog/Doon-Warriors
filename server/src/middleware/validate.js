import { ApiError } from '../utils/ApiError.js'

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      if (parsed.body) {
        req.body = parsed.body
      }
      if (parsed.query) {
        for (const key of Object.keys(req.query)) {
          delete req.query[key]
        }
        Object.assign(req.query, parsed.query)
      }
      if (parsed.params) {
        for (const key of Object.keys(req.params)) {
          delete req.params[key]
        }
        Object.assign(req.params, parsed.params)
      }
      next()
    } catch (error) {
      const details = error.errors?.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })) || error.message
      next(new ApiError(400, 'Validation Error', 'VALIDATION_ERROR', details))
    }
  }
}
