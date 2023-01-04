import { readFile } from 'node:fs/promises'
import { createSecureServer } from 'node:http2'
import http from 'node:http'
// import https from 'node:https'
import chalk from 'chalk'
import config from 'config'

import { app } from './app.js'

const privateKey = await readFile('config/server.key', 'utf8')
const certificate = await readFile('config/server.crt', 'utf8')

const http2Options = {
  key: privateKey,
  cert: certificate,
  allowHTTP1: true,
}

const httpServer = http.createServer(app)
// const httpsServer = https.createServer(credentials, app)

httpServer.listen(config.get('server.port.http'), () => {
  console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), config.get('server.port.http'), process.env.NODE_ENV)
})

const http2Server = createSecureServer(http2Options, app)

http2Server.listen(config.get('server.port.https'), () => {
  console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), config.get('server.port.https'), process.env.NODE_ENV)
})

// httpsServer.listen(config.get('server.port.https'), () => {
//   console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), config.get('server.port.https'), process.env.NODE_ENV)
// })
