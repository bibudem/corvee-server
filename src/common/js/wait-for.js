export async function waitFor(selector, context = document.body) {
  return new Promise(resolve => {
    if (context.querySelector(selector)) {
      return resolve(context.querySelector(selector))
    }

    const observer = new MutationObserver(mutations => {
      if (context.querySelector(selector)) {
        resolve(context.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(context, {
      childList: true,
      subtree: true,
    })
  })
}
