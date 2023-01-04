function iframeClickHandler() {
  setTimeout(function () {
    if (document.activeElement instanceof HTMLIFrameElement) {
      // arbitrary iframe clicked in the current window
      document.activeElement.parentElement.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
      )
    }
  }, 0)
}

export function attachClickHandler() {
  window.addEventListener('blur', iframeClickHandler)
}

export function detachClickHandler() {
  window.removeEventListener('blur', iframeClickHandler)
}
