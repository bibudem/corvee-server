import { LitElement, css, html, unsafeCSS, nothing } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { classMap } from 'lit/directives/class-map.js'
import { MDCMenuSurface } from '@material/menu-surface'
import moment from 'moment/moment.js'
import 'moment/locale/fr'
import { ENTER_KEY, SPACE_KEY } from '../common/js/constants.js'
import { userConfig } from '../common/js/user-config.js'
import { baseUrl } from 'client-config/app'
import stylesheet from './js/stylesheet.js'
import svgSprite from './assets/sprite.svg'
// import stylesheet2 from './scss/cv-job-list.scss'

// Default date lang
moment.locale('fr')

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

    // this.jobs = []
    this.currentJob = this.currentJob || userConfig.get('currentJob')

    this.show = this.show.bind(this)
    this._select = this._select.bind(this)

    this.getJobs()

    this.updateComplete.then(() => {
      this.menu = new MDCMenuSurface(this.renderRoot.querySelector('.mdc-menu-surface'))
      this.renderRoot.querySelector('.cv-dropdown-toggle').addEventListener('click', this.show)
    })
  }

  connectedCallback() {
    super.connectedCallback()

    this.renderRoot.addEventListener('click', this._select)
    this.renderRoot.addEventListener('keyup', this._select)
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
    console.log(event)
    console.log(event.originalTarget)
    const srcElem = /* Firefox MouseEvent event */ event.originalTarget || /* Chrome PointerEvent event */ event.path[0]

    if (srcElem.getAttribute('role') !== 'menuitem') {
      return
    }

    if (srcElem.getAttribute('aria-current') === 'true') {
      return
    }

    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.type === 'click' || keyboardSelectItemEvent) {
      console.log('YES')
      event.stopPropagation()
      this.setJob(srcElem.dataset.value)
      keyboardSelectItemEvent && this.hide()
      return
    }
  }

  async getJobs() {
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
          return
        }
        console.error(response)
      })
      .catch(error => {
        console.error(error)
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
    return moment(this.currentJob ?? this.defaultJob).format('LL')
  }

  render() {
    return html`
      ${unsafeSVG(svgSprite)}
      <div class="cv-jobs-list">
        <button class="cv-dropdown-toggle mdc-button">${this._getCurrentJob()}</button>
        <div class="mdc-menu-surface--anchor">
          <div class="mdc-menu-surface">
            <ul class="mdc-deprecated-list" role="menu">
              ${this.jobs?.map(job => {
                const isActive = { active: job === this.currentJob }
                return html` <li class="mdc-deprecated-list-item ${classMap(isActive)}" role="menuitem" data-value="${job}" tabindex="0" aria-current="${job === this.currentJob}">
                  <span class="mdc-deprecated-list-item__ripple"></span>
                  <span class="cv-dropdown-item-container mdc-deprecated-list-item__text">
                    <span class="cv-dropdown-item-icon">${job === this.currentJob ? this._setActiveIcon() : nothing}</span>
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
