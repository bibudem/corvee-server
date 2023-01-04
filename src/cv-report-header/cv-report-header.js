import { LitElement, css, html, adoptStyles, nothing } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import reportManager from '../common/js/report-manager.js'
import svgSprite from './assets/sprite.svg'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReportHeader extends LitElement {
  static get properties() {
    return {
      action: {
        type: String,
        reflect: true,
      },
    }
  }

  constructor() {
    super()
    this.action = 'rolling'
  }

  connectedCallback() {
    super.connectedCallback()

    adoptStyles(this.shadowRoot, [
      css`
        ${reportManager.stylesheets.cvReportHeaderStyles}
      `,
    ])
  }

  _setIcon() {
    return unsafeSVG(`
      <svg class="cv-i-${this.action}" role="img">
        <title>${this.action === 'rolling' ? 'Chargement...' : reportManager.actions.get(this.action).long}</title>
        <use xlink:href=#icon-${this.action}></use>
      </svg>
    `)
  }

  render() {
    return html`
      ${unsafeSVG(svgSprite)}
      <div class="cv-report-header">
        ${this._setIcon()}
        <div>
          <slot></slot>
        </div>
      </div>
    `
  }
}

window.customElements.define('cv-report-header', CvReportHeader)
