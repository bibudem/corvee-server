import onHeaders from 'on-headers'

export function headersMiddleware() {
  return function headersMiddleware(req, res, next) {
    res.removeHeader('Connection')
    res.set('Strict-Transport-Security', 'max-age=31536000') // 1y

    onHeaders(res, function () {
      this.removeHeader('vary')
    })

    next()
  }
}
