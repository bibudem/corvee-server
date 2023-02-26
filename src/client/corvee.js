import { CorveeClientApp } from './lib/corvee-client-app.js'

export const corveeApp = new CorveeClientApp()

globalThis.corvee = globalThis.corvee || {}
globalThis.corvee.client = corveeApp
