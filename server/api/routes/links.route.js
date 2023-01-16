import { Router } from 'express'

import { linksController } from '../controllers/index.js'
import { parentParam } from '../../middlewares/parentParam.middleware.js'

export const linksRoutes = Router()

linksRoutes.patch('/:id', linksController.updateLink)
linksRoutes.get('/', parentParam, linksController.getLinksByParent)
