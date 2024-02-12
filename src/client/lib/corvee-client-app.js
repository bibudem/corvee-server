import { ReportWidget } from '../../cv-report-widget/report-widget.js'
import '../../cv-console/cv-console.js'
import { normalizeUrl } from '../../common/js/normalize-url.js'
import { userConfig } from '../../common/js/user-config.js'
import { baseUrl, version } from '@corvee/client-config/app'
import { getNodeText } from '../../common/js/get-node-text.js'

function postMessage(which, data) {
  console.log('===== postMessage ===== wich: %s, data: %o', which, data)
  return new Promise((resolve, reject) => {
    let ports = [window.parent]
    if (which === 'slaves') {
      ports = window.frames
    }

    for (var i = 0; i < ports.length; i++) {
      ports[i].postMessage(
        {
          ...data,
          cv: true,
        },
        '*'
      )
    }
    resolve()
  })
}

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
      // console.log('[%s] (corveeClientApp) got a `change` event from userConfig: %s = %s', this.role, event.detail.prop, event.detail.value)
      if (event.detail.prop === 'currentJob') {
        this._loadData()
          .then(() => {
            // console.log('[%s] Done loading data: %o', this.role, this.data)
            this._buildReportWidgets()
          })
          .catch(error => console.error('Error loading data: %o', error))
      }
    })

    if (this.role === 'master') {
      this.console.addEventListener('close', () => {
        console.log('[%s] close event from console', this.role)
        this.stop(true)
      })
    }
  }

  #notify(message) {
    if (this.role === 'master') {
      this.slaves.forEach(slave => slave.postMessage(message, '*'))
    }
  }

  start(notify = false) {
    const role = this.role
    const self = this

    function doStart() {
      console.log('[%s] Starting corvee...', role)

      this.fontsStylesheet.disabled = false
      if (self.role === 'master') {
        userConfig.set({ isActive: true })
        document.body.prepend(self.console)
        setTimeout(() => {
          self.console.show()
        })
      }

      return self
        ._loadData()
        .then(() => self._buildReportWidgets())
        .catch(error => console.error('[%s] Error loading data: %o', self.role, error))
    }

    if (!notify) {
      doStart.call(this)
      return
    }

    console.log('[%s] postMessage: start', role)
    if (role === 'master') {
      console.log('[%s] postMessage: starting app', role)
      doStart.call(this).then(() => {
        console.log('[%s] postMessage: done', role)
        postMessage('slaves', {
          action: 'start',
        })
      })
    } else {
      postMessage('master', {
        action: 'start',
      }).then(() => {
        doStart.call(this)
      })
    }
  }

  async stop(notify = false) {
    return new Promise((resolve, reject) => {

      console.log('[%s] Stopping app', this.role)
      userConfig.set({ isActive: false })

      this._killWidgets()

      if (this.role === 'master') {
        if (this.console.open) {
          this.console.close()
        }
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

      if (notify) {
        console.log('[%s] postMessage: stop', this.role)
        postMessage(this.role === 'master' ? 'slaves' : this.role, {
          action: 'stop',
        })
      }

    }).then(() => {
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
    this.fontsStylesheet.replace(css)

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
    const currentJob = userConfig.get('currentJob')
    // console.log('[%s] Loading data for job %s', this.role, currentJob ?? 'default')
    // console.log(userConfig)
    return new Promise(async (resolve, reject) => {
      const api = new URL(`${baseUrl}/api/links`)
      api.searchParams.set('parent', normalizeUrl(window.location))

      if (currentJob) {
        api.searchParams.set('job', currentJob)
      }

      fetch(api)
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
        const url = report.urlData.split('\\').join('\\\\').split('"').join('\\"')
        const elem = Array.from(document.querySelectorAll('a[href="' + url + '"]:not([data-cv-report-widget]), img[src="' + url + '"]:not([data-cv-report-widget])')).filter(elem => {
          const text = getNodeText(elem)

          if (elem.nodeName === 'A') {
            return (
              text ===
              (() => {
                const div = document.createElement('div')
                div.innerHTML = report.text.replace(/\n/g, '')
                return div.innerText.trim()
              })()
            )
          } else if (elem.nodeName === 'IMG') {
            return text === report.text
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
