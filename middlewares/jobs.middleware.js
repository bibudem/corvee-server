import { getJobs } from '../api/models/jobs.model.js'

export async function jobsMiddleware(req, res, next) {
  const jobs = await getJobs()
  req.jobs = {
    current: req.userConfig.currentJob,
    ...jobs,
  }
  next()
}
