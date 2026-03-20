const { join } = require('path')

const MONGODB_USER_NAME = '<read/wright user name>'
const MONGODB_USER_PASSWORD = '<a strong password>'

module.exports = {
  app: {
    baseUrl: 'https://localhost',
    cookie: {
      name: 'cv-dev',
      options: {
        domain: 'bib.umontreal.ca',
      },
    },
  },
  server: {
    certificate: {
      key: join(__dirname, 'certificate', 'server.key'), // /path/to/server.key
      cert: join(__dirname, 'certificate', 'server.crt'), // /path/to/server.crt
    },
  },
  mongodb: {
    url: `mongodb://${encodeURIComponent(MONGODB_USER_NAME)}:${encodeURIComponent(MONGODB_USER_PASSWORD)}@127.0.0.1:27017/corvee?authSource=corvee`,
    dbName: 'corvee',
  },
}
