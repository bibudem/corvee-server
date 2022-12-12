import { Router } from 'express'

import { linksController } from '../controllers/index.js'
import { jobParam } from '../../middlewares/jobParam.js'
import { parentParam } from '../../middlewares/parentParam.js'

export const linksRoutes = Router()

linksRoutes.patch('/:id', linksController.updateLink)
linksRoutes.get('/', jobParam, parentParam, linksController.getLinksByParent)
