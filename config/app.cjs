const { version } = require('../package.json')

module.exports = {
  version: version,
  baseUrl: 'https://corvee.bib.umontreal.ca',
  // baseUrl: '',
  description: 'Corvée: le site où trouver vos liens brisés.',
  aligoliasearch: {
    applicationID: 'AT9I76OQTC',
    apiKey: '1feac540f9fa7ed6b180dfbae4a11d82',
    indexName: 'pages',
  },
  cookie: {
    name: 'cv',
    options: {
      domain: 'bib.umontreal.ca',
      // domain: 'localhost',
      sameSite: 'strict',
    },
  },
  home: {
    title: 'Corvée - Liens brisés par section',
  },
  actions: [
    {
      key: 'to-be-fixed',
      long: 'Ce lien est à corriger',
      short: 'À corriger',
    },
    {
      key: 'fixed',
      long: 'Ce lien a été corrigé',
      short: 'Corrigé',
    },
    {
      key: 'no-error',
      long: 'Ce lien fonctionne (faux positif)!',
      short: 'Faux positif!',
    },
    {
      key: 'ignore',
      long: 'Ne pas tenir compte de ce lien',
      short: 'Ignorer',
    },
  ],
  defaultLinkType: 'A',
  linkTypes: {
    A: 'texte',
    IFRAME: 'cadre <small>(iframe)</small>',
    IMG: 'image',
    FORM: 'formulaire',
    LINK: 'feuille de style',
    SCRIPT: 'script',
  },
}
