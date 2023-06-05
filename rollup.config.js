import { fileURLToPath } from 'node:url'
import { extname, relative } from 'node:path'
import { globSync } from 'glob'

// Import rollup plugins
import { copy } from '@web/rollup-plugin-copy'
import virtual from '@rollup/plugin-virtual'
import injectProcessEnv from 'rollup-plugin-inject-process-env'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import strip from '@rollup/plugin-strip'
import scss from 'rollup-plugin-scss'
import postcss from 'postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import url from 'postcss-url'
import { string } from 'rollup-plugin-string'
import templateLiterals from 'rollup-plugin-html-literals'
import { defaultShouldMinify } from 'minify-html-literals'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import summary from 'rollup-plugin-summary'
import clientConfigModule from './utils/client-config-virtual-module.js'
import pkg from './package.json' assert {type: 'json'}

const production = process.env.NODE_ENV === 'production'
const task = process.argv.includes('--watch') ? 'watch' : 'build'

console.log(`Working in ${process.env.NODE_ENV} mode.`)
console.log(`Current task: ${task}.`)

const buildDir = task === 'watch' ? 'dev' : 'build'

const scssPlugin = scss({
  output: false,
  sourceMap: !production,
  watch: 'src',
  processor: () => {
    const postcssPlugins = [
      url(
        {
          url: 'inline'
        }
      ),
      autoprefixer()
    ]
    if (task === 'build') {
      postcssPlugins.push(cssnano({
        preset: 'advanced',
      }))
    }
    return postcss(postcssPlugins)
  },
})

// Minify JS
const terserPlugin = terser({
  ecma: 2020,
  module: true,
  mangle: {
    properties: {
      regex: /^__/,
    },
  },
})

// Print bundle summary
const summaryPlugin = summary()

const cssPlugins = [
  virtual({
    ...clientConfigModule
  }),
  string({
    include: 'src/**/*.svg'
  }),
]

const plugins = [
  replace({
    preventAssignment: true,
    values: {
      'Reflect.decorate': 'undefined',
    },
  }),
  virtual({
    ...clientConfigModule,
    '@corvee/env': `export default '${process.env.NODE_ENV}'`,
  }),
  string({
    include: 'src/**/*.svg'
  }),
  json()
]

if (production) {
  plugins.push(strip({
    labels: ['debug']
  }))
} else {

}

if (task === 'build') {
  plugins.push(
    templateLiterals({
      options: {
        shouldMinify(template) {
          return (
            defaultShouldMinify(template) ||
            template.parts.some(part => {
              return part.text.includes('<svg')
            })
          )
        },
      },
    }))
}

plugins.push(
  scssPlugin,
  commonjs(),
  injectProcessEnv({
    NODE_ENV: process.env.NODE_ENV
  })
)

plugins.push(
  // Resolve bare module specifiers to relative paths
  nodeResolve({ browser: true })
)

cssPlugins.push(scssPlugin)

if (task === 'build') {
  plugins.push(terserPlugin)
  cssPlugins.push(terserPlugin)
}

plugins.push(summaryPlugin)
cssPlugins.push(summaryPlugin)

export default [
  {
    input: {
      'loader': 'src/client/loader.js',
    },
    output: {
      dir: `${buildDir}/`,
      format: 'esm',
      chunkFileNames: chunkInfo => {
        return `${chunkInfo.name}.js`
      },
      sourcemap: !production,
    },
    plugins,
    preserveEntrySignatures: 'strict',
  },
  {
    input: {
      'client/corvee': 'src/client/corvee.js',
    },
    output: {
      dir: `${buildDir}/${pkg.version}`,
      format: 'esm',
      chunkFileNames: chunkInfo => {
        // console.log(chunkInfo)
        return `${chunkInfo.name}.js`
      },
      sourcemap: !production,
    },
    plugins,
    preserveEntrySignatures: 'strict',
  },
  {
    input: 'src/common/js/fonts.js',
    output: {
      file: `${buildDir}/${pkg.version}/client/fonts.js`,
      format: 'esm',
      // chunkFileNames: chunkInfo => {
      //   // console.log(chunkInfo)
      //   return `${chunkInfo.name}.js`
      // },
      sourcemap: !production,
    },
    plugins: scssPlugin,
    preserveEntrySignatures: 'strict',
  },
  ...globSync('src/app/*.js').map(file => ({
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    input: fileURLToPath(new URL(file, import.meta.url)),
    output: {
      // This remove `src/` as well as the file extension from each file, so e.g.
      // src/nested/foo.js becomes nested/foo
      file: `${buildDir}/${pkg.version}/${relative('src', file.slice(0, file.length - extname(file).length)).replace(/\\/g, '/')}.js`,
      format: 'iife',
      sourcemap: !production,
    },
    plugins,
    preserveEntrySignatures: 'strict',
  })),
  {
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    input: 'src/app/js/search-widget.js',
    output: {
      // This remove `src/` as well as the file extension from each file, so e.g.
      // src/nested/foo.js becomes nested/foo
      dir: `${buildDir}/${pkg.version}/app`,
      format: 'esm',
      sourcemap: !production,
    },
    plugins,
    preserveEntrySignatures: 'strict',
  }
]
