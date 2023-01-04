import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import http2Express from 'http2-express-bridge'
import autopush from 'http2-express-autopush'
import cookieParser from 'cookie-parser'
import sirv from 'sirv'
import moment from 'moment'
import { create } from 'express-handlebars'
import handlebarHelpers from 'handlebars-helpers'
import 'express-async-errors'
import cors from 'cors'

import appRoutes from './app/routes/app.routes.js'
import establishDbConnection from './api/database/connection.js'
import apiRoutes from './api/routes/api.js'
import { userConfigMiddleware } from './middlewares/user-config.middleware.js'
import { compression } from './middlewares/compression.middleware.js'
import pkg from './package.json' assert {type: 'json'}
import config from 'config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const staticDir = process.env.NODE_ENV.endsWith('production') ? 'build' : 'dev'

// Default date lang
moment.locale('fr-CA')

export const app = http2Express(express)

const hbs = create({
  extname: '.hbs',
})

handlebarHelpers({ handlebars: hbs.handlebars })

await establishDbConnection()

app.locals.version = pkg.version
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'app/views')
app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.disable('x-powered-by')

if (process.env.NODE_ENV.endsWith('production')) {
  app.use(compression(resolve(__dirname, staticDir)))
}

app.use(autopush(resolve(__dirname, staticDir), Object.assign({}, config.get('server.staticAssetsOptions'))))

// app.use(express.static(resolve(__dirname, staticDir)))
console.log(`Serving static files from ${resolve(__dirname, staticDir, pkg.version)}`)

app.use(userConfigMiddleware)

app.use('/api', apiRoutes)

app.use(appRoutes)

// app.use(
//   sirv(resolve(__dirname, 'build'), {
//     maxAge: 1_200, // 20 min
//   })
// )
