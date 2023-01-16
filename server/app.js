import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import http2Express from 'http2-express-bridge'
import autopush from 'http2-express-autopush'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import sirv from 'sirv'
import moment from 'moment'
import { create } from 'express-handlebars'
import handlebarHelpers from 'handlebars-helpers'
import 'express-async-errors'

import establishDbConnection from './api/database/connection.js'
import appRoutes from './app/routes/app.routes.js'
import apiRoutes from './api/routes/api.js'
import { headersMiddleware } from './middlewares/headers.middleware.js'
import { staticMiddleware } from './middlewares/static.middleware.js'
import { userConfigMiddleware } from './middlewares/user-config.middleware.js'
import pkg from '../package.json' assert {type: 'json'}
import config from 'config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const staticDir = resolve(__dirname, '..', process.env.NODE_ENV.endsWith('production') ? 'build' : 'dev')
const publicDir = resolve(__dirname, 'app', 'public')
const staticAssetsOptions = Object.assign({}, config.get('server.staticAssetsOptions'))

// Default date lang
moment.locale('fr-CA')

export const app = http2Express(express)

const hbs = create({
  extname: '.hbs',
})

handlebarHelpers({ handlebars: hbs.handlebars })

try {
  await establishDbConnection()
} catch (error) {
  console.error(error)
}

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', resolve(__dirname, 'app', 'views'))
app.disable('x-powered-by')
// app.disable('etag')

app.locals.version = pkg.version
app.locals.description = config.get('app.description')
app.locals.baseUrl = (new URL(config.get('app.baseUrl'), 'http://a')).pathname

app.use(cookieParser())
app.use(express.json())

app.use(headersMiddleware())
app.use(cors())

app.use(staticMiddleware(staticDir, { staticAssetsOptions, compression: { exts: ['js', 'css', 'map'] }, encodings: ['br', 'gzip', 'deflate'] }))
app.use(staticMiddleware(publicDir, { staticAssetsOptions }))

app.use(userConfigMiddleware)

app.use('/api', apiRoutes)

app.use(appRoutes)


// app.use(
//   sirv(resolve(__dirname, 'build'), {
//     maxAge: 1_200, // 20 min
//   })
// )
