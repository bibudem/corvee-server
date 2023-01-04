import { userConfig } from '../../common/js/user-config.js'

userConfig.addEventListener('change', event => {
  if (event.detail.prop === 'currentJob') {
    const url = new URL(location)
    url.searchParams.delete('job')
    location.replace(url)
  }
})
