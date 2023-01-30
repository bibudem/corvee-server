// import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { Grid } from 'gridjs'
import { frFR } from 'gridjs/l10n'
import '@graphiteds/core/components/gr-tab-group.js'
import '@graphiteds/core/components/gr-tab.js'
import '@graphiteds/core/components/gr-tab-panel.js'
import { userConfig } from '../../common/js/user-config.js'
import { actions, baseUrl } from '@corvee/client-config/app'

const n = new Intl.NumberFormat('fr-CA').format

function numberFormatter(cell) {
  return numberFormat.format(cell)
}

async function fetchErrorCodeDetails(errorCode) {
  const statsDetailsService = new URL(`${baseUrl}/api/stats/error-codes/${errorCode}`, location)
  statsDetailsService.searchParams.set('job', userConfig.get('currentJob'))

  return await fetch(statsDetailsService).then(response => response.json())
}

function cellAttributes(cell, row, column) {
  // console.log('cell: %o', cell)
  // console.log('row: %o', row)
  // console.log('column: %o', column)
  if (cell !== null) {
    return {
      class: 'gridjs-td selectable align-right',
    }
  }
}

function buildPane(activeTab) {
  const pane = document.createElement('div')
  pane.classList.add('cv-pane')

  const tabs = document.createElement('gr-tab-group')

  tabs.innerHTML = `${actions.map(action => `<gr-tab slot="nav" panel="${action.key}"${action.key === activeTab ? ` active` : ``}>${action.short}</gr-tab>`).join('\n')}
    ${actions.map(action => `<gr-tab-panel name="${action.key}"${action.key === activeTab ? ` active` : ``}>[${action.key}] Bonjour le monde!</gr-tab-panel>`).join('\n')}`

  pane.append(tabs)
  return pane
}

async function onCellclick(event, cell, column, row) {
  const errorCode = row.cell(0).data
  const activeTab = column.id
  const detailsData = await fetchErrorCodeDetails(errorCode)
  const pane = buildPane(activeTab)
  const tr = document.createElement('tr')
  tr.innerHTML = `<td colspan="${row.length}"></td>`
  tr.querySelector('td').append(pane)
  event.target.parentElement.after(tr)
}

export async function initStats() {
  const statsService = new URL(`${baseUrl}/api/stats/error-codes`, location)
  statsService.searchParams.set('job', userConfig.get('currentJob'))

  const statsData = await fetch(statsService).then(response => response.json())

  const table = new Grid({
    columns: [
      //Define Table Columns
      { name: "Code d'erreur", id: 'errorCode', sort: true },
      { name: 'À corriger', id: 'toBeFixed', sort: true, formatter: n, attributes: cellAttributes },
      { name: 'Corrigé', id: 'fixed', sort: true, formatter: n, attributes: cellAttributes },
      { name: 'Faux Positif!', id: 'noError', sort: true, formatter: n, attributes: cellAttributes },
      { name: 'Ignorer', id: 'ignore', sort: true, formatter: n, attributes: cellAttributes },
      { name: 'Total', id: 'total', sort: true, formatter: n, attributes: cellAttributes },
    ],
    data: statsData,
    language: frFR,
  })
    .render(document.querySelector('#stats-code-erreur'))
    .on('cellClick', onCellclick)

  // var table = new Tabulator('#stats-code-erreur', {
  //   // height: 205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
  //   data: statsData, //assign data to table
  //   layout: 'fitColumns', //fit columns to width of table (optional)
  //   selectable: false,
  //   debugEventsInternal: true,
  //   columns: [
  //     //Define Table Columns
  //     { title: "Code d'erreur", field: 'errorCode', sort: true, widthGrow: 6 },
  //     { title: 'À corriger', field: 'toBeFixed', hozAlign: 'right', sort: true, formatter: numberFormatter, minWidth: 140, cellClick },
  //     { title: 'Corrigé', field: 'fixed', hozAlign: 'right', sort: true, formatter: numberFormatter, minWidth: 140, cellClick },
  //     { title: 'Faux Positif!', field: 'noError', hozAlign: 'right', sort: true, formatter: numberFormatter, minWidth: 140, cellClick },
  //     { title: 'Ignorer', field: 'ignore', hozAlign: 'right', sort: true, formatter: numberFormatter, minWidth: 140, cellClick },
  //     { title: 'Total', field: 'total', hozAlign: 'right', sort: true, formatter: numberFormatter, minWidth: 140 },
  //   ],
  //   rowFormatter: function (row) {
  //     const pane = document.createElement('div')
  //     pane.classList.add('cv-pane')
  //     pane.hidden = true

  //     const tabs = document.createElement('gr-tab-group')

  //     tabs.innerHTML = `${actions.map(action => `<gr-tab slot="nav" panel="${action.key}">${action.short}</gr-tab>`).join('\n')}
  //   ${actions.map(action => `<gr-tab-panel name="${action.key}">[${action.key}] Bonjour le monde!</gr-tab-panel>`).join('\n')}`

  //     pane.append(tabs)
  //     row.getElement().appendChild(pane)
  //   },
  // })
}
