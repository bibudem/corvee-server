import { Router } from 'express'

import { statsController } from '../controllers/index.js'

export const statsRoutes = Router()

statsRoutes.get('/error-codes/:errorCode', statsController.getByErrorCodeDetails)
statsRoutes.get('/error-codes', statsController.getByErrorCodeSummary)
