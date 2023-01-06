import { resolve, extname } from 'node:path'
import Accepts from '@hapi/accept'
import onHeaders from 'on-headers'
import vary from 'vary'
import mime from 'mime-types'
import glob from 'glob'

/**
 * Module variables.
 * @private
 */

const cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/

const compressionMethodToFileExt = {
  br: 'br',
  gzip: 'gz',
  deflate: 'zz',
}

/**
 * Determine if the entity should be transformed.
 * @private
 */

function shouldTransform(req, res) {
  var cacheControl = res.getHeader('Cache-Control')

  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl || !cacheControlNoTransformRegExp.test(cacheControl)
}

export function staticCompressionMiddleware(root, options = {}) {
  const rootDir = resolve(root)
  const exts = options.exts || ['js', 'css', 'map']
  const methods = options.methods || ['br', 'gzip', 'deflate']

  const assets = glob.sync(`**/*.{${exts.join(',')}}`, { cwd: rootDir }).map(file => `/${file}`)

  const threshold = 1024

  return function compression(req, res, next) {
    if (!assets.includes(req.url)) {
      return next()
    }

    if (!shouldTransform(req, res)) {
      return next()
    }

    // vary
    vary(res, 'Accept-Encoding')

    // content-length below threshold
    if (Number(res.getHeader('Content-Length')) < threshold) {
      return next()
    }

    var encoding = res.getHeader('Content-Encoding') || 'identity'

    // already encoded
    if (encoding !== 'identity') {
      return next()
    }

    // head
    if (req.method === 'HEAD') {
      return next()
    }

    const method = Accepts.encoding(req.get('Accept-Encoding'), [...methods, 'identity'])

    // negotiation failed
    if (method === 'identity') {
      return next()
    }

    const contentType = mime.contentType(extname(req.url))
    req.url = `${req.url}.${compressionMethodToFileExt[method]}`

    onHeaders(res, function onResponseHeaders() {
      res.setHeader('Content-Encoding', method)
      res.setHeader('Content-Type', contentType)
    })

    next()
  }
}
