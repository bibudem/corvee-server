const clipboardAvailable = 'clipboard' in navigator && 'featurePolicy' in document && document.featurePolicy.allowsFeature('clipboard-write')
const execCommandAvailable = 'execCommand' in document

function createNode(text) {
  const node = document.createElement('pre')
  node.style.width = '1px'
  node.style.height = '1px'
  node.style.position = 'fixed'
  node.style.top = '5px'
  node.textContent = text
  return node
}

export function copyNode(node) {
  if (clipboardAvailable) {
    console.log('clipboard is available')
    return navigator.clipboard.writeText(node.textContent || '')
  }
  console.log('clipboard is not available')

  if (!execCommandAvailable) {
    return Promise.reject(new Error('execCommand is not available'))
  }

  const selection = getSelection()
  if (selection == null) {
    return Promise.reject(new Error('selection is null'))
  }

  selection.removeAllRanges()

  const range = document.createRange()
  range.selectNodeContents(node)
  selection.addRange(range)

  document.execCommand('copy')
  selection.removeAllRanges()
  return Promise.resolve()
}

export function copyText(text) {
  if (clipboardAvailable) {
    return navigator.clipboard.writeText(text)
  }

  const body = document.body
  if (!body) {
    return Promise.reject(new Error('body does not exist'))
  }

  const node = createNode(text)
  body.appendChild(node)

  return copyNode(node).finally(() => {
    body.removeChild(node)
  })
}
