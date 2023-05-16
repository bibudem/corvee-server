const currentJob = '2023-05-10'
const deadline = '2023-08-31'

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
      title: 'Portails disciplinaires',
      sections: [
        {
          key: 'amenagement',
          title: 'Aménagement',
          urls: ['https://bib.umontreal.ca/amenagement'],
        },
        {
          key: 'anthropologie-demographie-sociologie',
          title: 'Anthropologie, démographie, sociologie',
          urls: ['https://bib.umontreal.ca/anthropologie-demographie-sociologie'],
        },
        {
          key: 'art-cinema-musique',
          title: 'Art, cinéma, musique',
          urls: ['https://bib.umontreal.ca/art-cinema-musique'],
        },
        {
          key: 'communication-sciences-information',
          title: "Communication, sciences de l'information",
          urls: ['https://bib.umontreal.ca/communication-sciences-information'],
        },
        {
          key: 'criminologie-psychologie-travail-social',
          title: 'Criminologie, psychologie, travail social',
          urls: ['https://bib.umontreal.ca/criminologie-psychologie-travail-social'],
        },
        {
          key: 'droit',
          title: 'Droit',
          urls: ['https://bib.umontreal.ca/droit'],
        },
        {
          key: 'economie-politique-relations-industrielles',
          title: 'Économie, politique, relations industrielles',
          urls: ['https://bib.umontreal.ca/economie-politique-relations-industrielles'],
        },
        {
          key: 'education-psychoeducation',
          title: 'Éducation, psychoéducation',
          urls: ['https://bib.umontreal.ca/education-psychoeducation'],
        },
        {
          key: 'etudes-religieuses-histoire-philosophie',
          title: 'Études religieuses, histoire, philosophie',
          urls: ['https://bib.umontreal.ca/etudes-religieuses-histoire-philosophie'],
        },
        {
          key: 'informatique-mathematique-sciences-nature',
          title: 'Informatique, mathématiques, sciences de la nature',
          urls: ['https://bib.umontreal.ca/informatique-mathematique-sciences-nature'],
        },
        {
          key: 'langues-litteratures',
          title: 'Langues et littératures',
          urls: ['https://bib.umontreal.ca/langues-litteratures'],
        },
        {
          key: 'sciences-sante',
          title: 'Sciences de la santé',
          urls: ['https://bib.umontreal.ca/sciences-sante'],
        },
        {
          key: 'multidisciplinaire',
          title: 'Multidisciplinaire',
          urls: ['https://bib.umontreal.ca/multidisciplinaire'],
        },
      ],
    },
    {
      title: 'Autres sections du site',
      sections: [
        {
          key: 'chercher',
          title: "Chercher de l'information",
          urls: ['https://bib.umontreal.ca/chercher', 'https://bib.umontreal.ca/guides', 'https://bib.umontreal.ca/emprunter'],
        },
        {
          key: 'utiliser',
          title: "Utiliser l'information",
          urls: ['https://bib.umontreal.ca/citer', 'https://bib.umontreal.ca/evaluer-analyser-rediger', 'https://bib.umontreal.ca/gerer-diffuser', 'https://bib.umontreal.ca/formations'],
        },
        {
          key: 'travailler',
          title: 'Travailler en bibliothèque',
          urls: ['https://bib.umontreal.ca/travailler'],
        },
        {
          key: 'a-propos',
          title: 'À propos',
          urls: ['https://bib.umontreal.ca/les-bibliotheques-udem', 'https://bib.umontreal.ca/faire-un-don', 'https://bib.umontreal.ca/communications', 'https://bib.umontreal.ca/services', 'https://bib.umontreal.ca/collections', 'https://bib.umontreal.ca/sondage-et-enquetes'],
        },
        {
          key: 'soutien-enseignement',
          title: "Soutien à l'enseignement",
          urls: ['https://bib.umontreal.ca/soutien-enseignement'],
        },
        {
          key: 'soutien-recherche',
          title: 'Soutien à la recherche',
          urls: ['https://bib.umontreal.ca/soutien-recherche', 'https://bib.umontreal.ca/recherche-documentaire-subventions-et-laboratoires'],
        },
        {
          key: 'nous-joindre',
          title: 'Nous joindre',
          urls: ['https://bib.umontreal.ca/nous-joindre'],
        },
        {
          key: 'www',
          title: 'Pages sur www.bib.umontreal.ca',
          urls: ['https://www.bib.umontreal.ca'],
        },
      ],
    },
  ],
}
