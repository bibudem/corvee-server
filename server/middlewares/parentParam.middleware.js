import Boom from '@hapi/boom'

export function parentParam(req, res, next) {
  if (typeof req.query.parent === 'undefined') {
    return next(Boom.badData('Missing parent query parameter.'))
  }

  next()
}
