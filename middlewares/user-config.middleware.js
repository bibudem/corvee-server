import moment from 'moment'
import config from 'config'
import { harvestDate } from '../config/job.cjs'

// Default date lang
moment.locale('fr-CA')

const expires = new Date(config.get('job.deadline'))

const clientProps = ['currentJob', 'hideFixed', 'isActive']

class UserConfig {
  #clientProps
  #cookieName
  #cookieOptions
  #harvestDate
  #req
  #res

  constructor(cookieName, props) {
    // this.defaults = defaults
    this.#cookieName = cookieName
    this.#cookieOptions = {
      domain: config.get('app.domain'),
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
        return this.#harvestDate ? moment(this.#harvestDate).format('LL') : this.#harvestDate
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

          // if (prop === 'currentJob') {
          //   this.harvestDate = moment(props[prop]).format('LL')
          // }
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

const userConfig = new UserConfig(config.get('app.cookie'), {
  currentJob: config.get('job.currentJob'),
  harvestDate: config.get('job.harvestDate'),
  deadline: moment(config.get('job.deadline')).format('LL'),
})

export async function userConfigMiddleware(req, res, next) {
  userConfig.loadConfig(req, res)

  if (req.query.job) {
    userConfig.currentJob = req.query.job
    userConfig.harvestDate = req.query.job
  }

  req.userConfig = userConfig
  next()
}
