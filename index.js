import chalk from 'chalk'
import config from 'config'

import { app } from './server/app.js'

const PORT = config.get('server.port.http')

app.listen(PORT, () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), PORT, process.env.NODE_ENV)
})
