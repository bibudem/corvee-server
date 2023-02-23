/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

import { waitFor } from '../wait-for.js'
import { bindMethods, KeyCode, getAncestorBySelector } from './utils.js'
import './cv-grid-navigation-indicator.js'

/**
 * @description
 *  DOM Selectors to find the grid components
 */
const GridSelector = {
  ROW: ':scope > * > tr:not([role="none"]), :scope > * > [role="row"]',
  CELL: ':scope > th, :scope > td, :scope > [role="gridcell"]',
  SCROLL_ROW: 'tr:not([data-fixed]), [role="row"]',
  SORT_HEADER: 'th[aria-sort]',
  TABBABLE: '[tabindex="0"]',
}

/**
 * @class
 * @description
 *  Grid object representing the state and interactions for a grid widget
 *
 *  Assumptions:
 *  All focusable cells initially have tabindex="-1"
 *  Produces a fully filled in mxn grid (with no holes)
 * @param gridNode
 *  The DOM node pointing to the grid
 */

export class AriaGrid {
  constructor(host) {
    this.host = host
    this.navigationDisabled = false
    this.paginationEnabled = !!this.host.grid.config.pagination
    this.gridNode = host.renderRoot.querySelector('[role="grid"]')
    this.paginationNode = host.renderRoot.querySelector('.grid-pagination')
    this.topIndex = 0

    this.keysIndicator =
      document.body.querySelector('cv-grid-navigation-indicator') ??
      (d => {
        d.hidden = true
        document.body.appendChild(d)
        return d
      })(document.createElement('cv-grid-navigation-indicator'))

    bindMethods(this, 'checkFocusChange', 'checkPageChange', 'focusClickedCell', 'showKeysIndicator', 'hideKeysIndicator')

    this.setupFocusGrid()
    this.setFocusPointer(0, 0)

    this.setAriaAttributes()
    this.setAriaRows()
    this.watchPagination()

    if (this.paginationEnabled) {
      this.setupPagination()
    } else {
      this.perPage = this.grid.length
    }

    this.registerEvents()
  }

  setAriaAttributes() {
    if (this.paginationEnabled) {
      this.gridNode.querySelectorAll(':scope > thead > .gridjs-tr').forEach((tr, index) => tr.setAttribute('aria-rowindex', index + 1))
    }
  }

  setAriaRows() {
    if (this.paginationEnabled) {
      const headerCount = this.gridNode.querySelectorAll(':scope > thead > .gridjs-tr').length
      const startIndex = parseInt(this.paginationNode.querySelector('.grid-pagination-summary b').textContent)
      this.gridNode.querySelectorAll(':scope > tbody > .gridjs-tr').forEach((tr, index) => tr.setAttribute('aria-rowindex', headerCount + startIndex + index))
    }
  }

  watchPagination() {
    if (this.paginationEnabled) {
      const observer = new MutationObserver(mutationList => {
        if (mutationList.some(mutation => [...mutation.addedNodes].some(node => node.matches('.gridjs-tr')))) {
          this.setAriaRows()
          this.setupFocusGrid()
        }
      })

      observer.observe(this.gridNode.querySelector('.gridjs-tbody'), { childList: true })
    }
  }

  /**
   * @description
   *  Creates a 2D array of the focusable cells in the grid.
   */
  setupFocusGrid() {
    this.grid = []

    Array.prototype.forEach.call(
      this.gridNode.querySelectorAll(GridSelector.ROW),
      function (row) {
        var rowCells = []

        Array.prototype.forEach.call(
          row.querySelectorAll(GridSelector.CELL),
          function (cell) {
            const focusableSelector = '[tabindex]'

            if (cell.matches(focusableSelector)) {
              rowCells.push(cell)
            } else {
              const focusableCell = cell.querySelector(focusableSelector)

              if (focusableCell) {
                rowCells.push(focusableCell)
              }
            }
          }.bind(this)
        )

        if (rowCells.length) {
          this.grid.push(rowCells)
        }
      }.bind(this)
    )
  }

  /**
   * @description
   *  If possible, set focus pointer to the cell with the specified coordinates
   * @param row
   *  The index of the cell's row
   * @param col
   *  The index of the cell's column
   * @returns {boolean}
   *  Returns whether or not the focus could be set on the cell.
   */
  setFocusPointer(row, col) {
    if (!this.isValidCell(row, col)) {
      return false
    }

    if (this.isHidden(row, col)) {
      return false
    }

    if (!isNaN(this.focusedRow) && !isNaN(this.focusedCol)) {
      this.grid[this.focusedRow]?.[this.focusedCol]?.setAttribute('tabindex', -1)
    }

    this.grid[row][col].removeEventListener('focus', this.showKeysIndicator)
    this.grid[row][col].removeEventListener('blur', this.hideKeysIndicator)

    // Disable navigation if focused on an input
    this.navigationDisabled = this.grid[row][col].matches('input')

    this.grid[row][col].setAttribute('tabindex', 0)
    this.focusedRow = row
    this.focusedCol = col

    this.grid[row][col].addEventListener('focus', this.showKeysIndicator)
    this.grid[row][col].addEventListener('blur', this.hideKeysIndicator)

    return true
  }

  /**
   * @param row
   *  The index of the cell's row
   * @param col
   *  The index of the cell's column
   * @returns {boolean}
   *  Returns whether or not the coordinates are within the grid's boundaries.
   */
  isValidCell(row, col) {
    return !isNaN(row) && !isNaN(col) && row >= 0 && col >= 0 && this.grid && this.grid.length && row < this.grid.length && col < this.grid[row].length
  }

  /**
   * @param row
   *  The index of the cell's row
   * @param col
   *  The index of the cell's column
   * @returns {boolean}
   *  Returns whether or not the cell has been hidden.
   */
  isHidden(row, col) {
    var cell = this.gridNode.querySelectorAll(GridSelector.ROW)[row].querySelectorAll(GridSelector.CELL)[col]
    return cell.hidden
  }

  /**
   * @description
   *  Clean up grid events
   */
  clearEvents() {
    this.gridNode.removeEventListener('keydown', this.checkFocusChange)
    this.gridNode.removeEventListener('click', this.focusClickedCell)

    if (this.paginationEnabled) {
      this.gridNode.removeEventListener('keydown', this.checkPageChange)
    }

    this.grid[this.focusedRow][this.focusedCol].removeEventListener('focus', this.showKeysIndicator)
    this.grid[this.focusedRow][this.focusedCol].removeEventListener('blur', this.hideKeysIndicator)
  }

  /**
   * @description
   *  Register grid events
   */
  registerEvents() {
    this.clearEvents()

    this.gridNode.addEventListener('keydown', this.checkFocusChange)
    this.gridNode.addEventListener('click', this.focusClickedCell)

    if (this.paginationEnabled) {
      this.gridNode.addEventListener('keydown', this.checkPageChange)
    }
  }

  /**
   * @description
   *  Focus on the cell in the specified row and column
   * @param row
   *  The index of the cell's row
   * @param col
   *  The index of the cell's column
   */
  focusCell(row, col) {
    if (this.setFocusPointer(row, col)) {
      this.grid[row][col].focus()
    }
  }

  showKeysIndicator() {
    if (this.keysIndicator) {
      this.keysIndicator.hidden = false
    }
  }

  hideKeysIndicator() {
    if (this.keysIndicator && this.grid[this.focusedRow][this.focusedCol].tabIndex === 0) {
      this.keysIndicator.hidden = true
    }
  }

  /**
   * @description
   *  Triggered on keydown. Checks if an arrow key was pressed, and (if possible)
   *  moves focus to the next valid cell in the direction of the arrow key.
   * @param event
   *  Keydown event
   */
  checkFocusChange(event) {
    if (!event || this.navigationDisabled) {
      return
    }

    if (getAncestorBySelector(event.target, 'cv-pane')) {
      return
    }

    this.findFocusedItem(event.target)

    const key = event.which || event.keyCode
    var rowCaret = this.focusedRow
    var colCaret = this.focusedCol
    var nextCell

    switch (key) {
      case KeyCode.UP:
        nextCell = this.getNextVisibleCell(0, -1)
        rowCaret = nextCell.row
        colCaret = nextCell.col
        break
      case KeyCode.DOWN:
        nextCell = this.getNextVisibleCell(0, 1)
        rowCaret = nextCell.row
        colCaret = nextCell.col
        break
      case KeyCode.LEFT:
        nextCell = this.getNextVisibleCell(-1, 0)
        rowCaret = nextCell.row
        colCaret = nextCell.col
        break
      case KeyCode.RIGHT:
        nextCell = this.getNextVisibleCell(1, 0)
        rowCaret = nextCell.row
        colCaret = nextCell.col
        break
      case KeyCode.HOME:
        if (event.ctrlKey) {
          rowCaret = 0
        }
        colCaret = 0
        break
      case KeyCode.END:
        if (event.ctrlKey) {
          rowCaret = this.grid.length - 1
        }
        colCaret = this.grid[this.focusedRow].length - 1
        break
      default:
        return
    }

    if (this.paginationEnabled) {
      if (key === KeyCode.UP && rowCaret === this.focusedRow) {
        this.movePageUp()
      }

      if (key === KeyCode.DOWN && rowCaret === this.focusedRow) {
        this.movePageDown()
      }
    }

    this.focusCell(rowCaret, colCaret)
    event.preventDefault()
  }

  /**
   * @description
   *  Reset focused row and col if it doesn't match focusedRow and focusedCol
   * @param focusedTarget
   *  Element that is currently focused by browser
   */
  findFocusedItem(focusedTarget) {
    var focusedCell = this.grid[this.focusedRow][this.focusedCol]

    if (focusedCell === focusedTarget || focusedCell.contains(focusedTarget)) {
      return
    }

    for (var i = 0; i < this.grid.length; i++) {
      for (var j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j] === focusedTarget || this.grid[i][j].contains(focusedTarget)) {
          this.setFocusPointer(i, j)
          return
        }
      }
    }
  }

  /**
   * @description
   *  Triggered on click. Finds the cell that was clicked on and focuses on it.
   * @param event
   *  Keydown event
   */
  focusClickedCell(event) {
    var clickedGridCell = this.findClosest(event.target, '[tabindex]')

    for (var row = 0; row < this.grid.length; row++) {
      for (var col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col] === clickedGridCell) {
          this.setFocusPointer(row, col)

          if (!clickedGridCell.matches('button[aria-haspopup]')) {
            // Don't focus if it's a menu button (focus should be set to menu)
            this.focusCell(row, col)
          }

          return
        }
      }
    }
  }

  /**
   * @description
   *  Determines the per page attribute of the grid, and shows/hides rows
   *  accordingly.
   */
  setupPagination() {
    this.onPaginationChange = this.onPaginationChange || function () { }
    this.perPage = this.host.perPage
  }

  setPaginationChangeHandler(onPaginationChange) {
    this.onPaginationChange = onPaginationChange
  }

  /**
   * @description
   *  Check if page up or page down was pressed, and show the next page if so.
   * @param event
   *  Keydown event
   */
  checkPageChange(event) {
    if (!event) {
      return
    }

    var key = event.which || event.keyCode

    if (key === KeyCode.PAGE_UP) {
      event.preventDefault()
      this.movePageUp()
    } else if (key === KeyCode.PAGE_DOWN) {
      event.preventDefault()
      this.movePageDown()
    }
  }

  async movePageUp() {
    const prevBtn = this.paginationNode.querySelector('.grid-pagination-btn-prev:not([disabled])')
    if (prevBtn) {
      prevBtn.click()
      setTimeout(async () => {
        await waitFor(':scope > tbody > .gridjs-tr', this.gridNode)
        this.focusCell(this.focusedRow, this.focusedCol)
      })
    }
  }

  async movePageDown() {
    const nextBtn = this.paginationNode.querySelector('.grid-pagination-btn-next:not([disabled])')
    if (nextBtn) {
      nextBtn.click()
      setTimeout(async () => {
        await waitFor(':scope > tbody > .gridjs-tr', this.gridNode)
        const actualRowCount = this.gridNode.querySelectorAll(':scope > tbody > .gridjs-tr').length
        const rowCaret = Math.min(actualRowCount, this.focusedRow)
        this.focusCell(rowCaret, this.focusedCol)
      })
    }
  }

  /**
   * @description
   * Get next cell to the right or left (direction) of the focused
   * cell.
   * @param currRow
   * Row index to start searching from
   * @param currCol
   * Column index to start searching from
   * @param directionX
   * X direction for where to check for cells. +1 to check to the right, -1 to
   * check to the left
   * @param directionY
   * @returns {false | object}
   * Indices of the next cell in the specified direction. Returns the focused
   * cell if none are found.
   */
  getNextCell(currRow, currCol, directionX, directionY) {
    var row = currRow + directionY
    var col = currCol + directionX
    var rowCount = this.grid.length

    if (!rowCount) {
      return false
    }

    if (this.isValidCell(row, col)) {
      return {
        row: row,
        col: col,
      }
    } else if (this.isValidCell(currRow, currCol)) {
      return {
        row: currRow,
        col: currCol,
      }
    } else {
      return false
    }
  }

  /**
* @param directionX
* @param directionY
* @description
Get next visible column to the right or left (direction) of the focused
* cell.
* @returns {false | object}
* Indices of the next visible cell in the specified direction. If no visible
* cells are found, returns false if the current cell is hidden and returns
* the current cell if it is not hidden.
*/
  getNextVisibleCell(directionX, directionY) {
    var nextCell = this.getNextCell(this.focusedRow, this.focusedCol, directionX, directionY)
    if (!nextCell) {
      return false
    }

    while (this.isHidden(nextCell.row, nextCell.col)) {
      var currRow = nextCell.row
      var currCol = nextCell.col

      nextCell = this.getNextCell(currRow, currCol, directionX, directionY)

      if (currRow === nextCell.row && currCol === nextCell.col) {
        // There are no more cells to try if getNextCell returns the current cell
        return false
      }
    }

    return nextCell
  }

  /**
   * @description
   *  Show or hide the cells in the specified column
   * @param columnIndex
   *  Index of the column to toggle
   * @param isShown
   *  Whether or not to show the column
   */
  toggleColumn(columnIndex, isShown) {
    var cellSelector = '[aria-colindex="' + columnIndex + '"]'
    var columnCells = this.gridNode.querySelectorAll(cellSelector)

    Array.prototype.forEach.call(columnCells, function (cell) {
      if (isShown) {
        cell.hidden = false
      } else {
        cell.hidden = true
      }
    })

    if (!isShown && this.focusedCol === columnIndex - 1) {
      // If focus was set on the hidden column, shift focus to the right
      var nextCell = this.getNextVisibleCell(1, 0)
      if (nextCell) {
        this.setFocusPointer(nextCell.row, nextCell.col)
      }
    }
  }

  /**
   * @description
   *  Find the closest element matching the selector. Only checks parent and
   *  direct children.
   * @param element
   *  Element to start searching from
   * @param selector
   *  Index of the column to toggle
   * @returns {object} matching element
   */
  findClosest(element, selector) {
    if (element.matches(selector)) {
      return element
    }

    if (element.parentNode.matches(selector)) {
      return element.parentNode
    }

    return element.querySelector(selector)
  }
}
