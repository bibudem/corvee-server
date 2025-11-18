const currentJob = '2025-11-09'
const deadline = '2026-02-16'

// ----------------------------

const longDateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeZone: 'UTC' })

module.exports = {
  currentJob,
  harvestDate: currentJob,
  harvestDateFormated: longDateFormat.format(new Date(currentJob)),
  deadline,
  deadlineFormated: longDateFormat.format(new Date(deadline)),
  sections: [
    {
      sections: [
        {
          key: 'tous',
          title: 'Tous les liens <small>(attention: très longue page)</small>',
          urls: [''],
        },
      ],
    },
    {
      title: 'Site central',
      sections: [
        {
          key: 'site-central/accueil',
          title: 'Accueil',
          urls: [/https:\/\/bib\.umontreal\.ca\/$/i],
        },
        {
          key: 'site-central/engagements',
          title: 'Engagements',
          urls: ['https://bib.umontreal.ca/engagements'],
        },
        {
          key: 'site-central/enseignement',
          title: 'Enseignement',
          urls: ['https://bib.umontreal.ca/enseignement'],
        },
        {
          key: 'site-central/espaces',
          title: 'Espaces',
          urls: ['https://bib.umontreal.ca/espaces'],
        },
        {
          key: 'site-central/etudes',
          title: 'Études',
          urls: ['https://bib.umontreal.ca/etudes'],
        },
        {
          key: 'site-central/recherche',
          title: 'Recherche',
          urls: ['https://bib.umontreal.ca/recherche'],
        },
        {
          key: 'site-central/a-propos',
          title: 'À propos',
          urls: ['https://bib.umontreal.ca/a-propos'],
        },
        {
          key: 'site-central/nous-joindre',
          title: 'Nous joindre',
          urls: ['https://bib.umontreal.ca/nous-joindre'],
        },
        {
          key: 'site-central/nous-soutenir',
          title: 'Nous soutenir',
          urls: ['https://bib.umontreal.ca/nous-soutenir'],
        },
        {
          key: 'site-central/obtenir',
          title: 'Obtenir',
          urls: ['https://bib.umontreal.ca/obtenir'],
        },
        {
          key: 'site-central/autres',
          title: 'Autres',
          urls: ['https://bib.umontreal.ca/accessibilite-web', 'https://bib.umontreal.ca/conditions-utilisation', 'https://bib.umontreal.ca/horaires', 'https://bib.umontreal.ca/service-accessibilite'],
        },
        {
          key: 'site-central/toutes-les-pages',
          title: 'Toutes les pages',
          urls: ['https://bib.umontreal.ca/'],
        },
      ],
    },
    {
      title: 'Boîte à outils',
      sections: [
        {
          key: 'boite-outils/amenagement',
          title: 'Aménagement',
          urls: ['https://boite-outils.bib.umontreal.ca/amenagement'],
        },
        {
          key: 'boite-outils/anthropologie-demographie-sociologie',
          title: 'Anthropologie, démographie, sociologie',
          urls: ['https://boite-outils.bib.umontreal.ca/anthropologie-demographie-sociologie'],
        },
        {
          key: 'boite-outils/art-cinema-musique',
          title: 'Art, cinéma, musique',
          urls: ['https://boite-outils.bib.umontreal.ca/art-cinema-musique'],
        },
        {
          key: 'boite-outils/communication-sciences-information',
          title: "Communication, sciences de l'information",
          urls: ['https://boite-outils.bib.umontreal.ca/communication-sciences-information'],
        },
        {
          key: 'boite-outils/criminologie-psychologie-travail-social',
          title: 'Criminologie, psychologie, travail social',
          urls: ['https://boite-outils.bib.umontreal.ca/criminologie-psychologie-travail-social'],
        },
        {
          key: 'boite-outils/droit',
          title: 'Droit',
          urls: ['https://boite-outils.bib.umontreal.ca/droit'],
        },
        {
          key: 'boite-outils/economie-politique-relations-industrielles',
          title: 'Économie, politique, relations industrielles',
          urls: ['https://boite-outils.bib.umontreal.ca/economie-politique-relations-industrielles'],
        },
        {
          key: 'boite-outils/education-psychoeducation',
          title: 'Éducation, psychoéducation',
          urls: ['https://boite-outils.bib.umontreal.ca/education-psychoeducation'],
        },
        {
          key: 'boite-outils/etudes-religieuses-histoire-philosophie',
          title: 'Études religieuses, histoire, philosophie',
          urls: ['https://boite-outils.bib.umontreal.ca/etudes-religieuses-histoire-philosophie'],
        },
        {
          key: 'boite-outils/informatique-mathematique-sciences-nature',
          title: 'Informatique, mathématiques, sciences de la nature',
          urls: ['https://boite-outils.bib.umontreal.ca/informatique-mathematique-sciences-nature'],
        },
        {
          key: 'boite-outils/langues-litteratures',
          title: 'Langues et littératures',
          urls: ['https://boite-outils.bib.umontreal.ca/langues-litteratures'],
        },
        {
          key: 'boite-outils/sciences-sante',
          title: 'Sciences de la santé',
          urls: ['https://boite-outils.bib.umontreal.ca/sciences-sante'],
        },
        {
          key: 'boite-outils/multidisciplinaire',
          title: 'Multidisciplinaire',
          urls: ['https://boite-outils.bib.umontreal.ca/multidisciplinaire'],
        },
        {
          key: 'boite-outils/recherche',
          title: 'Recherche et cycles supérieurs',
          urls: ['https://boite-outils.bib.umontreal.ca/recherche'],
        },
        {
          key: 'boite-outils/trouver-evaluer',
          title: 'Trouver et évaluer de l’information',
          urls: ['https://boite-outils.bib.umontreal.ca/trouver-evaluer'],
        },
        {
          key: 'boite-outils/citer',
          title: 'Citations et bibliographies',
          urls: ['https://boite-outils.bib.umontreal.ca/citer'],
        },
        {
          key: 'boite-outils/toutes',
          title: 'Toutes les pages de cette section',
          urls: ['https://boite-outils.bib.umontreal.ca/'],
        },
      ],
    },
    {
      title: 'Studio.bib',
      sections: [
        {
          key: 'studio/accueil',
          title: 'Accueil',
          urls: [/https:\/\/studio\.bib\.umontreal\.ca\/$/i],
        },
        {
          key: 'studio/espaces',
          title: 'Espaces',
          urls: ['https://studio.bib.umontreal.ca/espaces'],
        },
        {
          key: 'studio/informatique',
          title: 'Ressources informatique',
          urls: ['https://studio.bib.umontreal.ca/informatique'],
        },
        {
          key: 'studio/creatives',
          title: 'Technologies créatives',
          urls: ['https://studio.bib.umontreal.ca/creatives'],
        },
        {
          key: 'studio/medias',
          title: 'Productions médias',
          urls: ['https://studio.bib.umontreal.ca/medias'],
        },
        {
          key: 'studio/a-propos',
          title: 'À propos',
          urls: ['https://studio.bib.umontreal.ca/a-propos'],
        },
        {
          key: 'studio/toutes-les-pages',
          title: 'Toutes les pages de cette section',
          urls: ['https://studio.bib.umontreal.ca/'],
        },
      ],
    },
    {
      title: 'Autres sections du site',
      sections: [
        {
          key: 'www',
          title: 'Pages sur www.bib.umontreal.ca',
          urls: ['https://www.bib.umontreal.ca'],
        },
      ],
    },
  ],
}
