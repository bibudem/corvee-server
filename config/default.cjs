const app = require('./app.cjs')
const job = require('./job.cjs')

module.exports = {
  server: {
    port: {
      http: 8000,
      https: 443,
    },
    certificate: {
      key: '', // /path/to/server.key
      cert: '', // /path/to/server.crt
    },
    staticAssetsOptions: {
      etag: false,
      lastModified: false,
      immutable: true,
      maxAge: '1y',
    },
    allowedOrigins: ['https://bib.umontreal.ca', 'https://boite-outils.bib.umontreal.ca', 'https://studio.bib.umontreal.ca', 'https://localhost'],
  },
  app,
  job,
}
