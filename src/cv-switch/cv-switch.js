import cvSwitchStyles from './scss/cv-switch.scss'
import checkIcon from './assets/icons/check.svg'
import clearIcon from './assets/icons/clear.svg'

export default class CvSwitch extends HTMLElement {
  static get observedAttributes() {
    return ['aria-checked', 'checked']
  }

  #checked
  #isInitialized

  #setCheckAttributes() {
    if (this.checked) {
      if (!this.hasAttribute('checked')) {
        this.setAttribute('checked', '')
      }
      if (this.getAttribute('aria-checked') !== 'true') {
        this.setAttribute('aria-checked', 'true')
      }
    } else {
      this.removeAttribute('checked')
      if (this.getAttribute('aria-checked') !== 'false') {
        this.setAttribute('aria-checked', 'false')
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (['aria-checked', 'checked'].includes(name)) {
      this.checked = name === 'aria-checked' ? newValue === 'true' : newValue === ''
    }
  }

  constructor() {
    super()

    this.#isInitialized = false
    this.#checked = false

    this.attachShadow({ mode: 'open' })

    this.shadowRoot.innerHTML = this.render()

    this.addEventListener('click', this.toggleStatus)
    this.addEventListener('keydown', event => {
      this.handleKeydown(event)
    })
  }

  get checked() {
    return this.#checked
  }

  set checked(checked) {
    if (typeof checked !== 'boolean') {
      throw new TypeError(`Checked value must be a boolean. Got a ${typeof checked}`)
    }

    if (this.#checked !== checked) {
      this.#checked = checked
      this.#setCheckAttributes()
      this.dispatchEvent(new Event('change'))
    }
  }

  connectedCallback() {
    if (!this.#isInitialized) {
      this.#isInitialized = true
      this.setAttribute('role', 'switch')
      this.setAttribute('tabindex', '0')

      if (this.hasAttribute('checked')) {
        this.#checked = true
      } else if (this.hasAttribute('aria-checked') && ['true', 'false'].includes(this.getAttribute('aria-checked'))) {
        this.#checked = this.getAttribute('aria-checked') === 'true'
      }
      this.#setCheckAttributes()
    }
  }

  handleKeydown(event) {
    // Only do something when space or return is pressed
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.toggleStatus()
    }
  }

  // Switch state of a switch
  toggleStatus() {
    const currentState = this.getAttribute('aria-checked') === 'true'
    const newState = String(!currentState)

    this.setAttribute('aria-checked', newState)
    this.checked = newState === 'true'
  }

  render() {
    const onLabel = this.hasAttribute('on') ? `<span class="on" aria-hidden="true">${this.getAttribute('on')}</span>` : ''
    const offLabel = this.hasAttribute('off') ? `<span class="off" aria-hidden="true">${this.getAttribute('off')}</span>` : ''
    return `
      <style>
        ${cvSwitchStyles}
      </style>
      <span class="container">
        <span class="switch">
          <span class="thumb">${checkIcon}${clearIcon}</span>
        </span>
        ${onLabel}
        ${offLabel}
        <span class="label">
          <slot></slot>
        </span>
      </span>
    `
  }
}

customElements.define('cv-switch', CvSwitch)
