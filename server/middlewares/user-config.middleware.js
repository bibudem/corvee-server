import { userConfig } from '../lib/user-config.js'

export async function userConfigMiddleware(req, res, next) {
  req.userConfig = userConfig
  req.userConfig.loadConfig(req, res)

  // if (req.job) {
  //   userConfig.currentJob = req.job
  //   userConfig.harvestDate = req.job
  // }

  next()
}
