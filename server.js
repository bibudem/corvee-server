import { readFile } from 'node:fs/promises'
import { createSecureServer } from 'node:http2'
import http from 'node:http'
// import https from 'node:https'
import chalk from 'chalk'
import config from 'config'

import { app } from './server/app.js'

const privateKey = await readFile(config.get('server.certificate.key'), 'utf8')
const certificate = await readFile(config.get('server.certificate.cert'), 'utf8')

const http2Options = {
  key: privateKey,
  cert: certificate,
  allowHTTP1: true,
}

const httpServer = http.createServer(app)
// const httpsServer = https.createServer(credentials, app)

const HTTP_PORT = config.get('server.port.http') || 80
const HTTPS_PORT = config.get('server.port.https') || 443

httpServer.listen(HTTP_PORT, () => {
  console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), HTTP_PORT, process.env.NODE_ENV)
})

const http2Server = createSecureServer(http2Options, app)

http2Server.listen(HTTPS_PORT, () => {
  console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), HTTPS_PORT, process.env.NODE_ENV)
})

// httpsServer.listen(HTTPS_PORT, () => {
//   console.log('%s App is running at https://localhost:%d in %s mode', chalk.green('✓'), HTTPS_PORT, process.env.NODE_ENV)
// })
