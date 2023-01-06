import { writeFile } from 'node:fs/promises'
import config from 'config'

const sassConfig = `$baseUrl: "${config.get('app.baseUrl')}";
$env: "${process.env.NODE_ENV}";`

await writeFile(new URL('../src/common/scss/_config.scss', import.meta.url), sassConfig)
