import Boom from '@hapi/boom'
import { getByParent, update } from '../models/links.model.js'

export const linksController = {
  getLinksByParent: async (request, response, next) => {
    const parent = request.query.parent
    const job = request.job

    try {
      const reports = await getByParent({ parent, job })
      response.json(reports)
    } catch (error) {
      throw error
      // next(Boom.boomify(error))
    }
  },
  updateLink: async (request, response) => {
    const _id = request.params.id
    const data = request.body

    try {
      const result = await update({ _id, data })
      response.json(result)
    } catch (error) {
      throw error
      // next(Boom.boomify(error))
    }
  },
}
