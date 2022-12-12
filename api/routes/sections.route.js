import { Router } from 'express'

import { sectionsController } from '../controllers/index.js'

export const sectionsRoutes = Router()

sectionsRoutes.get('/count', sectionsController.countLinks)
sectionsRoutes.get(/^\/$/, sectionsController.getPagesBySection)
