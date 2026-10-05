export interface ContentData {
  title: string
  slug: string
  date: string | null
  categories: string[]
  authors: Array<{ name: string; email?: string }>
  excerpt: string
  toc: Array<{ id: string; title: string; level: number }>
  body: string
  frontmatter: Record<string, unknown>
}

const modules = import.meta.glob<{ default: ContentData }>('../content/*/*.json', { eager: true })

const sections = new Map<string, Map<string, ContentData>>()
for (const [path, mod] of Object.entries(modules)) {
  const parts = path.split('/')
  const section = parts[parts.length - 2]
  const slug = parts[parts.length - 1].replace('.json', '')
  if (!sections.has(section)) sections.set(section, new Map())
  sections.get(section)!.set(slug, mod.default)
}

export function getContent(section: string, slug: string): ContentData | null {
  return sections.get(section)?.get(slug) ?? null
}

export function getList(section: string): ContentData[] {
  const items = [...(sections.get(section)?.values() ?? [])]
  return items.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date)
    return (a.title ?? '').localeCompare(b.title ?? '')
  })
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
