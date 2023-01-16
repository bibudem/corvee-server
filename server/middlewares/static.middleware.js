import { Router } from 'express'
import autopush from 'http2-express-autopush'
import onHeaders from 'on-headers'
import { staticCompressionMiddleware } from './compression.middleware.js'

export function staticMiddleware(root, options = {}) {
  const staticRouter = new Router()

  function setHeaders(res, path, stat) {
    if (res.req.originalUrl === `${res.app.locals.baseUrl}loader.js`) {
      res.removeHeader('Expires')
      res.setHeader('Cache-Control', 'private, max-age=900') // 15min
      res.setHeader('ETag', `W/"${stat.size}-${stat.mtime.getTime()}"`)
    } else {
      onHeaders(res, () => {
        res.removeHeader('date')
      })
    }
  }

  if (process.env.NODE_ENV.endsWith('production') && Reflect.has(options, 'compression')) {
    staticRouter.use(staticCompressionMiddleware(root, options.compression))
  }

  staticRouter.use(autopush(root, { ...options.staticAssetsOptions, setHeaders }))
  console.log(`Serving static files from ${root}`)

  return staticRouter
}
