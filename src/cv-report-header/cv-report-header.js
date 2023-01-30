import { LitElement, css, html, adoptStyles, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import reportManager from '../common/js/report-manager.js'
import { Icon } from '../common/js/icon.js'
import fixedIcon from '../common/icons/fixed.svg'
import ignoreIcon from '../common/icons/ignore.svg'
import noErrorIcon from '../common/icons/no-error.svg'
import toBeFixedIcon from '../common/icons/to-be-fixed.svg'

const actionIconMap = {
  fixed: new Icon(fixedIcon),
  ignore: new Icon(ignoreIcon),
  'no-error': new Icon(noErrorIcon),
  'to-be-fixed': new Icon(toBeFixedIcon),
}

for (const action of reportManager.actions.keys()) {
  actionIconMap[action].title = reportManager.actions.get(action).long
  actionIconMap[action].removeAttribute('aria-hidden')
  actionIconMap[action].setAttribute('role', 'img')
}

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
    // return unsafeSVG(`
    //   <svg class="cv-i-${this.action}" role="img">
    //     <title>${this.action === 'rolling' ? 'Chargement...' : reportManager.actions.get(this.action).long}</title>
    //     <use xlink:href=#icon-${this.action}></use>
    //   </svg>
    // `)
    return unsafeHTML(actionIconMap[this.action].svg)
  }

  render() {
    return html`
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
