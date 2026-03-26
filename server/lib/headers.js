import config from 'config'

export const setAllowedOrigin = (req, res) => {
  const allowedOrigins = config.get('server.allowedOrigins') || []
  const origin = allowedOrigins.includes('*') ? '*' : allowedOrigins.find(allowedOrigin => allowedOrigin === req.headers.origin)

  if (origin) {
    res.removeHeader('Access-Control-Allow-Origin')
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
}
