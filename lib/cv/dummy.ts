// Dummy CV data pro generování thumbnail náhledů 15 šablon.
// Reálná osoba není — fiktivní zedník z Curychu.

import type { CVData } from './types'

export const DUMMY_CV_DATA: CVData = {
  profil:
    'Spolehlivý zedník s 7 lety zkušeností v hrubých stavbách. Certifikovaný operátor jeřábu, ovládám B2 němčinu. Hledám pozici v Curychu.',
  personalData: {
    name: 'Petr Novák',
    birthdate: '15.3.1990',
    nationality: 'Česká',
    address: 'Zürich, CH',
    phone: '+41 79 123 45 67',
    email: 'petr.novak@example.com',
    drivingLicense: 'B, C',
  },
  experience: [
    {
      period: '2019–2024',
      title: 'Zedník',
      company: 'StavbyPraha s.r.o.',
      location: 'Praha',
      tasks: [
        'Hrubé stavby rodinných domů',
        'Obsluha jeřábu s certifikátem',
        'Vedení skupiny 4 pomocných dělníků',
      ],
    },
    {
      period: '2017–2019',
      title: 'Pomocný stavební dělník',
      company: 'XY Bau GmbH',
      location: 'Mnichov',
      tasks: ['Práce na velkých stavbách', 'Obsluha míchačky a vibračních pěchů'],
    },
  ],
  education: [
    {
      period: '2014–2017',
      school: 'SOU stavební Praha',
      degree: 'Výuční list — zedník',
      location: 'Praha',
    },
  ],
  languages: [
    { language: 'Čeština', level: 'Mateřský' },
    { language: 'Němčina', level: 'B2' },
    { language: 'Angličtina', level: 'A2' },
  ],
  skills: {
    technical: ['Hrubé stavby', 'Obsluha jeřábu', 'Svařování', 'Práce ve výškách'],
    soft: ['Spolehlivost', 'Týmová práce', 'Pracovitost'],
  },
  certifications: ['BOZP', 'Schweißen E1', 'Höhenarbeit'],
}
