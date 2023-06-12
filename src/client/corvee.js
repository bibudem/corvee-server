import { CorveeClientApp } from './lib/corvee-client-app.js'
import '../common/js/api/corvee.js'

export const corveeApp = new CorveeClientApp()

globalThis.corvee = globalThis.corvee || {}

globalThis.corvee.client = corveeApp

globalThis.corvee.start = function start() {
  corveeApp.start()
}
globalThis.corvee.stop = async function stop() {
  await corveeApp.stop()
}
