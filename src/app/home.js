import { userConfig } from '../common/js/user-config.js'
import './js/app-base.js'
import { initStats } from './js/stats.js'
import { baseUrl } from '@corvee/client-config/app'
import toBeFixedIcon from '../common/icons/to-be-fixed.svg'
import fixedIcon from '../common/icons/fixed.svg'

document.addEventListener('DOMContentLoaded', async () => {
  const serviceUrl = new URL(`${baseUrl}/api/sections/count`, location)
  serviceUrl.searchParams.set('action', 'to-be-fixed')
  serviceUrl.searchParams.set('job', userConfig.get('currentJob'))
  const data = await fetch(serviceUrl).then(response => response.json())
  Object.keys(data).forEach(key => {
    const totalErrors = data[key]
    const countText = totalErrors > 1 ? `${totalErrors} erreurs` : `${totalErrors} erreur`
    const elem = document.querySelector(`[data-section-key="${key}"`)
    const svgIcon = elem.querySelector('svg')
    elem.querySelector('.cv-section-errors').replaceChildren(document.createTextNode(countText))

    svgIcon.outerHTML = totalErrors ? toBeFixedIcon : fixedIcon
  })

  initStats()
})
