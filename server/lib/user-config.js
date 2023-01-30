import config from 'config'

const longDateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeZone: 'UTC' })

const expires = new Date(config.get('job.deadline'))

const clientProps = ['currentJob', 'hideFixed', 'isActive']

class UserConfig {
  #clientProps
  #cookieName
  #cookieOptions
  #harvestDate
  #req
  #res

  constructor(cookie, props) {
    this.#cookieName = cookie.name
    this.#cookieOptions = {
      ...cookie.options,
      expires: expires < Date.now() ? expires : 0,
    }
    this.#clientProps = {}
    this.#req = null
    this.#res = null
    this.#harvestDate = null
    this.defaultJob = props.currentJob

    Object.defineProperty(this, 'harvestDate', {
      enumerable: true,
      configurable: false,
      get() {
        return this.#harvestDate ? longDateFormat.format(new Date(this.#harvestDate)) : this.#harvestDate
      },
      set(value) {
        this.#harvestDate = value
      },
    })

    clientProps.forEach(prop => {
      Object.defineProperty(this, prop, {
        enumerable: true,
        configurable: true,
        set(value) {
          this.#clientProps[prop] = value
          this.#writeCookie({ [prop]: value })
        },
        get() {
          return this.#clientProps[prop]
        },
      })
    })

    Object.keys(props).forEach(prop => {
      if (clientProps.includes(prop)) {
        this.#clientProps[prop] = props[prop]
      } else {
        this[prop] = props[prop]
      }
    })
  }

  #readCookie() {
    if (typeof this.#req.cookies[this.#cookieName] === 'undefined') {
      return null
    }
    return JSON.parse(this.#req.cookies[this.#cookieName])
  }

  #writeCookie(data) {
    const defaultData = this.#readCookie() || {}
    const newData = Object.assign({}, defaultData, data)
    this.#res.cookie(this.#cookieName, JSON.stringify(newData), this.#cookieOptions)
  }

  getCurrentJob() {
    return {
      job: this.currentJob,
      defaultJob: this.defaultJob,
      harvestDate: this.harvestDate,
      deadline: this.currentJob === this.defaultJob ? this.deadline : null,
    }
  }

  loadConfig(req, res) {
    this.#req = req
    this.#res = res

    const clientConfig = this.#readCookie() || {}
    Object.keys(clientConfig).forEach(prop => {
      // if (prop === 'currentJob') {
      //   console.log(`[userConfig] currentJob: ${this.currentJob}`)
      //   console.log(`[clientConfig] currentJob: ${clientConfig[prop]}`)
      // }
      if (prop === 'currentJob' && this.currentJob !== clientConfig.currentJob) {
        this.harvestDate = clientConfig.currentJob
      }
      this.#clientProps[prop] = clientConfig[prop]
    })
  }
}

export const userConfig = new UserConfig(config.get('app.cookie'), {
  currentJob: config.get('job.currentJob'),
  harvestDate: config.get('job.harvestDate'),
  deadline: longDateFormat.format(new Date(config.get('job.deadline'))),
})
