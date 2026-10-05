export interface NavItem {
  title: string
  path: string
  external?: boolean
  children?: NavItem[]
}

export const mainNavigation: NavItem[] = [
  { title: 'About', path: '/about' },
  { title: 'Blog', path: '/blog' },
  { title: 'Membership', path: '/membership' },
  { title: 'Standards', path: '/docs' },
  { title: 'References', path: '/references' },
  { title: 'FERIN', path: 'https://www.ferin.org', external: true },
]
