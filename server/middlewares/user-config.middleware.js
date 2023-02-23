import { userConfig } from '../lib/user-config.js'

export async function userConfigMiddleware(req, res, next) {
  req.userConfig = userConfig
  req.userConfig.loadConfig(req, res)

  next()
}
