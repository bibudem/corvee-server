import { LitElement, css, html, adoptStyles, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { initDownloadAssets } from './js/download-assets.js'
import reportManager from '../common/js/report-manager.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReportBody extends LitElement {
  static get properties() {
    return {
      text: {
        type: String,
      },
      status: {
        type: String,
      },
      finalUrl: {
        type: String,
        attribute: 'final-url',
      },
      action: {
        type: String,
        reflect: true,
      },
      messages: {
        type: String,
      },
      linkType: {
        type: String,
        attribute: 'link-type',
      },
      errorCodes: {
        type: Array,
        attribute: 'error-codes',
        converter: function (value, type) {
          return value.split(' ')
        },
      },
      url: {
        type: String,
      },
    }
  }

  constructor() {
    super()
    this.updateComplete.then(() => {
      initDownloadAssets(this.renderRoot.querySelector('.cv-report-messages'))
    })
  }

  connectedCallback() {
    super.connectedCallback()

    this.dispatchEvent(
      new CustomEvent('init.cv-report', {
        detail: {
          action: this.action,
        },
        composed: true,
        bubbles: true,
      })
    )

    adoptStyles(this.shadowRoot, [
      css`
        ${reportManager.stylesheets.cvReportBodyStyles}
      `,
    ])
  }

  onChange(event) {
    this._update(event.target.value)
  }

  _update(action) {
    this.dispatchEvent(
      new CustomEvent('update.cv-report', {
        detail: {
          action,
        },
        composed: true,
        bubbles: true,
      })
    )
  }

  _getActions() {
    const options = [...reportManager.actions.values()]
      .map(action => {
        const selectedAttribute = this.action === action.key ? ` selected` : ''
        return `<option value="${action.key}"${selectedAttribute}>${action.short}</option>`
      })
      .join('')

    return unsafeHTML(`${options}`)
  }

  _getMessages() {
    if (!this.messages) {
      return nothing
    }
    const doc = document.createElement('div')
    doc.innerHTML = this.messages
    return unsafeHTML(`<div class="cv-report-body-list-item cv-report-messages"><dt class="cv-report-body-list-item-label">Détails</dt><dd><ul>${[...doc.children].map(msg => `<li data-error-code="${msg.getAttribute('error-code')}">${msg.innerHTML}</li>`).join('')}</ul></dd></div>`)
  }

  _getSuggestedLink() {
    if (this.errorCodes && this.errorCodes.some(errorCode => errorCode.startsWith('http-3')) && !this.errorCodes.includes('http-30x-permanent-redirect-failure')) {
      return unsafeHTML(`<div class="cv-report-body-list-item"><dt class="cv-report-body-list-item-label">Lien
      suggéré :</dt> <dd><a href="${this.finalUrl}" target="visualisation" class="cv-url">${this.finalUrl}</a></dd></div>`)
    }
    return nothing
  }

  render() {
    return html`
      <dl class="cv-report-body-list">
        ${this.linkType
          ? html`<div class="cv-report-body-list-item">
              <dt class="cv-report-body-list-item-label">Type de lien :</dt>
              <dd>${reportManager.linkTypes[this.linkType]}</dd>
            </div>`
          : nothing}
        ${this.text
          ? html`<div class="cv-report-body-list-item">
              <dt class="cv-report-body-list-item-label">Texte :</dt>
              <dd><i>${this.text}</i></dd>
            </div>`
          : nothing}
        <div class="cv-report-body-list-item">
          <dt class="cv-report-body-list-item-label">Statut :</dt>
          <dd class="cv-lien-action-modifier cv-lien-action-modifier-menu">
            <select @change=${this.onChange} class="cv-action">
              ${this._getActions()}
            </select>
          </dd>
        </div>
        ${this._getSuggestedLink()} ${this._getMessages()}
      </dl>
    `
  }
}

window.customElements.define('cv-report-body', CvReportBody)
