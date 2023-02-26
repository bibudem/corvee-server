import { LitElement, css, html, unsafeCSS, nothing } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { classMap } from 'lit/directives/class-map.js'
import { MDCMenuSurface } from '@material/menu-surface'
import { ENTER_KEY, SPACE_KEY } from '../common/js/constants.js'
import { userConfig } from '../common/js/user-config.js'
import { baseUrl } from '@corvee/client-config/app'
import { currentJob as defaultJob } from '@corvee/client-config/job'
import checkIcon from '../common/icons/check.svg'
import stylesheet from './js/stylesheet.js'

const longDateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeZone: 'UTC' })

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvJobList extends LitElement {
  static styles = css`
    ${unsafeCSS(stylesheet)}
  `

  static get properties() {
    return {
      jobs: {
        type: Array,
      },
      currentJob: {
        type: String,
        attribute: 'current-job',
      },
      defaultJob: {
        type: String,
      },
    }
  }

  constructor() {
    super()

    this.currentJob = this.currentJob || userConfig.get('currentJob')
    this.defaultJob = defaultJob
    this.jobs = []

    this.updateComplete.then(async () => {
      await this.getJobs()
      this.menu = new MDCMenuSurface(this.renderRoot.querySelector('.mdc-menu-surface'))
      this.renderRoot.querySelector('.cv-dropdown-toggle').addEventListener('click', this.show.bind(this))
    })
  }

  connectedCallback() {
    super.connectedCallback()

    this.renderRoot.addEventListener('click', this._select.bind(this))
    this.renderRoot.addEventListener('keyup', this._select.bind(this))
  }

  disconnectedCallback() {}

  hide() {
    if (this.menu.isOpen()) {
      this.menu.close()
    }
  }

  show() {
    if (/* is open */ this.menu.isOpen() || /* is closing */ this.menu.root.classList.contains('mdc-menu-surface--animating-closed')) {
      return
    }
    this.menu.open()
  }

  _select(event) {
    const srcElem = event.composedPath()[0]

    if (srcElem.getAttribute('role') !== 'menuitem') {
      return
    }

    if (srcElem.getAttribute('aria-current') === 'true') {
      return
    }

    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.type === 'click' || keyboardSelectItemEvent) {
      event.stopPropagation()
      this.setJob(srcElem.dataset.value)
      keyboardSelectItemEvent && this.hide()
      return
    }
  }

  async getJobs() {
    return new Promise((resolve, reject) => {
      return fetch(`${baseUrl}/api/jobs`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async response => {
          if (response.ok) {
            const data = await response.json()
            this.jobs = data.jobs
            this.defaultJob = data.default
            return resolve()
          }
          console.error(response)
          reject(response)
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })
    })
  }

  setJob(job) {
    this.currentJob = job
    userConfig.set({ currentJob: job })
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: job,
      })
    )
  }

  _setActiveIcon() {
    return html`<svg class="cv-i-check" role="img">
      <title>Sélectionné</title>
      <use xlink:href="#icon-check"></use>
    </svg>`
  }

  _getCurrentJob() {
    return longDateFormat.format(new Date(this.currentJob ?? this.defaultJob))
  }

  render() {
    return html`
      <div class="cv-jobs-list">
        <button class="cv-dropdown-toggle mdc-button">${this._getCurrentJob()}</button>
        <div class="mdc-menu-surface--anchor">
          <div class="mdc-menu-surface">
            <ul class="mdc-deprecated-list" role="menu">
              ${this.jobs?.map(job => {
                const isActive = { active: this.currentJob ? job === this.currentJob : job === this.defaultJob }
                return html` <li class="mdc-deprecated-list-item ${classMap(isActive)}" role="menuitem" data-value="${job}" tabindex="0" aria-current="${isActive.active}">
                  <span class="mdc-deprecated-list-item__ripple"></span>
                  <span class="cv-dropdown-item-container mdc-deprecated-list-item__text">
                    <span class="cv-dropdown-item-icon">${isActive.active ? unsafeHTML(checkIcon) : nothing}</span>
                    <span>${job}</span>
                    <span class="cv-dropdown-item-marker">${job === this.defaultJob ? '*' : ''}</span>
                  </span>
                </li>`
              })}
            </ul>
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('cv-job-list', CvJobList)
