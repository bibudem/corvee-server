import { css, html, adoptStyles } from 'lit'
import { createPopper } from '@popperjs/core'
import { querySelectorAll } from 'kagekiri'
import { ENTER_KEY, ESCAPE_KEY, SPACE_KEY, TAB_KEY } from '../common/js/constants.js'
import { CvReportBase } from '../cv-report-base/cv-report-base.js'
import '../cv-report-header/cv-report-header.js'
import '../cv-report-body/cv-report-body.js'
import reportManager from '../common/js/report-manager.js'
import { getBoxShadowWidths } from '../common/js/box-shadow-widths.js'

function getFocusables(el) {
  return querySelectorAll('button,[href],select,textarea,input:not([type="hidden"]),[tabindex]:not([tabindex="-1"])', el)
}

function onVisible(element, callback) {
  const options = {
    root: document.documentElement,
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      callback(entry.intersectionRatio > 0, observer)
    })
  }, options)

  observer.observe(element)
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
      open: {
        type: Boolean,
        reflect: true,
      },
    }
  }

  constructor() {
    super()

    this.open = false
    this.elements = {}

    this.updateComplete.then(() => {
      this.elements.reportHeader = this.renderRoot.querySelector('cv-report-header')
      this.elements.reportWidgetContainer = this.renderRoot.querySelector('.report-widget-container')
      this.elements.reportDialog = this.renderRoot.querySelector('.report-dialog')

      this.elements.reportDialog.focusables = getFocusables(this.elements.reportDialog)

      this.elements.reportDialog.popperInstance = createPopper(this.elements.reportHeader, this.elements.reportDialog, {
        strategy: 'absolute',
        modifiers: [
          {
            name: 'arrow',
            options: {
              element: 'cv-arrow',
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, Number.parseInt(getComputedStyle(this.elements.reportWidgetContainer).getPropertyValue('--_report-dialog-offset'))],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: getBoxShadowWidths(getComputedStyle(this.elements.reportDialog).boxShadow),
            },
          },
          { name: 'eventListeners', enabled: false },
        ],
      })

      this.elements.reportDialog.addEventListener('animationend', function (event) {
        if (event.animationName === 'fade') {
          if (this.classList.contains('open')) {
            // Has opened
            console.log('[show] animationend')
            this.classList.remove('open')
          } else {
            // Has closed
            console.log('[close] animationend')
            this.removeAttribute('open')
            this.classList.remove('close')
            if (this.opener) {
              this.opener.focus()
              this.opener = null
            }
          }
        }
      })

      this.elements.reportHeader.addEventListener('keydown', event => {
        if (event.key === ENTER_KEY || event.key === SPACE_KEY) {
          event.preventDefault()
          this.elements.reportDialog.opener = this.elements.reportHeader
          this.show().then(() => this.elements.reportDialog.focusables[0]?.focus())
        }
      })

      this.elements.reportDialog.addEventListener('keydown', event => {
        const self = this.elements.reportDialog
        // if (event.key === 'Enter') {
        //   event.preventDefault()
        //   this.elements.accept.dispatchEvent(new Event('click'))
        // }

        if (event.key === ESCAPE_KEY) {
          this.close().then(() => {
            self.opener.focus()
            self.opener = null
          })
        }

        if (event.key === TAB_KEY) {
          event.preventDefault()
          const len = self.focusables.length - 1
          let index = self.focusables.indexOf(event.composedPath()[0])
          index = event.shiftKey ? index - 1 : index + 1
          if (index < 0) {
            index = len
          }
          if (index > len) {
            index = 0
          }
          self.focusables[index].focus()
        }
      })

      // this.elements.reportHeader.addEventListener('mouseenter', () => this.elements.reportDialog.show())
      this.addEventListener('mouseenter', () => {
        if (this.open) {
          return
        }
        console.log('[mouseenter]')
        this.show()
      })

      this.addEventListener('mouseleave', event => {
        console.log('[mouseleave]')
        this.close()
      })

      const reportWidgets = this.querySelectorAll('cv-report-widget')
      reportWidgets.forEach(reportWidget => {
        reportWidget.addEventListener('mouseenter', () => {
          this.close()
        })
        reportWidget.addEventListener('mouseleave', () => {
          this.show()
        })
      })

      onVisible(this, (visible, observer) => {
        if (visible) {
          const width = this.getBoundingClientRect().width
          const widthOffset = getBoxShadowWidths(getComputedStyle(this.elements.reportHeader).boxShadow).left
          const scale = (width - widthOffset) / width
          this.elements.reportWidgetContainer.style.setProperty('--_cv-report-widget-header-scale', Math.max(scale, 0.95))
          observer.disconnect()
        }
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
        ${reportManager.stylesheets.reportWidgetStyles}
      `,
    ])
  }

  show() {
    return new Promise((resolve, reject) => {
      if (this.open) {
        return resolve(false)
      }

      if (this.elements.reportDialog.classList.contains('close')) {
        // Widget close animation is running. Will cancel it
        this.elements.reportDialog.classList.remove('close')
      }

      this.open = true

      this.elements.reportHeader.classList.add('hover')
      this.elements.reportDialog.classList.add('open')
      this.elements.reportDialog.setAttribute('open', '')

      this.elements.reportWidgetContainer.style.setProperty('--_report-widget-gap-width', `${this.getBoundingClientRect().width}px`)
      this.elements.reportWidgetContainer.style.setProperty('--_report-widget-gap-height', `${this.getBoundingClientRect().height}px`)

      this.elements.reportDialog.popperInstance.update().then(() => resolve())
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.open) {
        return reject(false)
      }

      if (this.elements.reportDialog.classList.contains('open')) {
        // Widget open animation is running. Will cancel it
        this.elements.reportDialog.classList.remove('open')
      }

      this.open = false

      this.elements.reportHeader.classList.remove('hover')
      this.elements.reportDialog.classList.add('close')
      //
    })
  }

  dispose() {
    this.elements.reportDialog.popperInstance.destroy()

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
  <div class="report-dialog" role="dialog" aria-labelledby=${id} aria-modal="true">
    <cv-arrow></cv-arrow>
    <div class="report-dialog-header" id=${id}>Rapport pour ${this.linkType === 'IMG' ? `cette image` : `ce lien`}</div>
    <div class="report-dialog-body">
      <cv-report-body text=${this.report.text} final-url=${this.report.finalUrl} action=${this.report.action}
        messages=${this.report.messages} link-type=${this.linkType} url=${this.report.url}
        error-codes=${this.report.errorCodes.join(' ')}></cv-report-body>
        </div>
      </div>
    </div>`
  }
}

window.customElements.define('cv-report-widget', CvReportWidget)
