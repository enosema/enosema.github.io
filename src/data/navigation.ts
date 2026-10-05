export interface NavItem {
  title: string
  path: string
  children?: NavItem[]
}

export const mainNavigation: NavItem[] = [
  { title: 'About', path: '/about' },
  { title: 'Blog', path: '/blog' },
  { title: 'Membership', path: '/membership' },
  { title: 'References', path: '/references' },
]
