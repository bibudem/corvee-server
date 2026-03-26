import cors from 'cors'
import config from 'config'

const corsOptions = {
  origin: config.get('server.allowedOrigins'),
  methods: ['GET', 'POST', 'OPTIONS'],
}
export function corsMiddleware() {
  return cors(corsOptions)
}