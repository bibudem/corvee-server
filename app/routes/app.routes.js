import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import sirv from 'sirv'
import config from 'config'
import { homeRoutes } from './home.route.js'
import { sectionRoute } from './section.route.js'
import { jobsMiddleware } from '../../middlewares/jobs.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
const assets = sirv(resolve(__dirname, '..', 'public'), {
  maxAge: 31536000, // 1Y
  immutable: true,
})

router.use(assets)

//
// Middlewares
//

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

router.use(/^\/$/, homeRoutes)

export default router
