import { exec } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import pkg from '../package.json' assert {type: 'json'}

const buildMode = process.argv.includes('dev') ? 'dev' : 'build'

const execOptions = {
  cwd: fileURLToPath(new URL('../', import.meta.url))
}

const sass = 'npm x -- sass'
const postcss = 'npm x -- postcss'
const srcFile = fileURLToPath(new URL('../src/app/scss/app.scss', import.meta.url))
const outFile = fileURLToPath(new URL(`../${buildMode}/${pkg.version}/app/css/app.css`, import.meta.url))

const sassArgs = [
  '--no-charset',
  srcFile,
  outFile
]

const postcssArgs = [
  outFile,
  '--replace',
  '--map'
]

console.log(`Running sass in ${buildMode} mode...`)

if (buildMode === 'dev') {

  exec([sass, ...sassArgs].join(' '), execOptions)

} else {

  exec([sass, ...sassArgs].join(' '), execOptions, (error, stdout, stderr) => {

    if (error) {
      throw error
    }

    if (stderr) {
      console.error(stderr)
    }

    console.log(`Running postcss in ${buildMode} mode...`)

    exec([postcss, ...postcssArgs].join(' '), execOptions, (error, stdout, stderr) => {
      if (error) {
        throw error
      }

      if (stderr) {
        console.error(stderr)
        process.exit()
      }

      console.log('Finished')
    })

  })
}
