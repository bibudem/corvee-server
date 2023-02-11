/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

import { matches, bindMethods, KeyCode, getAncestorBySelector } from './utils.js'

/**
 * @description
 *  DOM Selectors to find the grid components
 */
const GridSelector = {
  ROW: 'tr, [role="row"]',
  CELL: 'th, td, [role="gridcell"]',
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
export const Grid = function (gridNode) {
  this.navigationDisabled = false
  this.gridNode = gridNode
  this.topIndex = 0

  this.keysIndicator =
    document.getElementById('arrow-keys-indicator') ??
    (d => {
      d.id = 'arrow-keys-indicator'
      d.hidden = true
      document.body.appendChild(d)
      return d
    })(document.createElement('div'))

  bindMethods(this, 'checkFocusChange', 'focusClickedCell', 'showKeysIndicator', 'hideKeysIndicator')
  this.setupFocusGrid()
  this.setFocusPointer(0, 0)

  this.perPage = this.grid.length

  this.registerEvents()
}

/**
 * @description
 *  Creates a 2D array of the focusable cells in the grid.
 */
Grid.prototype.setupFocusGrid = function () {
  this.grid = []

  Array.prototype.forEach.call(
    this.gridNode.querySelectorAll(GridSelector.ROW),
    function (row) {
      var rowCells = []

      Array.prototype.forEach.call(
        row.querySelectorAll(GridSelector.CELL),
        function (cell) {
          var focusableSelector = '[tabindex]'

          if (matches(cell, focusableSelector)) {
            rowCells.push(cell)
          } else {
            var focusableCell = cell.querySelector(focusableSelector)

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
Grid.prototype.setFocusPointer = function (row, col) {
  if (!this.isValidCell(row, col)) {
    return false
  }

  if (this.isHidden(row, col)) {
    return false
  }

  if (!isNaN(this.focusedRow) && !isNaN(this.focusedCol)) {
    this.grid[this.focusedRow][this.focusedCol].setAttribute('tabindex', -1)
  }

  this.grid[row][col].removeEventListener('focus', this.showKeysIndicator)
  this.grid[row][col].removeEventListener('blur', this.hideKeysIndicator)

  // Disable navigation if focused on an input
  this.navigationDisabled = matches(this.grid[row][col], 'input')

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
Grid.prototype.isValidCell = function (row, col) {
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
Grid.prototype.isHidden = function (row, col) {
  var cell = this.gridNode.querySelectorAll(GridSelector.ROW)[row].querySelectorAll(GridSelector.CELL)[col]
  return cell.hidden
}

/**
 * @description
 *  Clean up grid events
 */
Grid.prototype.clearEvents = function () {
  this.gridNode.removeEventListener('keydown', this.checkFocusChange)
  this.gridNode.removeEventListener('click', this.focusClickedCell)

  this.grid[this.focusedRow][this.focusedCol].removeEventListener('focus', this.showKeysIndicator)
  this.grid[this.focusedRow][this.focusedCol].removeEventListener('blur', this.hideKeysIndicator)
}

/**
 * @description
 *  Register grid events
 */
Grid.prototype.registerEvents = function () {
  this.clearEvents()

  this.gridNode.addEventListener('keydown', this.checkFocusChange)
  this.gridNode.addEventListener('click', this.focusClickedCell)
}

/**
 * @description
 *  Focus on the cell in the specified row and column
 * @param row
 *  The index of the cell's row
 * @param col
 *  The index of the cell's column
 */
Grid.prototype.focusCell = function (row, col) {
  if (this.setFocusPointer(row, col)) {
    this.grid[row][col].focus()
  }
}

Grid.prototype.showKeysIndicator = function () {
  if (this.keysIndicator) {
    this.keysIndicator.hidden = false
  }
}

Grid.prototype.hideKeysIndicator = function () {
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
Grid.prototype.checkFocusChange = function (event) {
  if (!event || this.navigationDisabled) {
    return
  }

  if (getAncestorBySelector(event.target, 'table, [role="grid"]') !== this.gridNode) {
    return
  }

  this.findFocusedItem(event.target)

  var key = event.which || event.keyCode
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
      console.log('keydown: %o', nextCell)
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

  this.focusCell(rowCaret, colCaret)
  event.preventDefault()
}

/**
 * @description
 *  Reset focused row and col if it doesn't match focusedRow and focusedCol
 * @param focusedTarget
 *  Element that is currently focused by browser
 */
Grid.prototype.findFocusedItem = function (focusedTarget) {
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
Grid.prototype.focusClickedCell = function (event) {
  var clickedGridCell = this.findClosest(event.target, '[tabindex]')

  for (var row = 0; row < this.grid.length; row++) {
    for (var col = 0; col < this.grid[row].length; col++) {
      if (this.grid[row][col] === clickedGridCell) {
        this.setFocusPointer(row, col)

        if (!matches(clickedGridCell, 'button[aria-haspopup]')) {
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
Grid.prototype.getNextCell = function (currRow, currCol, directionX, directionY) {
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
Grid.prototype.getNextVisibleCell = function (directionX, directionY) {
  var nextCell = this.getNextCell(this.focusedRow, this.focusedCol, directionX, directionY)
  console.log('nextCell: %o', nextCell)
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
Grid.prototype.toggleColumn = function (columnIndex, isShown) {
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
Grid.prototype.findClosest = function (element, selector) {
  if (matches(element, selector)) {
    return element
  }

  if (matches(element.parentNode, selector)) {
    return element.parentNode
  }

  return element.querySelector(selector)
}
