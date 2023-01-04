export function jobParam(req, res, next) {
  req.query.job = req.query.job ? req.query.job : req.userConfig.currentJob
  next()
}
