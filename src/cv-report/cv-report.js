import { css, html, adoptStyles } from 'lit'
import { CvReportBase } from '../cv-report-base/cv-report-base.js'
import reportManager from '../common/js/report-manager.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReport extends CvReportBase {
  // static get properties() {
  //   return {
  //     reportId: { type: String, attribute: 'report-id' },
  //     action: { type: String, reflect: true },
  //   }
  // }

  constructor() {
    super()
  }

  updateActionCallback(action) {
    this.querySelector('cv-report-header').action = action
  }

  connectedCallback() {
    super.connectedCallback()

    adoptStyles(this.shadowRoot, [
      css`
        ${this.reportManager.stylesheets.cvReportStyles}
      `,
    ])
  }

  dispose() {
    reportManager.removeError()
  }

  render() {
    return html`
      <div class="cv-report">
        <slot></slot>
      </div>
    `
  }
}

window.customElements.define('cv-report', CvReport)
