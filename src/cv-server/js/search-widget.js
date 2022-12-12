import algoliasearch from 'algoliasearch/lite'
import instantsearch from 'instantsearch.js'
import { configure, searchBox, hits, pagination } from 'instantsearch.js/es/widgets'
import ScrollBarHelper from '../../common/js/scrollbar.js'
import { userConfig } from '../../common/js/user-config.js'

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

    const client = algoliasearch('DVUHFZXXNR', '3adeac2167d2ab47036e8483b07eeed0')
    const indexName = 'bib_udem_corvee'
    const index = client.initIndex(indexName)
    const job = userConfig.get('currentJob')
    const section = location.pathname.split('/').pop()

    const scrollbar = new ScrollBarHelper()

    try {
      const { facetHits } = await index.searchForFacetValues('job', job)
      const searchInput = document.querySelector('.cv-search-input')

      if (facetHits && facetHits.length !== 1) {
        searchInput.hidden = true
        return
      }

      function middleware({ instantSearchInstance }) {
        return {
          onStateChange({ uiState }) {
            // Do something with `uiState` whenever the state changes.
          },
          subscribe() {
            // Do something when the InstantSearch instance starts.
            // console.log('subscribe!!!')
            // console.log(dialog.querySelector('.cv-search-hits-list-group'))
          },
          unsubscribe() {
            // Do something when the InstantSearch instance is disposed of.
          },
        }
      }

      // const { connectHits } = instantsearch.connectors;

      // const renderHits = (renderOptions, isFirstRender) => {
      //   const { hits, widgetParams } = renderOptions;

      //   widgetParams.container.innerHTML = `
      //     <ul class="cv-search-hits-list-group">
      //       ${hits
      //       .map(
      //         item => {
      //           const pages = item.pages ? `<p class="mb-1 pages"> ${item.pages.join(' | ')}</p>` : ''
      //           return `<li>
      //             <div tabindex = "0" class="cv-search-hits-item-action list-group-item list-group-item-action" data-cv-link-key-ref="${item.key}">
      //             <p class="mb-1 title">${item.title}</p>
      //              ${pages}
      //              <p class="mb-1"><small><code>${item.url}</code></small></p>
      //              <p class="mb-1"><small class="text">${item.text}</small></p>
      //            </div >
      //             </li>`
      //         }
      //       )
      //       .join('')}
      //     </ul >
      //   `;
      //   console.log(bootstrap)
      // };

      // // Create the custom widget
      // const customHits = connectHits(renderHits);

      const instantsearchParams = {
        indexName,
        searchClient: client,
        // hitsPerPage: 10,
        numberLocale: 'fr',
        onStateChange({ uiState, setUiState }) {
          const newStateUrl = new URL(location.href)
          if (uiState.bib_udem_corvee.query) {
            newStateUrl.searchParams.set('q', uiState.bib_udem_corvee.query)
          } else {
            newStateUrl.searchParams.delete('q')
          }
          history.replaceState(null, '', newStateUrl.href)
          setUiState(uiState)
        },
      }

      if (/q=./.test(location.search)) {
        instantsearchParams.initialUiState = {
          bib_udem_corvee: {
            query: new URL(location).searchParams.get('q'),
          },
        }
      }

      const search = instantsearch(instantsearchParams)

      search.use(middleware)

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
          },
        }),

        hits({
          container: '#cv-search-hits',
          // scrollTo: '#cv-search-hits',
          cssClasses: {
            root: ['overflow-auto', 'hits-root'],
            list: ['cv-search-hits-list-group', 'list-group'],
            item: ['cv-search-hits-item'],
          },
          templates: {
            item(hit, { html, components }) {
              const pages = hit.pages ? html`<p class="cv-search-hits-item-pages">${hit.pages.join(' | ')}</p>` : ''
              const text = hit.text ? html`<p class="cv-search-hits-item-text"><small>${hit.text}</small></p>` : ''
              return html`<div tabindex="0" class="cv-search-hits-item-action list-group-item list-group-item-action"
  data-cv-link-key-ref="${hit.key}">
  <p class="cv-search-hits-item-title">${components.Highlight({ hit, attribute: 'title' })}</p>
  ${pages}
  <p class="cv-search-hits-item-url">
    <small><code>${components.Highlight({ hit, attribute: 'url' })}</code></small>
  </p>
  ${text}
</div>`
            },
            empty(result, { html }) {
              return html`Aucun résultat pour <q> ${result.query} </q>`
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

      const searchBarWidgetInput = document.querySelector('.cv-search-input-btn')
      const searchDialogForm = dialog.querySelector('.cv-search-dialog-form')
      const searchDialogInput = dialog.querySelector('.cv-search-dialog-input')
      const searchDialogSubmitBtn = dialog.querySelector('.cv-search-dialog-submit-btn')
      const searchDialogResetBtn = dialog.querySelector('.cv-search-dialog-reset-btn')
      const searchPagination = dialog.querySelector('.cv-search-pagination')

      searchDialogSubmitBtn.tabIndex = -1

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
        // setTimeout(() => {
        dialog.showModal()
        // })
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
        dialog.querySelectorAll('.cv-search-hits-item-action.active').forEach(elem => elem.classList.remove('active'))
      }

      function updateSearchWidget(hitElement) {
        const selectedPageTitle = hitElement.querySelector('.cv-search-hits-item-title').innerText
        const key = hitElement.dataset.cvLinkKeyRef

        searchInput.classList.remove('empty')
        searchInput.classList.add('filled')
        searchBarWidgetInput.innerHTML = `<span class="cv-chip badge"><button type="button" class="btn-close" aria-label="Supprimer"></button><span  tabindex="0" class="cv-chip-text">${selectedPageTitle}</span></span>`
        searchDialogInput.value = selectedPageTitle
        searchBarWidgetInput.tabIndex = -1
        searchDialogInput.dispatchEvent(new InputEvent('input'))
        clearSearchHitsList()
        hitElement.classList.add('active')
        updateSearchDialogSubmitBtn()
        filterPages(key)
      }

      function clearSearchWidget() {
        searchInput.classList.remove('filled')
        searchInput.classList.add('empty')
        searchBarWidgetInput.innerHTML = `<span class="cv-placeholder">${searchBarWidgetInput.dataset.placeholder}</span>`
        searchBarWidgetInput.removeAttribute('tabindex')
        searchDialogForm.reset()
        clearSearchHitsList()
        clearFilterPages()
        searchBarWidgetInput.focus()
      }

      const filterPagesSheet = new CSSStyleSheet()
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, filterPagesSheet]

      function filterPages(key) {
        filterPagesSheet.replaceSync(`
            [data-cv-link-key] {
              display: none;
            }
            [data-cv-link-key="${key}"] {
              display: block;
            }
          `)
      }

      function clearFilterPages() {
        filterPagesSheet.replaceSync('')
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

      document.querySelectorAll('.rapport').forEach(async rapport => {
        const pageUrl = new URL(rapport.querySelector('.rapport--heading-content a').href)
        pageUrl.hash = ''
        pageUrl.searchParams.delete('tab')
        const pageKey = await hash(pageUrl.href)
        rapport.dataset.cvLinkKey = pageKey
      })

      searchBarWidgetInput.addEventListener('click', function (event) {
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
        if (self.classList.contains('cv-search-hits-item-action')) {
          updateSearchWidget(self)
          closeDialog(true)
        }
      })

      dialog.addEventListener('keyup', function (event) {
        if (event.isComposing || event.keyCode === 229) {
          return
        }

        const self = event.target
        if (event.key === 'Enter' && self.classList.contains('cv-search-hits-item-action')) {
          updateSearchWidget(self)
          closeDialog(true, () => {
            searchBarWidgetInput.querySelector('.btn-close').focus({ focusVisible: true })
          })
        }
      })

      searchDialogInput.addEventListener('focus', updateSearchDialogSubmitBtn)

      searchDialogResetBtn.addEventListener('click', function () {
        clearSearchWidget()
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
          dialog.querySelector('.cv-search-hits').scrollTo(0, 0)
        }
      })

      const paginationObserver = new MutationObserver(updatePaginationVisibility)

      paginationObserver.observe(searchPagination, { attributes: false, childList: true, subtree: true })

      // updatePaginationVisibility()

      if (/q=./.test(location.search)) {
        searchDialogSubmitBtn.hidden = true
        showDialog()
      }
    } catch (error) {
      console.error('Could not search index. Error: ', error)
    }
  }
}
