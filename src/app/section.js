import 'bootstrap/js/dist/collapse.js'
import 'bootstrap/js/dist/offcanvas.js'
import { animate, easeIn, easeOut } from 'popmotion'
import StickyEvents from 'sticky-events'
import '../cv-report/cv-report.js'
import '../cv-report-header/cv-report-header.js'
import '../cv-report-body/cv-report-body.js'
import '../cv-switch/cv-switch.js'
import './js/app-base.js'
import { userConfig } from '../common/js/user-config.js'
import reportManager from '../common/js/report-manager.js'
import { baseUrl, version } from 'client-config/app'

document.addEventListener('DOMContentLoaded', async () => {
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

  totalErrors.innerText = reportManager.totalErrors

  reportManager.addEventListener('total-errors', event => {
    totalErrors.innerText = event.detail.totalErrors
  })

  hideFixedWidget.addEventListener('change', () => toggleHideFixed())

  if (hideFixedWidget.checked) {
    toggleHideFixed(false)
  }

  const stickyEvents = new StickyEvents({
    stickySelector: '.cv-page-report-header',
  })

  // stickyEvents.enableEvents()

  const { stickyElements, stickySelector } = stickyEvents

  stickyElements.forEach(sticky => {
    sticky.addEventListener(StickyEvents.CHANGE, event => {
      sticky.classList.toggle('stuck', event.detail.isSticky)
    })
  })

  const progressBar = document.querySelector('.indeterminate-progress-bar')
  if (progressBar) {
    requestIdleCallback(
      function () {
        progressBar.remove()
      },
      {
        timeout: 10000,
      }
    )
  }

  const searchWidget = await import(`${baseUrl}/${version}/app/search-widget.js`)
  searchWidget.initSearchWidget()
})
