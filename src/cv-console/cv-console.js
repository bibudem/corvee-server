import { LitElement, css, html, unsafeCSS } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import '../cv-job-list/cv-job-list.js'
import reportManager from '../common/js/report-manager.js'
import { attachClickHandler, detachClickHandler } from '../common/js/iframe-utils.js'
import { baseUrl } from 'client-config/app'
import stylesheet from './scss/cv-console.scss'
import closeIcon from '../common/svg/icon-close.svg'

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
    return html`<strong>${this.#totalErrors > 0 ? this.#totalErrors : `Aucun`}</strong> signalement${this.#totalErrors > 1 ? `s` : ``}
dans cette page`
  }

  async connectedCallback() {
    super.connectedCallback()

    attachClickHandler()

    this.role = 'complementary'
    this.open = false
  }

  deconnectedCallback() {
    detachClickHandler()
  }

  show() {
    this.open = true
  }

  close() {
    this.open = false
    // this.dispatchEvent(new Event('close'))
  }

  render() {
    return html`<div class="console-outer">
  <div class="console-container">
    <div class="console-title">
      <div class="h1"><a href="${baseUrl}" target="_blank">Corvée</a></div>
    </div>
    <div class="console-total-errors"><span>${this.totalErrors}</span></div>
    <div class="console-content-right">
      <span class="console-date">Liens vérifiés le <cv-job-list>38 octembre 3017</cv-job-list></span>
      <span class="console-nav"><a class="btn-label" href="${baseUrl}" target="_blank">Liste de tous les liens
          brisés</a></span>
      <button aria-label="fermer" class="console-btn-close" @click="${this.close}">${unsafeHTML(closeIcon)}</button>
    </div>
  </div>
</div>`
  }
}

window.customElements.define('cv-console', CvConsole)
