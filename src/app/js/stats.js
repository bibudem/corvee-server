import { html } from 'gridjs'
import { nanoid } from 'nanoid'
import '@graphiteds/core/components/gr-tab-group.js'
import '@graphiteds/core/components/gr-tab.js'
import '@graphiteds/core/components/gr-tab-panel.js'
import { userConfig } from '../../common/js/user-config.js'
import { TAB_KEY } from '../../common/js/constants.js'
import { actions, baseUrl } from '@corvee/client-config/app'
import '../../cv-grid/cv-grid.js'
import { AriaTabs } from '../../common/js/aria/aria-tabs.js'

const n = new Intl.NumberFormat('fr-CA').format

const errorCodeDetailsCache = new Map()

let statsCodeErreurContainer

async function getErrorCodeDetails(errorCode) {
  if (errorCodeDetailsCache.has(errorCode)) {
    return errorCodeDetailsCache.get(errorCode)
  }
  const statsDetailsService = new URL(`${baseUrl}/api/stats/error-codes/${errorCode}`, location)
  const currentJob = userConfig.get('currentJob')
  if (currentJob) {
    statsDetailsService.searchParams.set('job', currentJob)
  }

  const data = await fetch(statsDetailsService).then(response => response.json())

  errorCodeDetailsCache.set(errorCode, data)

  return data
}

function cellAttributes(attributes = {}) {
  return function cellAttributes(cell, row, column) {
    // console.log(arguments)
    // th
    if (cell === null && row === null) {
      return {
        ...attributes.all,
        ...attributes.th,
        tabindex: '-1',
      }
    }

    // td
    return {
      ...attributes.all,
      ...attributes.td,
      tabindex: '-1',
    }
  }
}

function conditionalIndexAttribute(cell, row, column) {
  // th
  if (cell === null && row === null) {
    return
  }

  // Empty td
  if (cell === null) {
    return { tabindex: '-1' }
  }
}

function buildDetailsPane(errorCode, activeTab, detailsData) {
  function linkFormatter(url) {
    return url ? html(`<a class="cv-url" target="visualisation" href="${url}" tabindex="-1">${url}</a>`) : url
  }

  let defaultSelectedTabIndex = -1
  const tabs = document.createElement('gr-tab-group')
  tabs.dataset.errorCode = errorCode

  tabs.innerHTML = ((actions, activeTab) => {
    const tabs = []
    const tabpanels = []
    for (const [i, action] of actions.entries()) {
      const tabId = `_${nanoid()}`
      const tabpanelId = `_${nanoid()}`

      if (action.key === activeTab) {
        defaultSelectedTabIndex = i
      }
      tabs.push(`<gr-tab id="${tabId}" role="tab" slot="nav" panel="${action.key}"${action.key === activeTab ? ` active` : ``} aria-controls="${tabpanelId}">${action.short}</gr-tab>`)
      tabpanels.push(`<gr-tab-panel id="${tabpanelId}" role="tabpanel" name="${action.key}"${action.key === activeTab ? ` active` : ``} aria-labelledby="${tabId}"></gr-tab-panel>`)
    }

    return `${tabs.join('')}${tabpanels.join('')}`
  })(actions, activeTab)

  tabs.aria = new AriaTabs(tabs, defaultSelectedTabIndex)

  detailsData.forEach(details => {
    const panel = tabs.querySelector(`gr-tab-panel[name="${details.action}"]`)
    const grid = document.createElement('cv-grid')
    const gridOptions = {
      columns: [
        //Define Table Columns
        { name: 'No.', id: 'no', resizable: true, sort: true, attributes: cellAttributes() },
        { name: 'Context', id: 'context', resizable: true, sort: true, formatter: linkFormatter },
        { name: 'URL', id: 'url', resizable: true, sort: true, formatter: linkFormatter },
        { name: 'Final URL', id: 'finalUrl', resizable: true, sort: true, formatter: linkFormatter, attributes: conditionalIndexAttribute },
      ],
      data: details.records,
      pagination: details.total >= 10,
    }
    grid.setAttribute('sort-column', 0)
    grid.setAttribute('sort-order', 'ascending')
    grid.setAttribute('per-page', 10)
    grid.options = gridOptions

    // grid._hasFocus = false

    // grid.addEventListener('focus', () => {
    //   grid._hasFocus = true
    // })

    // grid.addEventListener('blur', () => {
    //   grid._hasFocus = false
    // })

    // grid.addEventListener('keydown', event => {
    //   if (grid._hasFocus && event.key === TAB_KEY && !event.shiftKey) {
    //     event.preventDefault()
    //     tabs.dispatchEvent(new CustomEvent('blur.keyboard', { detail: { shiftKey: event.shiftKey } }))
    //   }
    // })

    panel.append(grid)
  })

  return tabs
}

async function onGridSelect(event) {
  const errorCode = event.detail.rowId
  const action = event.detail.column
  const detailsData = await getErrorCodeDetails(errorCode)
  const detailsTabs = buildDetailsPane(errorCode, action, detailsData)

  event.target.addDetails(errorCode, detailsTabs)
}

export async function initStats() {
  const serviceUrl = new URL(`${baseUrl}/api/stats/error-codes`, location)
  const currentJob = userConfig.get('currentJob')
  if (currentJob) {
    serviceUrl.searchParams.set('job', currentJob)
  }

  statsCodeErreurContainer = document.querySelector('#stats-error-code')

  const statsData = await fetch(serviceUrl)
    .then(response => response.json())
    .then(data => data.map((row, index) => ({ no: index + 1, ...row })))

  const gridOptions = {
    columns: [
      //Define Table Columns
      {
        name: 'No',
        id: 'no',
        hidden: true,
      },
      {
        name: "Code d'erreur",
        id: 'errorCode',
        sort: {
          compare: (a, b) => {
            a = a.toLowerCase()
            b = b.toLowerCase()
            if (a > b) {
              return 1
            } else if (b > a) {
              return -1
            } else {
              return 0
            }
          },
        },
        attributes: cellAttributes(),
      },
      { name: 'À corriger', id: 'toBeFixed', sort: true, formatter: n, attributes: cellAttributes({ td: { class: 'gridjs-td selectable' } }) },
      { name: 'Corrigé', id: 'fixed', sort: true, formatter: n, attributes: cellAttributes({ td: { class: 'gridjs-td selectable' } }) },
      { name: 'Faux Positif!', id: 'noError', sort: true, formatter: n, attributes: cellAttributes({ td: { class: 'gridjs-td selectable' } }) },
      { name: 'Ignorer', id: 'ignore', sort: true, formatter: n, attributes: cellAttributes({ td: { class: 'gridjs-td selectable' } }) },
      { name: 'Total', id: 'total', sort: true, formatter: n, attributes: cellAttributes() },
    ],
    data: statsData,
  }

  const grid = document.createElement('cv-grid')
  grid.setAttribute('sort-column', 5)
  grid.setAttribute('sort-order', 'descending')
  grid.options = gridOptions
  grid.addEventListener('select', onGridSelect)
  statsCodeErreurContainer.append(grid)
}
