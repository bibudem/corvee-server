import { inspect } from 'node:util'
import Boom from '@hapi/boom'
import config from 'config'
import { getJobs } from '../models/jobs.model.js'

export const jobsController = {
  getJobs: async (req, res, next) => {
    try {
      const jobs = await getJobs()
      res.json(jobs)
    } catch (error) {
      console.error(`Error finding jobs: ${error}`)
      next(error)
    }
  },
}
