/* ---------------------------------------------------------------- */
/*                  ARIA Utils Namespace                        */
/* ---------------------------------------------------------------- */

/**
 * @class Menu
 * @memberof Utils
 * @description  Computes absolute position of an element
 */

export const findPos = function (element) {
  var xPosition = 0
  var yPosition = 0

  while (element) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft
    yPosition += element.offsetTop - element.scrollTop + element.clientTop
    element = element.offsetParent
  }
  return { x: xPosition, y: yPosition }
}

/**
 * @description
 *  Key code constants
 */
export const KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  SHIFT: 16,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
}

export const remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove()
  }
  if (item.parentNode && item.parentNode.removeChild && typeof item.parentNode.removeChild === 'function') {
    return item.parentNode.removeChild(item)
  }
  return false
}

export const isFocusable = function (element) {
  if (element.tabIndex < 0) {
    return false
  }

  if (element.disabled) {
    return false
  }

  switch (element.nodeName) {
    case 'A':
      return !!element.href && element.rel != 'ignore'
    case 'INPUT':
      return element.type != 'hidden'
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true
    default:
      return false
  }
}

export const getAncestorBySelector = function (element, selector) {
  if (!element.matches(selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null
  }

  // Move up the DOM tree until a parent matching the selector is found
  var currentNode = element
  var ancestor = null
  while (ancestor === null) {
    if (currentNode.parentNode.matches(selector)) {
      ancestor = currentNode.parentNode
    } else {
      currentNode = currentNode.parentNode
    }
  }

  return ancestor
}

export const bindMethods = function (object /* , ...methodNames */) {
  var methodNames = Array.prototype.slice.call(arguments, 1)
  methodNames.forEach(function (method) {
    object[method] = object[method].bind(object)
  })
}
