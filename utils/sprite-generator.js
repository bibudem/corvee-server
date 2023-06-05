import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import SVGSpriter from 'svg-sprite'
import File from 'vinyl'

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src')

const components = globSync(`**/sprite.json`, { cwd: __dirname })
const commonComponentSvgDirname = resolve(__dirname, 'common', 'svg')

for (const component of components) {
  const componnentPath = resolve(__dirname, dirname(component))
  const assetsPath = resolve(componnentPath, 'assets')

  const spriter = new SVGSpriter({
    mode: {
      symbol: {
        dest: assetsPath,
        bust: false,
        inline: true,
        sprite: 'sprite.svg',
      },
    },
    shape: {
      transform: [
        {
          svgo: {
            multipass: true,
            plugins: [
              'preset-default',
              'convertStyleToAttrs',
              {
                name: 'cleanupNumericValues',
                params: {
                  floatPrecision: '2',
                },
              },
              // removeViewBox: false,
              // removeDimensions: true,
            ],
          },
        },
      ],
    },
    svg: {
      xmlDeclaration: false,
      doctypeDeclaration: false,
      namespaceIDs: false,
      namespaceClassnames: false,
      dimensionAttributes: false,
      transform: svg => svg.replace(/^<svg style="position:absolute">/, '<svg style="display:none">'),
    },
  })

  // Find SVG files recursively via `glob`
  // const files = globSync('**/*.svg', { cwd })
  const sprites = JSON.parse(readFileSync(join(componnentPath, 'sprite.json')))
  sprites.forEach(sprite => {
    // Create and add a vinyl file instance for each SVG
    const filePath = join(commonComponentSvgDirname, `${sprite}.svg`)

    spriter.add(
      new File({
        path: filePath, // Absolute path to the SVG file
        base: commonComponentSvgDirname, // Base path (see `name` argument)
        contents: readFileSync(filePath),
      })
    )
  })

  spriter.compile((error, result, data) => {
    for (const type in result.symbol) {
      mkdirSync(dirname(result.symbol[type].path), { recursive: true })
      writeFileSync(result.symbol[type].path, result.symbol[type].contents)
    }
  })
}
