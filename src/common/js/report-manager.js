import { throttle } from 'lodash-es'
import { unsafeCSS } from 'lit'
import cvReportStyles from '../../cv-report/scss/cv-report.scss'
import cvReportHeaderStyles from '../../cv-report-header/scss/cv-report-header.scss'
import cvReportBodyStyles from '../../cv-report-body/scss/cv-report-body.scss'
import reportWidgetStyles from '../../cv-report-widget/scss/cv-report-widget.scss'
import { actions, baseUrl, linkTypes, defaultLinkType } from '@corvee/client-config/app'

class ReportManager {
  #bus
  #totalErrors
  #throttledEvents
  #slaves
  #master

  constructor() {
    this.#bus = document.createElement('div')
    this.#totalErrors = 0
    this.#throttledEvents = new Map()
    this.#slaves = []
    this.#master = window.parent === window ? null : window.parent

    Object.defineProperty(this, 'host', {
      value: this.#master ? 'slave' : 'master',
      enumerable: true,
    })

    this.defaultLinkType = defaultLinkType
    this.linkTypes = linkTypes

    this.stylesheets = {
      cvReportStyles: unsafeCSS(cvReportStyles),
      cvReportHeaderStyles: unsafeCSS(cvReportHeaderStyles),
      cvReportBodyStyles: unsafeCSS(cvReportBodyStyles),
      reportWidgetStyles: unsafeCSS(reportWidgetStyles),
    }

    this.actions = new Map()

    actions.forEach(action => this.actions.set(action.key, action))

    if (this.host === 'master') {
      window.addEventListener('message', event => {
        if (event.data?.cv && event.data?.event === 'total-errors') {
          const msg = event.data
          const slave = this.#slaves.find(item => item.slave === event.source)
          if (slave) {
            slave.totalErrors = msg.totalErrors
          } else {
            // Dynamically added <iframe>
            this.#slaves.push({
              slave: event.source,
              totalErrors: msg.totalErrors,
            })
          }
          this.#fireTotalErrors()
        }
      })
    }
  }

  get totalErrors() {
    const slavesTotalErrors = this.#slaves.reduce((total, slave) => total + slave.totalErrors, 0)
    const totalErrors = this.#totalErrors + slavesTotalErrors
    return totalErrors
  }

  addEventListener(event, callback) {
    this.#bus.addEventListener(event, callback)
    if (!this.#throttledEvents.has(event)) {
      this.#throttledEvents.set(
        event,
        throttle(data => {
          this.#bus.dispatchEvent(new CustomEvent(event, { detail: data }))
        }, 50)
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
    this.#fire('total-errors', { totalErrors: this.totalErrors })

    // Notify master's reportManager
    if (this.host === 'slave') {
      this.#master.postMessage(
        {
          cv: true,
          event: 'total-errors',
          totalErrors: this.totalErrors,
        },
        '*'
      )
    }
  }

  addError() {
    this.#totalErrors++
    this.#fireTotalErrors()
  }

  removeError() {
    this.#totalErrors--
    this.#fireTotalErrors()
  }

  async updateReport(reportId, data) {
    return fetch(`${baseUrl}/api/links/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }
}

const reportManager = new ReportManager()

globalThis.corvee = globalThis.corvee || {}
globalThis.corvee.reportManager = reportManager

export default reportManager
