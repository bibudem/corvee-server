import { LitElement, css, html, adoptStyles, nothing } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { initDownloadAssets } from './js/download-assets.js'
import cvReportManager from './cv-report-manager.js'
import svgSprite from 'bundle-text:./assets/sprite.svg'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvReport extends LitElement {
  static get properties() {
    return {
      url: { type: String },
      text: { type: String },
      status: { type: String },
      finalUrl: { type: String, attribute: 'final-url' },
      action: {
        type: String,
        reflect: true,
      },
      linkId: { type: String, attribute: 'link-id' },
    }
  }

  constructor() {
    super()

    this.updateComplete.then(() => {
      // const messagesContainer = this.renderRoot.querySelector('.cv-report-messages')
      // // const messages = []
      // // this.childNodes.forEach(node => {
      // //   messages.push(node.cloneNode(true))
      // // })
      // // // this.innerHTML = ''
      // // // messagesContainer.innerHTML = ''
      // // messages.forEach(message => messagesContainer.appendChild(message))
      // // // messagesContainer.append(this.childNodes[0])
      // initDownloadAssets(messagesContainer)
    })
  }

  connectedCallback() {
    super.connectedCallback()
    const self = this
    var observer = new MutationObserver(mutations => {
      const messagesContainer = self.renderRoot.querySelector('.cv-report-messages')
      // console.log(mutations)
      const messages = []
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === node.ELEMENT_NODE) {
              // console.info('Mutation: ', node)
              // console.info(reportMessagesContainer)
              // reportMessagesContainer.appendChild(node.cloneNode(true))
              messages.push(`<li data-error-code="${node.getAttribute('error-code')}">${node.innerHTML}</li>`)
            }
          })
          // console.info('Mutation: ', mutation)
        }
      })
      messagesContainer.innerHTML = `<ul>${messages.join('')}</ul>`
      observer.disconnect()

      initDownloadAssets(messagesContainer)
    })

    observer.observe(this, { childList: true })

    if (this.action === 'to-be-fixed') {
      cvReportManager.addError()
    }

    // this.children[0].outerHTML = '<strong>ALLO</strong>'
    // console.log(cvReportManager.stylesheet)
    adoptStyles(this.shadowRoot, [
      css`
        ${cvReportManager.stylesheet}
      `,
    ])
  }

  async updateAction(event) {
    fetch(`${process.env.CV_BASE_URL}/api/links/${this.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: event.target.value }),
    })
      .then(async response => {
        if (response.ok) {
          this.action = (await response.json()).action
          if (this.action === 'to-be-fixed') {
            cvReportManager.addError()
          } else {
            cvReportManager.removeError()
          }
          return
        }
        console.error(response)
      })
      .catch(error => {
        console.error(error)
      })
  }

  setActions() {
    const options = cvReportManager.actions
      .map(action => {
        const selectedAttribute = this.action === action.key ? ` selected` : ''
        return `<option value="${action.key}"${selectedAttribute}>${action.short}</option>`
      })
      .join('')

    return unsafeHTML(`${options}`)
  }

  setIcon() {
    return unsafeSVG(`
      <svg class="cv-i-${this.action}" >
        <use xlink:href=#icon-${this.action}></use>
      </svg>
    `)
  }

  render() {
    return html`
      ${unsafeSVG(svgSprite)}
      <dl>
        <dt>
          ${this.setIcon()}
          <a class="cv-url" href=${this.url} target="visualisation">${this.url}</a>
        </dt>
        ${this.text ? html`<dd><strong class="cv-report-item-label">Libellé :</strong> <em>${this.text}</em></dd>` : nothing}
        <dd>
          <strong class="cv-report-item-label">Statut :</strong>
          <span class="cv-lien-action-modifier cv-lien-action-modifier-menu">
            <select id="cv-lien-action-modifier-menu-${this.linkId}" @change=${this.updateAction} class="cv-action"
              data-cv-id="${this.linkId}">
              ${this.setActions()}
            </select>
          </span>
        </dd>
        ${this.finalUrl ? html`<dd><strong class="cv-report-item-label">Lien suggéré :</strong> <a href="${this.finalUrl}"
            target="visualisation" class="cv-url">${this.finalUrl}</a></dd>` : nothing}
        <dd class="cv-report-messages"></dd>
      </dl>
    `
  }
}

window.customElements.define('cv-report', CvReport)
