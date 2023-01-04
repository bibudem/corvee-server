import { css, html, adoptStyles } from 'lit'
import { createPopper } from '@popperjs/core'
import { querySelectorAll } from 'kagekiri'
import { ENTER_KEY, ESCAPE_KEY, SPACE_KEY, TAB_KEY } from '../common/js/constants.js'
import { CvReportBase } from '../cv-report-base/cv-report-base.js'
import '../cv-report-header/cv-report-header.js'
import '../cv-report-body/cv-report-body.js'
import reportManager from '../common/js/report-manager.js'

function getFocusables(el) {
  return querySelectorAll('button,[href],select,textarea,input:not([type="hidden"]),[tabindex]:not([tabindex="-1"])', el)
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReportWidget extends CvReportBase {
  static get properties() {
    return {
      report: {
        type: Object,
        state: true,
      },
    }
  }

  constructor() {
    super()

    this.elements = {}

    this.updateComplete.then(() => {
      this.elements.reportHeader = this.renderRoot.querySelector('cv-report-header')
      this.elements.reportWidget = this.renderRoot.querySelector('.report-widget')

      this.elements.reportHeader.addEventListener('keydown', event => {
        if (event.key === ENTER_KEY || event.key === SPACE_KEY) {
          event.preventDefault()
          this.elements.reportWidget.opener = this.elements.reportHeader
          this.elements.reportWidget.show().then(() => this.elements.reportWidget.focusables[0].focus())
        }
      })

      this.elements.reportWidget.addEventListener('click', event => {
        event.preventDefault()
      })

      this.elements.reportWidget.popperInstance = createPopper(this.elements.reportHeader, this.elements.reportWidget, {
        strategy: 'absolute',
      })

      this.elements.reportWidget.focusables = getFocusables(this.elements.reportWidget)

      this.elements.reportWidget.show = function show() {
        return new Promise((resolve, reject) => {
          if (this.open) {
            return
          }

          this.addEventListener(
            'animationend',
            () => {
              this.classList.remove('open')
            },
            { once: true }
          )

          this.classList.add('open')

          this.setAttribute('open', '')

          this.popperInstance.update().then(() => resolve())
        })
      }

      this.elements.reportWidget.close = function close() {
        this.addEventListener(
          'animationend',
          () => {
            this.removeAttribute('open')
            this.classList.remove('close')
          },
          { once: true }
        )
        this.classList.add('close')
      }

      this.elements.reportWidget.addEventListener('keydown', function (event) {
        // if (event.key === 'Enter') {
        //   event.preventDefault()
        //   this.elements.accept.dispatchEvent(new Event('click'))
        // }

        if (event.key === ESCAPE_KEY) {
          this.close()
          this.opener.focus()
          this.opener = null
        }
        if (event.key === TAB_KEY) {
          event.preventDefault()
          const len = this.focusables.length - 1
          let index = this.focusables.indexOf(event.path[0])
          index = event.shiftKey ? index - 1 : index + 1
          if (index < 0) {
            index = len
          }
          if (index > len) {
            index = 0
          }
          this.focusables[index].focus()
        }
      })

      this.elements.reportHeader.addEventListener('mouseenter', () => this.elements.reportWidget.show())

      this.addEventListener('mouseleave', () => {
        this.elements.reportWidget.close()
        this.elements.reportWidget.opener && this.elements.reportWidget.opener.focus()
        this.elements.reportWidget.opener = null
      })
    })
  }

  updateActionCallback(action) {
    this.report.action = action
    this.elements.reportHeader.action = action
  }

  connectedCallback() {
    super.connectedCallback()

    adoptStyles(this.shadowRoot, [
      css`
        ${reportManager.stylesheets.cvReportWidgetStyles}
      `,
    ])
  }

  dispose() {
    if (this.report.action === 'to-be-fixed') {
      reportManager.removeError()
    }
  }

  render() {
    const id = `${Math.round(Date.now()).toString(36)}`
    return html`<div class="report-widget-container">
  <cv-report-header action=${this.report.action} tabindex="0">
    <slot></slot>
  </cv-report-header>
  <div class="report-widget" role="dialog" aria-labelledby=${id} aria-modal="true">
    <div class="card-header" id=${id}>Rapport pour ${this.linkType === 'IMG' ? `cette image` : `ce lien`}</div>
    <div class="card-body">
      <cv-report-body text=${this.report.text} final-url=${this.report.finalUrl} action=${this.report.action}
        messages=${this.report.messages} link-type=${this.linkType} url=${this.report.url}
        error-codes=${this.report.errorCodes.join(' ')}></cv-report-body>
        </div>
      </div>
    </div>`
  }
}

window.customElements.define('cv-report-widget', CvReportWidget)
