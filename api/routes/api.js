import { Router } from 'express'
import { linksRoutes } from './links.route.js'
import { sectionsRoutes } from './sections.route.js'
import { settingsRoutes } from './settings.route.js'
import { jobsRoutes } from './jobs.route.js'
import { jobParam } from '../../middlewares/jobParam.middleware.js'

const router = Router()

router.use('/links', jobParam, linksRoutes)
router.use('/sections', jobParam, sectionsRoutes)
router.use('/settings', settingsRoutes)
router.use('/jobs', jobsRoutes)

export default router
