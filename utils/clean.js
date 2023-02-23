import { fileURLToPath } from 'node:url'
import { rimrafSync } from 'rimraf'
import pkg from '../package.json' assert {type: 'json'}

const version = pkg.version
const task = process.argv[2]
const __dirname = fileURLToPath(new URL(`../${task}/${version}/`, import.meta.url))

if (!['build', 'dev'].includes(task)) {
  throw new Error(`Task parameter must be one of 'build' or 'dev'. Got '${task}'`)
}

rimrafSync(`${__dirname}`)