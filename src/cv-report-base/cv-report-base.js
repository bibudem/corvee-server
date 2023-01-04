import { LitElement } from 'lit'
import reportManager from '../common/js/report-manager.js'

function statusChanged(actualAction, newAction) {
  function status(action) {
    return action === 'to-be-fixed' ? 'to-be-fixed' : 'fixed'
  }
  const actualStatus = status(actualAction)
  const newStatus = status(newAction)
  return actualStatus !== newStatus
}

/**
 * The base class for reports
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReportBase extends LitElement {
  static get properties() {
    return {
      reportId: { type: String, attribute: 'report-id' },
      action: { type: String, reflect: true },
      linkType: { type: String, attribute: 'link-type' },
    }
  }

  constructor() {
    super()

    this.reportManager = reportManager

    this.addEventListener('update.cv-report', event => {
      event.stopPropagation()
      this.updateAction(event.detail.action)
        .then(async response => {
          if (response.ok) {
            const newAction = (await response.json()).action

            if (statusChanged(this.action, newAction)) {
              if (newAction === 'to-be-fixed') {
                reportManager.addError()
              } else {
                reportManager.removeError()
              }
            }

            this.action = newAction

            const cvReportHeader = this.querySelector('cv-report-header')
            if (cvReportHeader) {
              cvReportHeader.action = newAction
            }

            if (this.updateActionCallback) {
              this.updateActionCallback(newAction)
            }

            return
          }
          console.error(response)
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.addEventListener('init.cv-report', event => {
      event.stopPropagation()
      this.action = event.detail.action

      if (event.detail.action === 'to-be-fixed') {
        reportManager.addError()
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()
  }

  async updateAction(action) {
    return reportManager.updateReport(this.reportId, { action })
  }

  dispose() {
    reportManager.removeError()
  }
}
