import { Router } from 'express'
import cors from 'cors'
import onHeaders from 'on-headers'
import { linksRoutes } from './links.route.js'
import { sectionsRoutes } from './sections.route.js'
import { settingsRoutes } from './settings.route.js'
import { jobsRoutes } from './jobs.route.js'
import { statsRoutes } from './stats.route.js'
import { jobParamMiddleware } from '../../middlewares/jobParam.middleware.js'

const router = Router()

//
// Middlewares
//

// router.use(cors())
router.use((req, res, next) => {
  res.header('Cache-Control', 'no-store')
  onHeaders(res, function () {
    res.removeHeader('etag')
    // res.removeHeader('access-control-allow-origin')
  })
  next()
})

//
// Routes
//

router.use('/links', jobParamMiddleware, linksRoutes)
router.use('/stats', jobParamMiddleware, statsRoutes)
router.use('/sections', jobParamMiddleware, sectionsRoutes)
router.use('/settings', settingsRoutes)
router.use('/jobs', jobsRoutes)

export default router
