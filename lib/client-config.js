import config from 'config'

const MODULE_NAME = 'client-config'
const PUBLIC_FIELDS = ['app', 'job']

function makeExports(obj, fields) {
  return `export default ${JSON.stringify(obj, null, 2)}
  ${fields.map(key => `export const ${key} = ${JSON.stringify(obj[key], null, 2)}`).join('\n')}`
}

function makeModule(name, fields, data) {
  return {
    [name]: makeExports(data, fields),
    ...fields.reduce((obj, key) => {
      obj[`${name}/${key}`] = makeExports(data[key], Object.keys(data[key]))

      return obj
    }, {}),
  }
}

export default makeModule(MODULE_NAME, PUBLIC_FIELDS, config)
