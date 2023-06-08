/*
 * @fileOverview Script de chargement de l'application Corvée
 * Chargement des librairies dont dépend celui-ci, puis initialisation *
 * @author <a href = "mailto:christian.remillard@umontreal.ca"> Christian Rémillard </a>
 * @preserve
 */

import Cookie from 'js-cookie'
import { baseUrl, version, cookie } from '@corvee/client-config/app'
import { L_KEY } from '../common/js/constants.js'

const role = self === top ? 'master' : 'slave'

let app

async function importApp() {
  return new Promise(async (resolve, reject) => {
    if (app) {
      return resolve(app)
    }

    try {
      const url = `${baseUrl}/${version}/client/corvee.js`
      const { corveeApp } = await import(url)
      app = corveeApp
      resolve(app)
    } catch (error) {
      reject(error)
    }
  })
}

function start(notify = false) {
  console.log('[%s] Starting app from loader', role)
  importApp()
    .then(app => app.start(notify))
    .catch(error => {
      console.error(`Error loading app: %o`, error)
    })
}

function stop(notify = false) {
  if (app) {
    console.log('[%s] Stopping app from loader', role)
    app.stop(notify)
  }
}

function isActive() {
  const cvCookie = Cookie.get(cookie.name)

  let active = false

  if (cvCookie) {
    try {
      active = JSON.parse(cvCookie).isActive
    } catch (error) {
      console.error('Error parsing cookie: %o', error)
    }
  }

  return active
}

//
// Initialisation
//

window.addEventListener('message', function (event) {
  // console.log('[%s] Got a message: %o', _c.role, event.data)
  if (typeof event.data === 'object' && 'cv' in event.data && event.data.action) {
    var msg = event.data
    console.log('[%s] got a message from %s:  %o', role, role === 'master' ? 'slave' : 'master', msg)

    switch (msg.action) {
      case 'start':
        start(false)
        break
      case 'stop':
        stop(false)
        break
    }
  }
})

document.addEventListener('keydown', async function (event) {
  const altKey = event.altKey
  if (altKey && event.key === L_KEY) {
    // alt-l
    if (isActive()) {
      stop(true)
    } else {
      start(true)
    }
  }
})

if (isActive()) {
  start()
}
