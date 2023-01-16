class MyURLSearchParams extends URLSearchParams {
  constructor(options) {
    super(options)
  }

  toString() {
    const string = super.toString()
    return string === '' ? '' : `?${string}`
  }
}

export function searchParamsMiddleware(params = []) {
  return (req, res, next) => {
    res.locals.searchParams = new MyURLSearchParams()
    params.forEach(param => req.query[param] && res.locals.searchParams.append(param, req.query[param]))
    next()
  }
}
