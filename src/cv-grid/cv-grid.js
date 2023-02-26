import { LitElement, css, html, unsafeCSS } from 'lit'
import { Grid } from 'gridjs'
import { frFR } from 'gridjs/l10n'
import { querySelectorAll } from 'kagekiri'
import focusableSelectors from 'focusable-selectors'
import '../cv-pane/cv-pane.js'
import { waitFor } from '../common/js/wait-for.js'
import { AriaGrid } from '../common/js/aria/aria-grid.js'
import { SPACE_KEY, ENTER_KEY, TAB_KEY } from '../common/js/constants.js'
import stylesheet from './scss/cv-grid.scss'

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

function isVisible(elem) {
  return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)
}

function setAriaGrid(grid, defaultSortColumn = -1, defaultSortOrder) {
  const ariaGrid = new AriaGrid(grid)

  grid.renderRoot
    .querySelector('[role="grid"]')
    .querySelectorAll(':scope > thead > tr > th.gridjs-th-sort')
    .forEach((th, i) => {
      th.setAttribute('aria-sort', i === defaultSortColumn ? defaultSortOrder : 'none')
      const btn = th.querySelector('button.gridjs-sort')
      if (btn) {
        const btnObserver = new MutationObserver(mutationList => {
          mutationList = mutationList.filter(mutation => mutation.attributeName === 'class')
          for (const mutation of mutationList) {
            const target = mutation.target
            const sortOrder = target.classList.contains('gridjs-sort-asc') ? 'ascending' : target.classList.contains('gridjs-sort-desc') ? 'descending' : 'none'
            if (sortOrder === 'none') {
              target.parentElement.setAttribute('aria-sort', 'none')
            } else {
              target.parentElement.setAttribute('aria-sort', sortOrder)
            }
          }
        })
        const options = { attributes: true }
        btnObserver.observe(btn, options)
      }
    })

  if (grid.grid.config.pagination) {
    const paginationContainer = grid.renderRoot.querySelector('.gridjs-container').querySelector(':scope > .gridjs-footer .gridjs-pages')
    if (paginationContainer) {
      function resetTabindex() {
        paginationContainer.querySelectorAll('button').forEach(btn => btn.setAttribute('tabindex', '-1'))
      }

      resetTabindex()
      const paginationObserver = new MutationObserver(mutationList => {
        console.log(mutationList)
        for (const mutation of mutationList) {
          if (mutation.addedNodes.length) {
            ;[...mutation.addedNodes].filter(node => node.tagName === 'BUTTON').forEach(node => node.setAttribute('tabindex', '-1'))
          }
        }
        // resetTabindex()
      })
      paginationObserver.observe(paginationContainer, { childList: true })
    }
  }

  return ariaGrid
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class CvGrid extends LitElement {
  static styles = css`
    ${unsafeCSS(stylesheet)}
  `

  static get properties() {
    return {
      options: {
        type: Object,
        attribute: false,
      },
      sortColumn: {
        type: Number,
      },
      sortOrder: {
        type: String,
      },
      perPage: {
        type: Number,
      },
      _active: {
        type: Boolean,
        state: true,
      },
      rendered: {
        type: Boolean,
        state: true,
      },
    }
  }

  constructor() {
    super()

    this._active = false
    this.perPage = 10
    this.panes = new Map()
    this.grid = new Grid({
      data: [],
      language: frFR,
      className: {
        container: 'grid-container',
        table: 'grid',
        notfound: 'grid-message-not-found',
        footer: 'grid-footer',
        pagination: 'grid-pagination',
        paginationButtonPrev: 'grid-pagination-btn-prev',
        paginationButtonNext: 'grid-pagination-btn-next',
        paginationSummary: 'grid-pagination-summary',
      },
      autoWidth: false,
    })

    this.updateComplete.then(async () => {
      this.grid.render(this.container)
      await this._initGrid()
    })
  }

  _onBlurKeyboard(event) {
    if (event.key === TAB_KEY) {
      const grid = this.host ?? this
      const tabbables = querySelectorAll(focusableSelectors.join(','), grid).filter(isVisible)

      if (!event.shiftKey) {
        if (event.target === tabbables[tabbables.length - 1]) {
          const blurKeyboardEvent = new CustomEvent('blur.keyboard', { detail: { shiftKey: event.shiftKey }, bubbles: true, cancelable: true })
          const defaultPrevented = !grid.dispatchEvent(blurKeyboardEvent)
          if (defaultPrevented) {
            event.preventDefault()
          }
        }
      }
    }
  }

  get container() {
    return this.renderRoot?.querySelector('div') ?? null
  }

  get gridNode() {
    return this.renderRoot?.querySelector('[role="grid"]') ?? null
  }

  set options(options) {
    this.grid.updateConfig(options)
    if (this._active) {
      this.grid.forceRender()
      this._initGrid()
    }
  }

  async _initGrid() {
    await waitFor('tr.gridjs-tr', this.container)
    this.container.querySelector('.grid-container').removeAttribute('role')

    this.gridNode.querySelectorAll(':scope > thead > tr > th').forEach(th => {
      th.setAttribute('tabindex', '-1')
    })

    this.aria = setAriaGrid(this, this.sortColumn, this.sortOrder, this.perPage)

    if (!this._active) {
      this._active = true
      this.container.hidden = false
    }
  }

  _updateGrid() {
    this.gridNode.querySelectorAll(':scope > thead > tr > th').forEach(th => {
      th.setAttribute('tabindex', '-1')
    })

    this.gridNode.querySelectorAll(':scope > * > tr').forEach(tr => {
      tr.setAttribute('aria-tabindex', '-1')
    })
  }

  connectedCallback() {
    super.connectedCallback()
  }

  async _onSort(event) {
    const cell = event.target

    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.type === 'click' || keyboardSelectItemEvent) {
      if (cell.hasAttribute('aria-sort')) {
        for (const pane of this.panes.values()) {
          pane.container.remove()
        }
        const o = new MutationObserver(() => {
          o.disconnect()
          this.aria.setupFocusGrid()
          console.log(this)
          for (const [rowId, pane] of this.panes.entries()) {
            const row = this.getRow(rowId)
            row.after(pane.container)
          }
        })
        o.observe(this.gridNode, { childList: true, subtree: true })
      }
    }
  }

  _onSelect(event) {
    const cell = event.target

    const keyboardSelectItemEvent = event.key === SPACE_KEY || event.key === ENTER_KEY

    if (event.key === SPACE_KEY) {
      event.preventDefault()
      if (cell.hasAttribute('aria-sort')) {
        cell.click()
        return
      }
    }
    if (event.type === 'click' || keyboardSelectItemEvent) {
      if (cell.classList.contains('selectable')) {
        event.preventDefault()
        const rowId = cell.parentElement.querySelector('[data-column-id="errorCode"]').textContent
        const column = camelCaseToKebabCase(cell.dataset.columnId)
        const pane = this.panes.get(rowId)
        if (pane) {
          if (!pane.isShown) {
            pane.show()
          }

          if (keyboardSelectItemEvent) {
            cell.focus()
          }
          return
        }

        this.dispatchEvent(
          new CustomEvent('select', {
            detail: {
              rowId,
              column,
              pane: !!pane,
            },
          })
        )
      }
    }
  }

  addDetails(rowId, details) {
    if (this.panes.has(rowId)) {
      return false
    }

    const row = this.getRow(rowId)
    if (row) {
      const paneContainer = document.createElement('tr')
      const pane = document.createElement('cv-pane')
      paneContainer.role = 'none'
      paneContainer.innerHTML = `<td colspan="${row.querySelectorAll(':scope > td').length}"></td>`
      pane.container = paneContainer
      pane.append(details)
      paneContainer.querySelector('td').append(pane)
      row.after(paneContainer)
      this.panes.set(rowId, pane)

      pane.addEventListener('hide', event => {
        paneContainer.hidden = true
        if (event.detail.isKeyboardEvent) {
          this.aria.focusCell(this.aria.focusedRow, this.aria.focusedCol)
        }
      })

      pane.addEventListener('show', () => {
        paneContainer.hidden = false
      })

      pane.addEventListener('blur.keyboard', event => {
        event.stopPropagation()
        event.preventDefault()
        const direction = event.detail.shiftKey ? 0 : 1
        const nextRowIndex = Array.from(row.parentNode.querySelectorAll(':scope > .gridjs-tr')).indexOf(row) + this.gridNode.querySelectorAll(':scope > thead > tr').length + direction
        const colIndex = this.aria.focusedCol
        this.aria.focusCell(nextRowIndex, colIndex)
      })

      return pane
    }
  }

  getRow(rowId) {
    return [...this.renderRoot.querySelector('[role="grid"]').querySelectorAll(':scope > tbody > tr:not([role="none"])')].filter(tr => tr.querySelector('td[data-column-id="errorCode"]').textContent === rowId)[0]
  }

  createRenderRoot() {
    const root = super.createRenderRoot()
    root.addEventListener('click', this._onSelect.bind(this))
    root.addEventListener('keydown', this._onSelect.bind(this))
    root.addEventListener('click', this._onSort.bind(this), true)
    root.addEventListener('keydown', this._onSort.bind(this), true)
    root.addEventListener('keydown', this._onBlurKeyboard.bind(this))

    return root
  }

  render() {
    return html`<div hidden></div>`
  }
}

window.customElements.define('cv-grid', CvGrid)
