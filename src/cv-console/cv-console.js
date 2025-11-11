import { LitElement, css, html, unsafeCSS } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import '../cv-job-list/cv-job-list.js'
import reportManager from '../common/js/report-manager.js'
import { attachClickHandler, detachClickHandler } from '../common/js/iframe-utils.js'
import { baseUrl } from '@corvee/client-config/app'
import ENV from '@corvee/env'
import stylesheet from './scss/cv-console.scss'
// import { closeIconLarge } from '../common/js/icons.js'
import closeIcon from '../common/icons/close.svg'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvConsole extends LitElement {
  #totalErrors

  static properties = {
    open: {
      type: Boolean,
      attribute: true,
      reflect: true,
    },
    totalErrors: {
      type: Number,
      state: true,
    },
  }

  static styles = css`
    ${unsafeCSS(stylesheet)}
  `
  constructor() {
    super()
    this.#totalErrors = reportManager.totalErrors

    reportManager.addEventListener('total-errors', event => {
      this.totalErrors = event.detail.totalErrors
    })
  }

  set totalErrors(val) {
    const oldVal = this.#totalErrors
    this.#totalErrors = val
    this.requestUpdate('totalErrors', oldVal)
  }

  get totalErrors() {
    const totalErrors = this.#totalErrors > 0 ? html`<strong class="console-total-errors--value">${this.#totalErrors}</strong>` : html`<strong class="console-total-errors--value-zero">Aucun</strong>`
    return html`${totalErrors} signalement${this.#totalErrors > 1 ? `s` : ``} dans cette page`
  }

  async connectedCallback() {
    super.connectedCallback()

    attachClickHandler()

    this.role = 'complementary'
    this.open = false

    // eslint-disable-next-line prettier-vue/prettier
    debug:
    if (ENV !== 'production') {
      const debugCss = (await import('./scss/debug.scss')).default
      const debugStylesheet = new CSSStyleSheet()
      debugStylesheet.replace(debugCss)
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, debugStylesheet]
    }
  }

  deconnectedCallback() {
    detachClickHandler()
  }

  show() {
    this.open = true
  }

  #close(dispatch = true) {
    this.open = false
    if (dispatch) {
      this.dispatchEvent(new Event('close'))
    }
  }

  close() {
    console.log('[console] close method called')
    this.#close(false)
  }

  render() {
    return html`
      <div class="console-outer">
        <div class="console-container">
          <div class="console-title">
            <div class="h1"><a href="${baseUrl}" target="_blank">Corvée</a></div>
          </div>
          <div class="console-total-errors"><span>${this.totalErrors}</span></div>
          <div class="console-content-right">
            <span class="console-date">Liens vérifiés le&nbsp;<cv-job-list>38 octembre 3017</cv-job-list></span>
            <span class="console-nav"><a class="btn-label" href="${baseUrl}" target="_blank">Liste de tous les liens brisés</a></span>
            <button aria-label="fermer" class="console-btn-close" @click="${this.#close}">${unsafeHTML(closeIcon)}</button>
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('cv-console', CvConsole)
