import { Router } from 'express'

import { jobsController } from '../controllers/index.js'

export const jobsRoutes = Router()

jobsRoutes.get('/', jobsController.getJobs)
