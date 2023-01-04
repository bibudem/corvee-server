const app = require('./app.cjs')
const job = require('./job.cjs')

module.exports = {
  server: {
    port: {
      http: 8000,
      https: 443,
    },
    staticAssetsOptions: {
      immutable: true,
      maxAge: '1y',
    },
  },
  app,
  job,
}
