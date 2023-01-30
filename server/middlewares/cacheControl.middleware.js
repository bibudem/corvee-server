export function noCache(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate')
  next()
}
