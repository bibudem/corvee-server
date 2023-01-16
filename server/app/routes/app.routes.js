import { Router } from 'express'
import config from 'config'
import { homeRoute } from './home.route.js'
import { sectionRoute } from './section.route.js'
import { searchParamsMiddleware } from '../../middlewares/searchParams.middleware.js'
import { jobParamMiddleware } from '../../middlewares/jobParam.middleware.js'
import { jobsMiddleware } from '../../middlewares/jobs.middleware.js'

const sections = config
  .get('job.sections')
  .map(section => section.sections)
  .flat()
  .reduce(
    (sections, section) => ({
      ...sections,
      [`/sections/${section.key}`]: section,
    }),
    {}
  )

const router = Router()

//
// Middlewares
//

router.use(searchParamsMiddleware(['job']))
router.use(jobParamMiddleware)
router.use(jobsMiddleware)

//
// /section/:section route
//

router.use(
  Object.keys(sections),
  (req, res, next) => {
    req.section = sections[req.baseUrl]
    next()
  },
  sectionRoute
)

//
// / route
//

router.use(/^\/$/, homeRoute)

export default router
