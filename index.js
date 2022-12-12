import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cookieParser from 'cookie-parser'
import sirv from 'sirv'
import minify from 'express-minify'
import uglifyEs from 'uglify-es'
import moment from 'moment'
import { create } from 'express-handlebars'
// import { create } from './lib/hbs.js'
import handlebarHelpers from 'handlebars-helpers'
import 'express-async-errors'
import compression from 'compression'
import cors from 'cors'
import chalk from 'chalk'
import config from 'config'

import appRoutes from './app/routes/app.routes.js'
import establishDbConnection from './api/database/connection.js'
import apiRoutes from './api/routes/api.js'
import { userConfigMiddleware } from './middlewares/user-config.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const staticDir = process.env.NODE_ENV.endsWith('production') ? 'build' : 'dev'

// Default date lang
moment.locale('fr-CA')

export const app = express()

const hbs = create({
  extname: '.hbs',
})

handlebarHelpers({ handlebars: hbs.handlebars })

await establishDbConnection()

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'app/views')
app.use(cors())
app.use(compression())
app.use(cookieParser())
// app.use(
//   minify({
//     uglifyJsModule: uglifyEs,
//   })
// )
app.use(express.json())

app.disable('x-powered-by')

app.use(express.static(resolve(__dirname, staticDir)))

app.use(userConfigMiddleware)

app.use('/api', apiRoutes)

app.use(appRoutes)

// app.use(
//   sirv(resolve(__dirname, 'build'), {
//     maxAge: 1_200, // 20 min
//   })
// )

app.listen(config.get('server.port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), config.get('server.port'), process.env.NODE_ENV)
  console.log(`Serving static files from ${resolve(__dirname, staticDir)}`)
})
