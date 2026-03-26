import serveStatic from 'serve-static'

export function staticMiddleware(root) {

  function setCustomCacheControl(res, file) {
    console.log('Serving static file:', file)
    if (file.endsWith('loader.js')) {
      // Custom Cache-Control for the loader file
      res.setHeader('Cache-Control', 'public, max-age=0')
    }
  }

  return serveStatic(root, { setHeaders: setCustomCacheControl })

}
