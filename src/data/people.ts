export interface Person {
  name: string
  slug: string
  role: string
  blurb: string
  links?: Array<{ label: string; href: string }>
}

// Founders, as presented on the About page. Roles and backgrounds are taken
// from the Foundation's published material.
export const people: Person[] = [
  {
    name: 'Reese Plews',
    slug: 'reese-plews',
    role: 'President',
    blurb:
      'Convenes the Terminology Management Group of ISO/TC 211, Geographic information/Geomatics, and coordinates its Multi-Lingual Glossary of Terms. Reese drives Enosema’s standardization agenda for shared concepts.',
    links: [
      { label: 'ISO/TC 211 — Terminology Management Group', href: 'https://committee.iso.org/home/tc211' },
    ],
  },
  {
    name: 'Joanna Goodwin',
    slug: 'joanna-goodwin',
    role: 'Founder',
    blurb:
      'Previously Terminology Coordinator at the IEC and secretary of IEC/TC 1, Terminology. Joanna brings deep experience in managing international electrotechnical terminology to the Foundation.',
    links: [
      { label: 'IEC — International Electrotechnical Commission', href: 'https://www.iec.ch/homepage' },
      { label: 'IEC/TC 1 — Terminology', href: 'https://www.iec.ch/dyn/www/f?p=103:7:0::::FSP_ORG_ID,FSP_LANG_ID:1231,25' },
    ],
  },
  {
    name: 'Ronald Tse',
    slug: 'ronald-tse',
    role: 'Founder',
    blurb:
      'Convenes Date and time at ISO/TC 154, e-Business, and is the founder of Ribose. Ronald works on open standards and machine-readable, smart standardization of concepts and their models.',
    links: [
      { label: 'ISO/TC 154 — e-Business', href: 'https://www.isotc154.org' },
      { label: 'Ribose', href: 'https://www.ribose.com' },
    ],
  },
]
