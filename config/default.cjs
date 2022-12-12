const app = require('./app.cjs')
const job = require('./job.cjs')

module.exports = {
  server: {
    port: 8000,
  },
  app,
  job,
}
