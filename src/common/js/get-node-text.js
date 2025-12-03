function normalizeText(str) {
  str = str.replace(/[\n\r\t\s]+/g, ' ')
  str = str.trim()
  return str
}

// @ts-ignore
export function getNodeText(node) {
  let text = null

  if (!(node instanceof HTMLElement)) {
    return text
  }


  if (node.nodeName === 'A') {
    text = node.innerText
    if (normalizeText(text) === '' && node.querySelector('img[alt]')) {
      text = node.querySelector('img[alt]').getAttribute('alt')
    }

  } else if (node.nodeName === 'IMG') {
    if (node.hasAttribute('alt')) {
      text = node.getAttribute('alt')
    } else if (node.hasAttribute('title')) {
      text = node.getAttribute('title')
    }
  }

  return normalizeText(text)
}
