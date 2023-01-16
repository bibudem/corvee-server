import Boom from '@hapi/boom'
import { countLinksForSection, getPagesForSection } from '../models/sections.model.js'

const filterableProps = ['action', 'extern']

export const sectionsController = {
  getPagesBySection: async (req, res, next) => {
    const sectionKey = req.query.section
    const job = req.query.job

    if (sectionKey === undefined) {
      return next(Boom.badData(`Missing section param.`))
    }
    try {
      const pages = await getPagesForSection({ sectionKey, job })

      res.json(pages)
    } catch (error) {
      throw error
    }
  },
  countLinks: async (req, res, next) => {
    const sectionKey = req.query.section
    const job = req.query.job
    const filters = filterableProps.reduce((filters, filterKey) => {
      if (req.query[filterKey]) {
        filters[filterKey] = req.query[filterKey]
      }
      return filters
    }, {})

    try {
      const count = await countLinksForSection({ sectionKey, job, filters })
      res.json(count)
    } catch (error) {
      console.error(error)
      next(error)
    }
  },
}
