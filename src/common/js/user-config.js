import Cookies from 'js-cookie'
import app from '../../../config/app.cjs'
import { app as local } from '../../../config/local.cjs'
import { currentJob, deadline } from '../../../config/job.cjs'

const config = Object.assign({}, app, local)

class UserConfig {
  constructor(name) {
    this._cookieName = name
    this._cookieAttributes = {
      domain: config.domain,
    }

    const expires = new Date(deadline)

    if (expires > Date.now()) {
      this._cookieAttributes.expires = expires
    }

    this._cookie = Cookies.withAttributes(this._cookieAttributes)

    if (this._cookie.get(this._cookieName) === undefined) {
      this._cookie.set(this._cookieName, JSON.stringify({ currentJob }))
    }
  }

  set(data) {
    const oldData = this.getAll()
    const newData = Object.assign(oldData, data)
    this._cookie.set(this._cookieName, JSON.stringify(newData))
  }

  get(key) {
    return JSON.parse(this._cookie.get(this._cookieName))[key]
  }

  getAll() {
    return JSON.parse(this._cookie.get(this._cookieName))
  }
}

export const userConfig = new UserConfig(config.cookie)

globalThis.corvee = globalThis.corvee || {}
globalThis.corvee.userConfig = userConfig
