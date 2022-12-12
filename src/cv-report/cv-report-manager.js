import { throttle } from 'underscore'
import { unsafeCSS } from 'lit'
import cvReportStyles from 'litsass:./scss/cv-report.scss'
import { actions } from '../../config/app.cjs'

class CvReportManager {
  #bus
  #totalErrors
  #throttledEvents

  constructor() {
    this.#bus = document.createElement('div')
    this.#totalErrors = 0
    this.#throttledEvents = new Map()

    this.stylesheet = unsafeCSS(cvReportStyles)
    this.actions = actions
    // this.config = config
  }

  get totalErrors() {
    return this.#totalErrors
  }

  addEventListener(event, callback) {
    this.#bus.addEventListener(event, callback)
    if (!this.#throttledEvents.has(event)) {
      this.#throttledEvents.set(
        event,
        throttle(data => {
          this.#bus.dispatchEvent(new CustomEvent(event, { detail: data }))
        }, 300)
      )
    }

    switch (event) {
      case 'total-errors':
        this.#fireTotalErrors()
        break
    }
  }

  removeEventListener(event, callback) {
    this.#bus.removeEventListener(event, callback)
  }

  #fire(event, data = {}) {
    if (this.#throttledEvents.has(event)) {
      this.#throttledEvents.get(event)(data)
    }
  }

  #fireTotalErrors() {
    this.#fire('total-errors', { total: this.#totalErrors })
  }

  addError() {
    this.#totalErrors++
    this.#fireTotalErrors()
  }

  removeError() {
    this.#totalErrors--
    this.#fire('total-errors', { total: this.#totalErrors })
  }
}

const cvReportManager = new CvReportManager()

export default cvReportManager
