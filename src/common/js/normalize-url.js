export function normalizeUrl(url) {
  url = new URL(url)
  url.hash = ''
  url.pathname = url.pathname.replace(/(index|default)\.html?$/, '')
  url.searchParams.forEach((value, key) => {
    if (key.startsWith('utm_')) {
      url.searchParams.delete(key)
    }
  })

  return url.href
}
