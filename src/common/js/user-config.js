import Cookies from 'js-cookie'
import config from '@corvee/client-config'

class UserConfig extends EventTarget {
  #master

  constructor(cookie) {
    super()

    this.#master = window.parent === window ? null : window.parent

    Object.defineProperty(this, 'host', {
      value: this.#master ? 'slave' : 'master',
      enumerable: true,
    })

    this._cookieName = cookie.name
    this._cookieAttributes = cookie.options

    const expires = new Date(config.job.deadline)

    if (expires > Date.now()) {
      this._cookieAttributes.expires = expires
    }

    this._cookie = Cookies.withAttributes(this._cookieAttributes)

    // if (!this._cookie.get(this._cookieName)) {
    //   this._cookie.set(this._cookieName, JSON.stringify({ currentJob: config.job.currentJob }))
    // }

    if (this.host === 'slave') {
      window.addEventListener('message', event => {
        if (event.data?.cv && event.data.event?.endsWith('.user-config')) {
          const userConfigEvent = event.data.event.split('.')[0]
          const msg = event.data
          this.#dispatch(userConfigEvent, msg.data, false)
        }
      })
    }
  }

  #dispatch(event, data, postMessage = true) {
    console.log('[%s] (userConfig) dispatching event `%s` with data: %o', this.host, event, data)
    this.dispatchEvent(new CustomEvent(event, { detail: data }))
    if (this.host === 'master' && postMessage) {
      for (let i = 0; i < window.frames.length; i++) {
        window.frames[i].postMessage(
          {
            cv: true,
            event: `${event}.user-config`,
            data,
          },
          '*'
        )
      }
    }
  }

  set(data) {
    const oldData = this.getAll()
    const prop = Object.keys(data)[0]
    const value = data[prop]
    if (Reflect.has(oldData, prop) && oldData[prop] === value) {
      return
    }
    const newData = Object.assign(oldData, data)
    this._cookie.set(this._cookieName, JSON.stringify(newData))
    this.#dispatch('change', { prop, value })
  }

  get(key) {
    const searchParams = new URLSearchParams(location.search)
    const keyParam = key === 'currentJob' ? 'job' : key
    if (searchParams.has(keyParam)) {
      return searchParams.get(keyParam)
    }

    try {
      return JSON.parse(this._cookie.get(this._cookieName))[key]
    } catch {
      return null
    }
  }

  getAll() {
    try {
      return JSON.parse(this._cookie.get(this._cookieName))
    } catch {
      return {}
    }
  }
}

export const userConfig = new UserConfig(config.app.cookie)

globalThis.corvee = globalThis.corvee || {}
globalThis.corvee.userConfig = userConfig
