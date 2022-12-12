import { Dropdown, Collapse, Offcanvas } from 'bootstrap'
import { animate, easeIn, easeOut } from 'popmotion'
import '@evanminto/sticky-sentinel-element'
import './js/last-harvested-dropdown.js'
import { userConfig } from '../common/js/user-config.js'
import cvReportManager from '../cv-report/cv-report-manager.js'
import { initSearchWidget } from './js/search-widget.js'
import './scss/cv-server.scss'

document.addEventListener('DOMContentLoaded', () => {
  const totalErrors = document.querySelector('#cv-total-errors')
  const hideFixedWidget = document.querySelector('#cv-hide-fixed')
  const pageReportList = document.querySelector('.cv-page-reports-list')
  const pageReports = document.querySelectorAll('.cv-page-report')

  function toggleHideFixed(showAnimation = true) {
    function show(el, duration) {
      animate({
        from: 0,
        to: el._height,
        ease: easeIn,
        duration,
        onUpdate: latest => {
          el.style.height = `${latest}px`
        },
        onComplete: () => {
          el.style.removeProperty('height')
          delete el._height
        },
      })
    }

    function hide(el, duration) {
      animate({
        from: el._height,
        to: 0,
        ease: easeOut,
        duration,
        onUpdate: latest => (el.style.height = `${latest}px`),
      })
    }

    if (hideFixedWidget.checked) {
      pageReports.forEach(pageReport => {
        const reports = pageReport.querySelectorAll('cv-report')
        const reportsToHide = [...reports].filter(report => ['fixed', 'ignore', 'no-error'].includes(report.getAttribute('action')))
        if (reports.length === reportsToHide.length) {
          // Only hide the page report

          pageReport._height = parseFloat(getComputedStyle(pageReport).getPropertyValue('height'))

          if (!showAnimation) {
            pageReport.classList.add('cv-hide')
            return
          }
          pageReport.classList.add('cv-animate-zoom-out')

          hide(pageReport, parseFloat(getComputedStyle(pageReport).getPropertyValue('--cv-animate-duration')) * 1000)

          pageReport.addEventListener(
            'animationend',
            () => {
              pageReport.classList.add('cv-hide')
              pageReport.setAttribute('aria-hidden', 'true')
              pageReport.classList.remove('cv-animate-zoom-out')
            },
            { once: true }
          )
        } else {
          // Hide each reports
          reportsToHide.forEach(report => {
            report._height = parseFloat(getComputedStyle(report).getPropertyValue('height'))

            if (!showAnimation) {
              report.classList.add('cv-hide')
              return
            }

            report.classList.add('cv-animate-zoom-out')
            hide(report, parseFloat(getComputedStyle(report).getPropertyValue('--cv-animate-duration')) * 1000)
            report.addEventListener(
              'animationend',
              () => {
                report.classList.add('cv-hide')
                report.classList.remove('cv-animate-zoom-out')
                pageReport.setAttribute('aria-hidden', 'true')
              },
              { once: true }
            )
          })
        }
      })

      userConfig.set({ hideFixed: true })
    } else {
      pageReportList.querySelectorAll('.cv-hide').forEach(hiddenItem => {
        if (!showAnimation) {
          hiddenItem.classList.remove('cv-hide')
          return
        }
        hiddenItem.classList.add('cv-animate-zoom-in')
        hiddenItem.removeAttribute('aria-hidden')
        hiddenItem.classList.remove('cv-hide')

        show(hiddenItem, parseFloat(getComputedStyle(hiddenItem).getPropertyValue('--cv-animate-duration')) * 1000)

        hiddenItem.addEventListener(
          'animationend',
          () => {
            hiddenItem.classList.remove('cv-animate-zoom-in')
          },
          { once: true }
        )
      })

      userConfig.set({ hideFixed: false })
    }
  }

  // globalThis.collapse = Collapse.getOrCreateInstance(document.querySelector('[data-bs-toggle="collapse"]'), { toggle: false })

  totalErrors.innerText = cvReportManager.totalErrors
  cvReportManager.addEventListener('total-errors', event => {
    totalErrors.innerText = event.detail.total
  })

  hideFixedWidget.addEventListener('change', () => toggleHideFixed())

  if (hideFixedWidget.checked) {
    toggleHideFixed(false)
  }

  initSearchWidget()
})
