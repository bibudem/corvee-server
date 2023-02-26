import { LitElement, css, html, unsafeCSS } from 'lit'
import { querySelectorAll } from 'kagekiri'
import { SPACE_KEY, ENTER_KEY, ESCAPE_KEY, TAB_KEY } from '../common/js/constants.js'
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

    // this.addEventListener('keydown', this._onBlurKeyboard.bind(this))
  }

  connectedCallback() {
    super.connectedCallback()
  }

  createRenderRoot() {
    const root = super.createRenderRoot()

    root.addEventListener('keydown', this._onBlurKeyboard.bind(this))

    return root
  }

  _onBlurKeyboard(event) {
    // if (event.key === TAB_KEY) {
    //   console.log('-------------------------------------------------------------------------------------')
    //   if (event.target === this) {
    //     console.log('cancelling...')
    //     return
    //   }
    //   console.log('tab key, target: %o', event.target)
    //   const pane = this.host ?? this
    //   const tabbables = querySelectorAll('button:not([tabindex="-1"]), [href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])', pane).filter(elem => !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length))
    //   console.log('tabbables: %o', tabbables)
    //   console.log('index of target: %s', tabbables.indexOf(event.target))
    //   if (event.shiftKey) {
    //     if (event.target === tabbables[0]) {
    //       console.log('moving BACK from panel')
    //       const defaultPrevented = !pane.dispatchEvent(new CustomEvent('blur.keyboard', { detail: { shiftKey: event.shiftKey } }))
    //       console.log('defaultPrevented: %s', defaultPrevented)
    //       if (defaultPrevented) {
    //         event.preventDefault()
    //       }
    //     }
    //   } else {
    //     console.log('event: %o', event)
    //     if (event.target === tabbables[tabbables.length - 1]) {
    //       console.log('moving FORWARD from panel')
    //       const defaultPrevented = !pane.dispatchEvent(new CustomEvent('blur.keyboard', { detail: { shiftKey: event.shiftKey } }))
    //       console.log('defaultPrevented: %s', defaultPrevented)
    //       if (defaultPrevented) {
    //         event.preventDefault()
    //       }
    //     }
    //   }
    // }
  }

  _onCloseBtn(event) {
    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.type === 'click' || keyboardSelectItemEvent) {
      this.hide(keyboardSelectItemEvent)
    }
  }

  _onCloseBtnKeydown(event) {
    if (event.key === TAB_KEY && event.shiftKey) {
      event.preventDefault()
      this.dispatchEvent(new CustomEvent('blur.keyboard', { detail: { shiftKey: event.shiftKey } }))
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
  <button @click=${this._onCloseBtn} @keydown=${this._onCloseBtnKeydown} class="cv-btn-close"><span
      class="visually-hidden">Fermer</span></button>
  <slot></slot>
</div>`
  }
}

window.customElements.define('cv-pane', CvPane)
