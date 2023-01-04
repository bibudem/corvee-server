import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import rimraf from 'rimraf'
import pkg from '../package.json' assert {type: 'json'}

const version = pkg.version
const task = process.argv[2]
const __dirname = fileURLToPath(new URL(`../${task}/${version}/`, import.meta.url))

if (!['build', 'dev'].includes(task)) {
  throw new Error(`task parameter must be one of 'build' or 'dev'. Got '${task}'`)
}

rimraf.sync(`${__dirname}*`)