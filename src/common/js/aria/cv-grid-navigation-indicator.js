import styles from '../../scss/cv-grid-navitgation-indicator.scss'

class CvGridNavigationIndicator extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super()

    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' })

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(styles)
    shadow.adoptedStyleSheets = [sheet]
  }
}

customElements.define('cv-grid-navigation-indicator', CvGridNavigationIndicator)
