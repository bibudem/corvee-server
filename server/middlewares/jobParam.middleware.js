export function jobParamMiddleware(req, res, next) {
  req.job = req.query.job ?? req.userConfig.currentJob
  next()
}
