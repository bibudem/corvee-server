import { userConfig } from '../../common/js/user-config.js'

document.addEventListener('DOMContentLoaded', function () {
  const jobsList = document.querySelector('.cv-jobs-list')
  if (jobsList) {
    const minWidth = getComputedStyle(jobsList.querySelector('.dropdown-toggle')).width
    jobsList.querySelector('.dropdown-menu').style.setProperty('--cv-dropdown-min-width', minWidth)

    jobsList.querySelector('.cv-dropdown-menu').addEventListener('click', function (event) {
      const self = event.target
      if (self.classList.contains('dropdown-item') && !self.classList.contains('active')) {
        userConfig.set({ currentJob: self.dataset.value })
        location.reload()
      }
    })
  }
})
