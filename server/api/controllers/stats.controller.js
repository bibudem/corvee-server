import Boom from '@hapi/boom'
import { getByErrorCodeSummary, getByErrorCodeDetails } from '../models/stats.model.js'

export const statsController = {
  getByErrorCodeSummary: async (request, response, next) => {
    const job = request.job

    try {
      const stats = await getByErrorCodeSummary({ job })
      response.json(stats)
    } catch (error) {
      throw error
      // next(Boom.boomify(error))
    }
  },
  getByErrorCodeDetails: async (request, response, next) => {
    const job = request.job
    const errorCode = request.params.errorCode

    try {
      const stats = await getByErrorCodeDetails({ job, errorCode })
      response.json(stats)
    } catch (error) {
      throw error
      // next(Boom.boomify(error))
    }
  },
}
