import algoliasearch from 'algoliasearch/lite'
import instantsearch from 'instantsearch.js'
import { configure, searchBox, hits, pagination } from 'instantsearch.js/es/widgets'
import ScrollBarHelper from '../../common/js/scrollbar.js'
import { userConfig } from '../../common/js/user-config.js'
import iconClose from '../../common/icons/close.svg'
import iconSearch from '../../common/icons/search.svg'
import iconLoading from '../../common/icons/spinner-rolling.svg'
import iconArrowLeft from '../../common/icons/arrow-left.svg'
import { algoliasearch as algoliasearchConfig } from '@corvee/client-config/app'

export function initSearchWidget() {
  // console.log('initSearchWidget')
  // document.addEventListener('DOMContentLoaded', async () => {
  //   console.log('DOMContentLoaded')
  _doInitSearchWidget()
  // })
}

async function _doInitSearchWidget() {
  if (document.querySelector('#cv-search-input-btn')) {
    const dialog = document.querySelector('.cv-search-dialog')

    const client = algoliasearch(algoliasearchConfig.applicationID, algoliasearchConfig.apiKey)
    const indexName = algoliasearchConfig.indexName
    const index = client.initIndex(indexName)
    const job = userConfig.get('currentJob')
    const section = location.pathname.split('/').pop()

    const scrollbar = new ScrollBarHelper()

    try {
      const { facetHits } = await index.searchForFacetValues('job', job)
      const searchInput = document.querySelector('.cv-search-input')

      function onSearchInputAnimation(event) {
        const target = event.target
        if (target === searchInput && event.animationName === 'fade-out') {
          if (target.classList.contains('hide-search-widget')) {
            target.hidden = true
          }
          target.classList.remove('show-search-widget', 'hide-search-widget')
          target.removeEventListener('animationend', onSearchInputAnimation)
        }
      }

      searchInput.addEventListener('animationend', onSearchInputAnimation)
      searchInput.classList.remove('loading')

      if (facetHits && facetHits.length !== 1) {
        searchInput.classList.add('hide-search-widget')
        return
      }

      searchInput.classList.add('show-search-widget')

      const instantsearchParams = {
        indexName,
        searchClient: client,
        // hitsPerPage: 10,
        numberLocale: 'fr',
        onStateChange({ uiState, setUiState }) {
          const newStateUrl = new URL(location.href)
          if (uiState.pages.query) {
            newStateUrl.searchParams.set('q', uiState.pages.query)
          } else {
            newStateUrl.searchParams.delete('q')
          }
          history.replaceState(null, '', newStateUrl.href)
          setUiState(uiState)
        },
      }

      if (/q=./.test(location.search)) {
        instantsearchParams.initialUiState = {
          pages: {
            query: new URL(location).searchParams.get('q'),
          },
        }
      }

      const search = instantsearch(instantsearchParams)

      // search.use(middleware)

      search.addWidgets([
        configure({
          facetFilters: [`job:${job} `, `sections:${section} `],
        }),

        searchBox({
          container: '#cv-search-dialog-box',
          placeholder: 'Cherchez un guide, une page',
          cssClasses: {
            root: 'cv-search-dialog-box',
            form: 'cv-search-dialog-form',
            input: 'cv-search-dialog-input',
            submit: 'cv-search-dialog-submit-btn',
            submitIcon: 'cv-search-dialog-submit-icon',
            reset: 'cv-search-dialog-reset-btn',
            resetIcon: 'cv-search-dialog-reset-icon',
            loadingIndicator: 'cv-search-dialog-loading-btn',
          },
          templates: {
            submit({ cssClasses }, { html }) {
              return html`${iconSearch}`
            },
            reset({ cssClasses }, { html }) {
              return html`${iconClose}`
            },
            loadingIndicator({ cssClasses }, { html }) {
              return html`${iconLoading}`
            },
          },
        }),

        hits({
          container: '#cv-search-hits',
          // scrollTo: '#cv-search-hits',
          cssClasses: {
            root: ['cv-search-hits-root'],
            list: ['cv-search-hits-list-group'],
            item: ['cv-search-hits-item'],
          },
          templates: {
            item(hit, { html, components }) {
              const pages = hit.pages ? html`<p class="cv-search-hits-item-pages">${hit.pages.join(' | ')}</p>` : ''
              const text = hit.text ? html`<p class="cv-search-hits-item-text"><small>${hit.text}</small></p>` : ''
              return html`<div tabindex="0" class="" data-cv-link-key-ref="${hit.key}">
  <p class="cv-search-hits-item-title">${components.Highlight({ hit, attribute: 'title' })}</p>
  ${pages}
  <p class="cv-search-hits-item-url">
    <small><code>${components.Highlight({ hit, attribute: 'url' })}</code></small>
  </p>
  ${text}
</div>`
            },
            empty(result, { html }) {
              return html`<div class="cv-search-hits-no-result">Aucun résultat pour <q> ${result.query} </q></div>`
            },
          },
        }),

        pagination({
          container: '#cv-search-pagination',
          cssClasses: {
            list: ['cv-search-pagination-list', 'pagination'],
            item: ['cv-search-pagination-item', 'page-item'],
            link: ['cv-search-pagination-link', 'page-link'],
            selectedItem: ['cv-search-pagination-active', 'active'],
            disabledItem: ['cv-search-pagination-disabled', 'disabled'],
            pageItem: 'cv-search-pagination-page-item',
          },
        }),
      ])

      search.start()

      const searchInputContainer = document.querySelector('.cv-search-input-container')
      const searchInputBtn = document.querySelector('.cv-search-input-btn')
      const searchDialogForm = dialog.querySelector('.cv-search-dialog-form')
      const searchDialogInput = dialog.querySelector('.cv-search-dialog-input')
      const searchDialogSubmitBtn = dialog.querySelector('.cv-search-dialog-submit-btn')
      const searchDialogResetBtn = dialog.querySelector('.cv-search-dialog-reset-btn')
      const searchDialogBackBtn = document.createElement('button')
      const searchHits = dialog.querySelector('.cv-search-hits')
      const searchPagination = dialog.querySelector('.cv-search-pagination')

      searchDialogSubmitBtn.tabIndex = -1

      searchDialogBackBtn.setAttribute('aria-label', 'Fermer')
      searchDialogBackBtn.classList.add('cv-search-dialog-back-btn')
      searchDialogBackBtn.innerHTML = iconArrowLeft
      searchDialogBackBtn.addEventListener('click', closeDialog)
      searchDialogForm.prepend(searchDialogBackBtn)

      // Translations
      searchDialogSubmitBtn.setAttribute('title', 'Chercher')
      searchDialogResetBtn.setAttribute('title', 'Effacer')

      function showDialog() {
        scrollbar.hide()

        dialog.addEventListener(
          'animationend',
          () => {
            dialog.classList.remove('open')
          },
          { once: true }
        )
        dialog.classList.add('open')
        dialog.showModal()
        searchDialogInput.focus()
        updateScrollbarVisility()
      }

      function closeDialog(delayed = false, callback = () => { }) {
        function doClose() {
          scrollbar.reset()
          dialog.addEventListener(
            'animationend',
            () => {
              dialog.close()
              dialog.classList.remove('close')
              callback()
            },
            { once: true }
          )
          dialog.classList.add('close')
        }

        if (!delayed) {
          doClose()
          return
        }

        setTimeout(doClose, 300)
      }

      dialog.addEventListener('click', event => {
        event.stopPropagation()
        if (!event.target.closest('.cv-search-dialog-content')) {
          closeDialog()
        }
      })

      function clearSearchHitsList() {
        dialog.querySelectorAll('.cv-search-hits-item.active').forEach(elem => elem.classList.remove('active'))
      }

      function onSearchInputContainerAnimation(event) {
        const target = event.target
        if (target === searchInputContainer) {
          if (event.animationName === 'cv-search-input-width') {
            if (target.classList.contains('expanding')) {
              //expanded
              target.classList.remove('expanding')
              target.style.setProperty('--_cv-search-input-computed-max-width', getComputedStyle(target).width)
            } else {
              // contracted
              target.classList.remove('contracting')
              searchInputBtn.innerHTML = `<span class="cv-placeholder">${searchInputBtn.dataset.placeholder}</span>`
              searchInputBtn.removeAttribute('tabindex')
              target.classList.add('empty')
              target.classList.remove('filled')
              target.style.setProperty('--_cv-search-input-computed-max-width', getComputedStyle(target).getPropertyValue('--cv-search-input-max-width'))
            }
          }
          target.removeEventListener('animationend', onSearchInputContainerAnimation)
        }
      }

      function updateSearchWidget(hitElement) {
        const selectedPageTitle = hitElement.querySelector('.cv-search-hits-item-title').innerText
        const key = hitElement.dataset.cvLinkKeyRef

        searchInputContainer.addEventListener('animationend', onSearchInputContainerAnimation)

        searchInputContainer.classList.remove('empty')
        searchInputContainer.classList.add('filled', 'expanding')
        searchInputBtn.innerHTML = `<span class="cv-chip"><button type="button" class="btn-close" aria-label="Supprimer" title="Supprimer"></button><span  tabindex="0" class="cv-chip-text" title="${selectedPageTitle}">${selectedPageTitle}</span></span>`
        searchDialogInput.value = selectedPageTitle
        searchInputBtn.tabIndex = -1
        searchDialogInput.dispatchEvent(new InputEvent('input'))
        clearSearchHitsList()
        hitElement.classList.add('active')
        updateSearchDialogSubmitBtn()
        filterPages(key)
      }

      function clearSearchWidget() {
        searchInputContainer.addEventListener('animationend', onSearchInputContainerAnimation)

        searchInputContainer.classList.add('contracting')
        searchDialogForm.reset()
        clearSearchHitsList()
        clearFilterPages()
        searchInputBtn.focus()
      }

      const filterPagesSheet = new CSSStyleSheet()
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, filterPagesSheet]

      function filterPages(key) {
        filterPagesSheet.replace(`
            [data-cv-link-key] {
              display: none;
            }
            [data-cv-link-key="${key}"] {
              display: block;
            }
          `)
      }

      function clearFilterPages() {
        filterPagesSheet.replace('')
      }

      async function hash(str) {
        const msgUint8 = new TextEncoder().encode(str) // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
        return hashHex.slice(0, 10)
      }

      function updateSearchDialogSubmitBtn() {
        if (searchDialogInput.value.length > 0) {
          searchDialogSubmitBtn.hidden = true
        } else {
          searchDialogSubmitBtn.hidden = false
        }
      }

      function updatePaginationVisibility() {
        if (searchPagination.querySelectorAll('.cv-search-pagination-page-item').length < 2) {
          searchPagination.classList.add('cv-hide')
        } else {
          searchPagination.classList.remove('cv-hide')
        }
      }

      function updateScrollbarVisility() {
        if (!searchHits.checkVisibility()) {
          return
        }

        const scrollbarWidth = searchHits.offsetWidth - searchHits.scrollWidth
        searchHits.style.setProperty('--_actual-scrollbar-width', `${scrollbarWidth}px`)
      }

      //
      // Initialisation
      //

      document.querySelectorAll('.rapport').forEach(async rapport => {
        const pageUrl = new URL(rapport.querySelector('.rapport--heading-content a').href)
        pageUrl.hash = ''
        pageUrl.searchParams.delete('tab')
        const pageKey = await hash(pageUrl.href)
        rapport.dataset.cvLinkKey = pageKey
      })

      searchInputBtn.addEventListener('click', function (event) {
        const self = event.target
        if (self.classList.contains('btn-close')) {
          event.stopPropagation()
          clearSearchWidget()
          return
        }

        showDialog()
      })

      dialog.addEventListener('click', function (event) {
        const self = event.target
        if (self.classList.contains('cv-search-hits-item')) {
          updateSearchWidget(self)
          closeDialog(true)
        }
      })

      dialog.addEventListener('keydown', function (event) {
        // Escape key
        if (event.keyCode === 27) {
          event.preventDefault()
          console.log('default prevented')
          closeDialog()
        }
      })

      dialog.addEventListener('keyup', function (event) {
        if (event.isComposing || event.keyCode === 229) {
          return
        }

        const self = event.target
        if (event.key === 'Enter' && self.classList.contains('cv-search-hits-item')) {
          updateSearchWidget(self)
          closeDialog(true, () => {
            searchInputBtn.querySelector('.btn-close').focus({ focusVisible: true })
          })
        }
      })

      searchDialogInput.addEventListener('focus', updateSearchDialogSubmitBtn)

      searchDialogResetBtn.addEventListener('click', function () {
        clearSearchWidget()
        console.log('ici')
        updateSearchDialogSubmitBtn()
      })

      searchDialogInput.addEventListener('keyup', updateSearchDialogSubmitBtn)

      searchDialogInput.addEventListener('focus', function () {
        searchDialogForm.classList.add('focus')
      })

      searchDialogInput.addEventListener('blur', function () {
        searchDialogForm.classList.remove('focus')
      })

      dialog.addEventListener('click', function (event) {
        if (event.target.classList.contains('cv-search-pagination-link')) {
          searchHits.scrollTo(0, 0)
        }
      })

      const paginationObserver = new MutationObserver(updatePaginationVisibility)

      paginationObserver.observe(searchPagination, { attributes: false, childList: true, subtree: true })

      const scrollbarObserver = new MutationObserver(updateScrollbarVisility)

      scrollbarObserver.observe(searchHits, { attributes: false, childList: true, subtree: true })

      const navBarHeight = getComputedStyle(document.querySelector('.cv-navbar')).height
      document.documentElement.style.setProperty('--cv-navbar-height', navBarHeight)

      if (/q=./.test(location.search)) {
        searchDialogSubmitBtn.hidden = true
        showDialog()
      }
    } catch (error) {
      console.error('Could not search index. Error: ', error)
    }
  }
}
