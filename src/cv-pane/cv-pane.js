import { LitElement, css, html, unsafeCSS } from 'lit'
import { SPACE_KEY, ENTER_KEY, ESCAPE_KEY } from '../common/js/constants.js'
import stylesheet from './scss/cv-pane.scss'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvPane extends LitElement {
  static styles = css`
    ${unsafeCSS(stylesheet)}
  `

  static get properties() {
    return {}
  }

  constructor() {
    super()
    this.isShown = true
    this.addEventListener('keydown', event => {
      if (event.key === ESCAPE_KEY) {
        this.hide(true)
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()
  }

  disconnectedCallback() { }

  _onCloseBtn(event) {
    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.type === 'click' || keyboardSelectItemEvent) {
      this.hide(keyboardSelectItemEvent)
    }
  }

  show() {
    this.isShown = true
    this.dispatchEvent(new Event('show'))
  }

  hide(isKeyboardEvent) {
    this.isShown = false
    this.dispatchEvent(new CustomEvent('hide', { detail: { isKeyboardEvent } }))
  }

  render() {
    return html`<div class="cv-pane">
  <button @click=${this._onCloseBtn} class="cv-btn-close"><span class="visually-hidden">Fermer</span></button>
  <slot></slot>
</div>`
  }
}

window.customElements.define('cv-pane', CvPane)
