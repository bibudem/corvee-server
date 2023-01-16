import { writeFile } from 'node:fs/promises'
import config from 'config'

const sassConfig = [`$baseUrl: "${config.get('app.baseUrl')}";`, `$env: "${process.env.NODE_ENV}";`].join('\n')

await writeFile(new URL('../src/common/scss/_config.scss', import.meta.url), sassConfig)
