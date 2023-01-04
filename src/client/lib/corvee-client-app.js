// import extractUrls from 'extract-urls'
import { ReportWidget } from '../../cv-report-widget/report-widget.js'
import '../../cv-console/cv-console.js'
import reportManager from '../../common/js/report-manager.js'
import { normalizeUrl } from '../../common/js/normalize-url.js'
import { userConfig } from '../../common/js/user-config.js'
import { baseUrl, version } from 'client-config/app'

// const fontDescriptorsMap = {
//   'ascent-override': 'ascentOverride',
//   'descent-override': 'descentOverride',
//   'font-display': 'display',
//   'font-feature-settings': 'featureSettings',
//   'line-gap-override': 'lineGapOverride',
//   'font-stretch': 'stretch',
//   'font-style': 'style',
//   'unicode-range': 'unicodeRange',
//   'font-variation-settings': 'variationSettings',
//   'font-weight': 'weight',
// }

export class CorveeClientApp {
  constructor() {
    Object.defineProperty(this, 'role', {
      value: window === window.top ? 'master' : 'slave',
      enumerable: true,
    })

    this.console = this.role === 'master' ? document.createElement('cv-console') : null

    this.reportWidgets = []

    this.fontsStylesheet = new CSSStyleSheet()
    this.fontsStylesheet.disabled = true
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.fontsStylesheet]

    this._loadFonts()

    userConfig.addEventListener('change', event => {
      console.log('[%s] (corveeClientApp) got a `change` event from userConfig: %s = %s', this.role, event.detail.prop, event.detail.value)
      if (event.detail.prop === 'currentJob') {
        this._loadData()
          .then(() => {
            console.log('[%s] Done loading data: %o', this.role, this.data)
            this._buildReportWidgets()
          })
          .catch(error => console.error('Error loading data: %o', error))
      }
    })

    if (this.role === 'master') {
      this.console.addEventListener('close', () => this.stop())
    }
  }

  #notify(message) {
    if (this.role === 'master') {
      this.slaves.forEach(slave => slave.postMessage(message, '*'))
    }
  }

  start() {
    userConfig.set({ isActive: true })
    this.fontsStylesheet.disabled = false
    if (this.role === 'master') {
      document.body.prepend(this.console)
      setTimeout(() => {
        this.console.show()
      })
    }
    this._loadData()
      .then(() => this._buildReportWidgets())
      .catch(error => console.error('[%s] Error loading data: %o', this.role, error))
  }

  async stop() {
    return new Promise((resolve, reject) => {
      userConfig.set({ isActive: false })

      this._killWidgets()

      if (this.role === 'master') {
        this.console.close()
        this.console.addEventListener(
          'transitionend',
          () => {
            this.console.remove()
            resolve()
          },
          { once: true }
        )
      } else {
        resolve()
      }
    }).then(() => {
      console.log(this)
      this.fontsStylesheet.disabled = true
    })
  }

  _killWidgets() {
    while (this.reportWidgets.length > 0) {
      this.reportWidgets.pop().dispose()
    }
  }

  async _loadFonts() {
    const { default: css } = await import(`${baseUrl}/${version}/client/fonts.js`)
    this.fontsStylesheet.replaceSync(css)

    // Preloading fonts
    // if (this.role === 'master') {
    //   for (const rule of stylesheet.cssRules) {
    //     if (rule.constructor.name === 'CSSFontFaceRule') {
    //       const fontFamily = rule.style.fontFamily
    //       const source = `url(${extractUrls(rule.style.src)[0]})`
    //       const descriptors = {}
    //       for (var i = 0; i < rule.style.length; i++) {
    //         const prop = rule.style[i]
    //         if (typeof fontDescriptorsMap[prop] !== 'undefined') {
    //           descriptors[prop] = rule.style[prop]
    //         }
    //       }
    //       const fontFace = new FontFace(fontFamily, source, descriptors)
    //       fontFace.load()
    //       document.fonts.add(fontFace)
    //     }
    //   }
    //   // document.fonts.load()
    // }
  }

  async _loadData() {
    console.log('[%s] Loading data for job %s', this.role, userConfig.get('currentJob'))
    return new Promise(async (resolve, reject) => {
      const api = new URL(`${baseUrl}/api/links`)
      api.searchParams.set('parent', normalizeUrl(window.location))

      fetch(api, {
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }

          return response.json()
        })
        .then(data => {
          this.data = data
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  _buildReportWidgets() {
    this._killWidgets()

    if (this.data.total > 0) {
      this.data.reports.forEach(report => {
        const url = report.url.split('\\').join('\\\\').split('"').join('\\"')
        const elem = Array.from(document.querySelectorAll('a[href="' + url + '"]:not([data-cv-report-widget]), img[src="' + url + '"]:not([data-cv-report-widget])')).filter(elem => {
          let label = elem.innerText.replace(/\n/g, '').trim()
          if (elem.nodeName === 'A') {
            if (label === '' && elem.querySelectorAll(':scope > img[alt]').length > 0) {
              label = elem.querySelector('img[alt]').getAttribute('alt').trim()
            }

            return (
              label ===
              (() => {
                const div = document.createElement('div')
                div.innerHTML = report.text.replace(/\n/g, '')
                return div.innerText.trim()
              })()
            )
          } else if (elem.nodeName === 'IMG') {
            if (!elem.hasAttribute('alt')) {
              return true
            }
            return elem.getAttribute('alt').replace(/\n/, '').trim() === report.text.replace(/\n/g, '').trim()
          }
          return false
        })[0]

        if (elem) {
          this.reportWidgets.push(new ReportWidget(elem, report))
        }
      })
    }
  }
}
