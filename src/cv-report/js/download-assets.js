import downloadIconSvg from 'bundle-text:../../common/svg/download.svg'

const downloadIcon = (svg => {
  const root = document.createElement('div')
  root.innerHTML = svg
  const svgNode = root.childNodes[0]
  svgNode.classList.add('cv-i-download')
  svgNode.setAttribute('aria-hidden', 'true')
  return svgNode
})(downloadIconSvg)

export function initDownloadAssets(messagesContainer) {
  messagesContainer.querySelectorAll('[download]').forEach(elem => {
    elem.classList.add('cv-download-asset')
    elem.parentElement.classList.add('cv-download-asset--container')
    elem.prepend(downloadIcon.cloneNode(true))
    try {
      let downloadReady = false
      let assetDownloaded = false

      elem.addEventListener('click', async function (event) {
        if (!downloadReady) {
          event.preventDefault()

          const filename = elem.href.split('?')[0].split('/').pop().toLowerCase().replace(/_/g, '-')

          const request = new Request(elem)
          const response = await fetch(request)

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
          const blob = await response.blob()

          var url = URL.createObjectURL(blob)

          elem.setAttribute('href', url)
          elem.setAttribute('download', filename)
          downloadReady = true

          if (!assetDownloaded) {
            elem.click()
            assetDownloaded = true
          }
        }
      })
    } catch (e) {
      // console.log(elem)
      // console.error(e)
    }
  })
}
