import { Router } from 'express'

import { settingsController } from '../controllers/index.js'

export const settingsRoutes = Router()

settingsRoutes.get('/', settingsController.index)
