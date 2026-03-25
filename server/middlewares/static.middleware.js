import { Router } from 'express'
import { staticCompressionMiddleware } from './compression.middleware.js'
import { setAllowedOrigin } from '../lib/headers.js'

export function staticMiddleware(root, options = {}) {
  const staticRouter = new Router()

  // staticRouter.use(cors())

  function setHeaders(res, path, stat) {
    if (res.req.originalUrl === `${res.app.locals.baseUrl}loader.js`) {
      res.removeHeader('Expires')
      res.removeHeader('Cache-Control')
      res.setHeader('Cache-Control', 'private, max-age=900') // 15min
    }
    setAllowedOrigin(res.req, res)
  }

  if (process.env.NODE_ENV.endsWith('production') && Reflect.has(options, 'compression')) {
    staticRouter.use(staticCompressionMiddleware(root, options.compression))
  }

  staticRouter.use(autopush(root, { ...options.staticAssetsOptions, setHeaders }))
  console.log(`Serving static files from ${root}`)

  return staticRouter
}
