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

function postMessage(which, data) {
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

function start(notify = false) {
  function doStart() {
    console.log('[%s] Starting corvee...', role)
    return importApp()
      .then(() => app.start())
      .catch(error => {
        console.error(`Error loading app: %o`, error)
      })
  }

  if (!notify) {
    doStart()
    return
  }

  console.log('[%s] postMessage: start', role)
  if (role === 'master') {
    doStart().then(() => {
      postMessage('slaves', {
        action: 'start',
      })
    })
  } else {
    postMessage('master', {
      action: 'start',
    }).then(() => {
      doStart()
    })
  }
}

function stop(notify = false) {
  function doStop() {
    console.log('[%s] Stopping app', role)
    app.stop()
  }

  if (app) {
    doStop()

    if (notify) {
      console.log('[%s] postMessage: stop', role)
      postMessage(role === 'master' ? 'slaves' : role, {
        action: 'stop',
      })
    }
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
