import { LitElement, css, html, unsafeCSS, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { createPopper } from '@popperjs/core'
import { copyText } from '../common/js/clipboard.js'
import copyIcon from '../common/icons/content-copy.svg'
import checkIcon from '../common/icons/check.svg'
import stylesheet from './scss/cv-copy-clipboard.scss'
import { ENTER_KEY, SPACE_KEY } from '../common/js/constants.js'

/**
 * A copy clipboard element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvCopyClipboard extends LitElement {
  static styles = css`
    ${unsafeCSS(stylesheet)}
  `

  static get properties() {
    return {
      value: {
        type: String,
      },
      _tooltipText: {
        type: String,
        state: true,
      },
      _activeIcon: {
        type: String,
        state: true,
      },
    }
  }

  constructor() {
    super()

    this.tabIndex = 0
    this.role = 'button'
    this._tooltipText = 'Copié!'
    this._activeIcon = copyIcon
    this.elements = {}

    this.updateComplete.then(() => {
      this.elements.tooltip = this.renderRoot.querySelector('cv-tooltip')
      this.elements.icon = this.renderRoot.querySelector('svg')
      const tootipHeight = parseFloat(getComputedStyle(this.elements.tooltip.querySelector('cv-arrow'), 'before').getPropertyValue('width'))
      this.tooltip = createPopper(this.renderRoot.querySelector('button'), this.renderRoot.querySelector('cv-tooltip'), {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, tootipHeight],
            },
          },
        ],
      })

      this.elements.tooltip.addEventListener('animationend', function (event) {
        if (event.animationName === 'tooltip-appear') {
          this.classList.remove('show')
        }

        if (event.animationName === 'tooltip-disappear') {
          this.classList.remove('hide')
          this.hidden = true
        }
      })

      this.addEventListener('click', this._copyHandler)
      this.addEventListener('keyup', this._copyHandler)
    })
  }

  async _copyHandler(event) {
    try {
      const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

      if (event.type === 'click' || keyboardSelectItemEvent) {
        await copyText(this.value)
        this._activeIcon = checkIcon
        this.elements.icon.classList.add('success')
        this.elements.tooltip.hidden = false
        this.elements.tooltip.classList.add('show')
        this.tooltip.update()
        setTimeout(() => {
          this._activeIcon = copyIcon
          this.elements.icon.classList.remove('success')
          this.elements.tooltip.classList.add('hide')
        }, 3000)
      }
    } catch (error) {
      console.error('Error: %o', error)
    }
  }

  render() {
    return html`<div class="cv-copy-clipboard-container">
  <button>${unsafeHTML(this._activeIcon)}</button>
  <cv-tooltip role="tooltip" hidden>${this._tooltipText}<cv-arrow data-popper-arrow></cv-arrow>
  </cv-tooltip>
</div>`
  }
}

window.customElements.define('cv-copy-clipboard', CvCopyClipboard)
