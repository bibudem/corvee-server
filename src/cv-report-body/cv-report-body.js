import { LitElement, css, html, adoptStyles, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
// import '@github/clipboard-copy-element'
import '../cv-copy-clipboard/cv-copy-clipboard.js'
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
    return unsafeHTML(`<div class="cv-report-messages"><span class="cv-report-body-item-label visually-hidden">Détails</span><ul>${[...doc.children].map(msg => `<li data-error-code="${msg.getAttribute('error-code')}">${msg.innerHTML}</li>`).join('')}</ul></div>`)
  }

  _getSuggestedLink() {
    if (this.errorCodes && this.errorCodes.some(errorCode => errorCode.startsWith('http-3')) && !this.errorCodes.includes('http-30x-permanent-redirect-failure')) {
      return html`<div class="cv-report-body-item">
        <dt class="cv-report-body-item-label">Lien suggéré :</dt>
        <dd class="cv-report-body-item-content">
          <div class="cv-report-body-final-url"><a href="${this.finalUrl}" target="visualisation" class="cv-url">${this.finalUrl}</a><cv-copy-clipboard value="${this.finalUrl}" aria-label="Copier"></cv-copy-clipboard></div>
        </dd>
      </div>`
    }
    return nothing
  }

  render() {
    return html`
      <dl class="cv-report-body">
        ${this.linkType
          ? html`<div class="cv-report-body-item">
              <dt class="cv-report-body-item-label">Type :</dt>
              <dd class="cv-report-body-item-content">${reportManager.linkTypes[this.linkType]}</dd>
            </div>`
          : nothing}
        ${this.text
          ? html`<div class="cv-report-body-item">
              <dt class="cv-report-body-item-label">Texte :</dt>
              <dd class="cv-report-body-item-content"><i>${this.text}</i></dd>
            </div>`
          : nothing}
        <div class="cv-report-body-item">
          <dt class="cv-report-body-item-label">Statut :</dt>
          <dd class="cv-report-body-item-content">
            <select @change=${this.onChange}>
              ${this._getActions()}
            </select>
          </dd>
        </div>
        ${this.url
          ? html`<div class="cv-report-body-item">
              <dt class="cv-report-body-item-label">Cible :</dt>
              <dd class="cv-report-body-item-content"><a href="${this.url}" target="visualisation" class="cv-url">${this.url}</a></dd>
            </div>`
          : nothing}
        ${this._getSuggestedLink()}
      </dl>
      ${this._getMessages()}
    `
  }
}

window.customElements.define('cv-report-body', CvReportBody)
