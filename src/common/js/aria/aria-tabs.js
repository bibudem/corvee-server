/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   tabs-automatic.js
 *
 *   Desc:   Tablist widget that implements ARIA Authoring Practices
 */

export class AriaTabs {
  constructor(groupNode) {
    this.tablistNode = groupNode

    this.tabs = []

    this.firstTab = null
    this.lastTab = null

    this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'))
    this.tabpanels = []

    const observer = new MutationObserver(mutationList => {
      for (const mutation of mutationList) {
        mutation.target.setAttribute('tabindex', mutation.target.active ? '0' : '-1')
      }
    })

    let defaultSelectedTab = this.tabs[0]

    for (var i = 0; i < this.tabs.length; i += 1) {
      const tab = this.tabs[i]
      const tabpanel = this.tablistNode.querySelector(`#${tab.getAttribute('aria-controls')}`)

      if (tab.active) {
        defaultSelectedTab = tab
      }

      observer.observe(tab, { attributes: true, attributeFilter: ['aria-selected'] })

      this.tabpanels.push(tabpanel)

      tab.addEventListener('keydown', this.onKeydown.bind(this))

      if (!this.firstTab) {
        this.firstTab = tab
      }
      this.lastTab = tab
    }
  }

  setSelectedTab(currentTab, setFocus = true) {
    if (setFocus) {
      currentTab.addEventListener(
        'gr-blur',
        event => {
          setTimeout(() => {
            currentTab.focus()
          })
        },
        { once: true }
      )
      currentTab.click()
    }
  }

  setSelectedToPreviousTab(currentTab) {
    var index

    if (currentTab === this.firstTab) {
      this.setSelectedTab(this.lastTab)
    } else {
      index = this.tabs.indexOf(currentTab)
      this.setSelectedTab(this.tabs[index - 1])
    }
  }

  setSelectedToNextTab(currentTab) {
    var index

    if (currentTab === this.lastTab) {
      this.setSelectedTab(this.firstTab)
    } else {
      index = this.tabs.indexOf(currentTab)
      this.setSelectedTab(this.tabs[index + 1])
    }
  }

  /* EVENT HANDLERS */

  onKeydown(event) {
    const target = event.currentTarget
    let flag = false

    switch (event.key) {
      case 'ArrowLeft':
        this.setSelectedToPreviousTab(target)
        flag = true
        break

      case 'ArrowRight':
        this.setSelectedToNextTab(target)
        flag = true
        break

      case 'Home':
        this.setSelectedTab(this.firstTab)
        flag = true
        break

      case 'End':
        this.setSelectedTab(this.lastTab)
        flag = true
        break

      default:
        break
    }

    if (flag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
}
