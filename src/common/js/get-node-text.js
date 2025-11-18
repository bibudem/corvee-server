function normalizeText(str) {
  return str.replace(/\n/g, '').trim()
}

// @ts-ignore
export function getNodeText(node) {
  let text = null

  if (!node instanceof HTMLElement) {
    return text
  }

  console.log('[getNodeText] zici:', node)
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

    const normalizedText = normalizeText(text)
    console.log('[getNodeText] normalizedText: "%s"', normalizedText)
    return normalizeText(normalizedText)
  }
}
