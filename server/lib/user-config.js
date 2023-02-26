import config from 'config'

const expires = new Date(config.get('job.deadline'))

const clientProps = ['currentJob', 'hideFixed', 'isActive']

class UserConfig {
  #clientProps
  #cookieName
  #cookieOptions
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
    this.defaultJob = props.currentJob

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

  loadConfig(req, res) {
    this.#req = req
    this.#res = res

    const clientConfig = this.#readCookie() || {}

    Object.keys(clientConfig).forEach(prop => {
      this.#clientProps[prop] = clientConfig[prop]
    })
  }
}

export const userConfig = new UserConfig(config.get('app.cookie'), {
  currentJob: config.get('job.currentJob'),
})
