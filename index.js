import chalk from 'chalk'
import config from 'config'

import { app } from './server/app.js'

app.listen(config.get('server.port.http'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), config.get('server.port.http'), process.env.NODE_ENV)
})
