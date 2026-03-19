import { version } from '../../../../package.json' with { type: 'json' }

globalThis.corvee = globalThis.corvee || {}
globalThis.corvee.version = version