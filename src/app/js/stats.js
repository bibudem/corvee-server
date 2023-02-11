// import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { Grid, html } from 'gridjs'
import { frFR } from 'gridjs/l10n'
import '@graphiteds/core/components/gr-tab-group.js'
import '@graphiteds/core/components/gr-tab.js'
import '@graphiteds/core/components/gr-tab-panel.js'
import { waitFor } from '../../common/js/wait-for.js'
import { userConfig } from '../../common/js/user-config.js'
import { actions, baseUrl } from '@corvee/client-config/app'
import { SPACE_KEY, ENTER_KEY } from '../../common/js/constants.js'
import { Grid as AriaGrid } from '../../common/js/aria/grid.js'

const n = new Intl.NumberFormat('fr-CA').format

const errorCodeDetailsCache = new Map()

let statsCodeErreurContainer

// Locale personnalisations
frFR.pagination.showing = ' '
frFR.pagination.to = '–'
frFR.pagination.of = 'de'
frFR.pagination.results = ' '
frFR.pagination.firstPage = 'Première page'
frFR.pagination.lastPage = 'Dernière page'

function camelCaseToKebabCase(str) {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}` : letter
    })
    .join('')
}

async function getErrorCodeDetails(errorCode) {
  if (errorCodeDetailsCache.has(errorCode)) {
    return errorCodeDetailsCache.get(errorCode)
  }
  const statsDetailsService = new URL(`${baseUrl}/api/stats/error-codes/${errorCode}`, location)
  statsDetailsService.searchParams.set('job', userConfig.get('currentJob'))

  const data = await fetch(statsDetailsService).then(response => response.json())

  errorCodeDetailsCache.set(errorCode, data)

  return data
}

function cellAttributes(attributes = {}) {
  return function cellAttributes(cell, row, column) {
    if (cell !== null) {
      return {
        ...attributes.all,
        ...attributes.td,
        tabindex: '-1',
      }
    }
    return {
      ...attributes.all,
      ...attributes.th,
      tabindex: '-1',
    }
  }
}

function setAriaGrid(table, defaultSortColumn = -1, sortOrder) {
  console.log('setAriaGrid: %o', table)
  const options = { attributes: true }
  const observer = new MutationObserver(mutationList => {
    mutationList = mutationList.filter(mutation => mutation.attributeName === 'class')
    for (const mutation of mutationList) {
      const target = mutation.target
      const sortOrder = target.classList.contains('gridjs-sort-asc') ? 'ascending' : target.classList.contains('gridjs-sort-desc') ? 'descending' : 'none'
      if (sortOrder === 'none') {
        target.parentElement.removeAttribute('aria-sort')
      } else {
        target.parentElement.setAttribute('aria-sort', sortOrder)
      }
    }
  })
  new AriaGrid(table)
  table.querySelectorAll(':scope > thead > tr > th.gridjs-th-sort').forEach((th, i) => {
    if (i === defaultSortColumn) {
      th.setAttribute('aria-sort', sortOrder)
    }
    const btn = th.querySelector('button.gridjs-sort')
    if (btn) {
      observer.observe(btn, options)
    }
  })
}

function buildPane(errorCode, activeTab, detailsData) {
  function linkFormatter(url) {
    return url ? html(`<a class="cv-url" target="visualisation" href="${url}">${url}</a>`) : url
  }

  const pane = document.createElement('div')
  pane.classList.add('cv-pane')

  const tabs = document.createElement('gr-tab-group')
  tabs.dataset.errorCode = errorCode

  tabs.innerHTML = `${actions.map(action => `<gr-tab slot="nav" panel="${action.key}"${action.key === activeTab ? ` active` : ``}>${action.short}</gr-tab>`).join('\n')}
    ${actions.map(action => `<gr-tab-panel name="${action.key}"${action.key === activeTab ? ` active` : ``}></gr-tab-panel>`).join('\n')}`

  detailsData.forEach(details => {
    const panel = tabs.querySelector(`gr-tab-panel[name="${details.action}"]`)
    const tableGrid = new Grid({
      columns: [
        //Define Table Columns
        { name: 'No.', id: 'no', resizable: true, sort: true },
        { name: 'Context', id: 'context', resizable: true, sort: true, formatter: linkFormatter },
        { name: 'URL', id: 'url', resizable: true, sort: true, formatter: linkFormatter },
        { name: 'Final URL', id: 'finalUrl', resizable: true, sort: true, formatter: linkFormatter },
      ],
      className: {
        container: 'cv-details-container',
        table: 'cv-details-grid',
        footer: 'cv-details-grid-footer',
        pagination: 'cv-pagination',
        paginationButtonPrev: 'cv-pagination-btn-prev',
        paginationButtonNext: 'cv-pagination-btn-next',
        paginationSummary: 'cv-pagination-summary',
      },
      autoWidth: false,
      data: details.records,
      language: frFR,
      pagination: details.total >= 10,
    }).render(panel)

    waitFor('.cv-details-grid tr', pane).then(() => {
      setAriaGrid(panel.querySelector('.cv-details-grid'), 0, 'ascending')
    })
  })

  const closeIcon = document.createElement('button')
  closeIcon.classList.add('cv-btn-close')
  closeIcon.innerHTML = `<span class="visually-hidden">Fermer</span>`
  closeIcon.addEventListener('click', onCosePane)
  closeIcon.addEventListener('keyup', onCosePane)

  tabs.prepend(closeIcon)

  pane.append(tabs)

  return pane
}

function onCosePane(event) {
  const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

  if (event.type === 'click' || keyboardSelectItemEvent) {
    delete event.target.pane.previousElementSibling.pane
    event.target.pane.remove()

    if (keyboardSelectItemEvent) {
      // Set focus on previous item
    }
  }
}

async function onTableDetailsCell(event) {
  const cell = event.target

  const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

  if (event.type === 'click' || keyboardSelectItemEvent) {
    if (cell.classList.contains('selectable')) {
      event.preventDefault()
      const errorCode = cell.parentElement.querySelector('[data-column-id="errorCode"]').textContent
      const action = camelCaseToKebabCase(cell.dataset.columnId)
      const row = cell.parentElement
      if (Reflect.has(row, 'pane')) {
        row.pane.querySelector(`gr-tab[panel="${action}"]`).click()
        if (keyboardSelectItemEvent) {
          cell.focus()
        }
        return
      }
      const detailsData = await getErrorCodeDetails(errorCode)
      const pane = buildPane(errorCode, action, detailsData)
      const paneContainer = document.createElement('tr')
      paneContainer.innerHTML = `<td colspan="${row.querySelectorAll(':scope > td').length}"></td>`
      paneContainer.querySelector('td').append(pane)
      row.after(paneContainer)
      row.pane = paneContainer
      paneContainer.querySelector('.cv-btn-close').pane = paneContainer

      // waitFor('.cv-details-grid tr', pane).then(() => {
      //   setAriaGrid(pane.querySelector('.cv-details-grid'), 0, 'ascending')
      // })

      if (keyboardSelectItemEvent) {
        cell.focus()
      }
    }
  }
}

export async function initStats() {
  const statsService = new URL(`${baseUrl}/api/stats/error-codes`, location)
  statsService.searchParams.set('job', userConfig.get('currentJob'))

  statsCodeErreurContainer = document.querySelector('#stats-error-code')

  const statsData = await fetch(statsService).then(response => response.json())

  const grid = new Grid({
    columns: [
      //Define Table Columns
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
    language: frFR,
  }).render(statsCodeErreurContainer)

  await waitFor('tr.gridjs-tr', statsCodeErreurContainer)

  const table = statsCodeErreurContainer.querySelector('[role="grid"]')

  table.querySelectorAll(':scope > thead > tr > th').forEach(th => th.setAttribute('tabindex', '-1'))

  setAriaGrid(table, 5, 'descending')

  table.addEventListener('keyup', onTableDetailsCell)
  table.addEventListener('click', onTableDetailsCell)
}
