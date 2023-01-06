import { userConfig } from '../../common/js/user-config.js'

userConfig.addEventListener('change', event => {
  if (event.detail.prop === 'currentJob') {
    const url = new URL(location)
    if (url.searchParams.has('job')) {
      url.searchParams.delete('job')
      location.assign(url)
      return
    }
    location.replace(url)
  }
})
