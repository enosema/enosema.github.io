import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import matter from 'gray-matter'
import asciidoctor from '@asciidoctor/core'

const asciiDoc = asciidoctor()

const CONTENT_DIR = resolve(import.meta.dirname, '..', 'content')
const OUTPUT_DIR = resolve(import.meta.dirname, '..', 'src', 'content')
const SECTIONS = ['pages', 'posts', 'people']

export interface TocEntry {
  id: string
  title: string
  level: number
}

export interface ContentItem {
  title: string
  slug: string
  date: string | null
  categories: string[]
  authors: Array<{ name: string; email?: string }>
  excerpt: string
  toc: TocEntry[]
  body: string
  frontmatter: Record<string, unknown>
}

function extractToc(doc: any): TocEntry[] {
  const sections: TocEntry[] = []

  function walk(section: any) {
    sections.push({
      id: section.getId() || '',
      title: section.getTitle() || '',
      level: section.getLevel() || 2,
    })
    const children = section.getSections()
    if (children && children.length) {
      for (const child of children) {
        walk(child)
      }
    }
  }

  const topLevel = doc.getSections()
  if (topLevel && topLevel.length) {
    for (const s of topLevel) walk(s)
  }

  return sections
}

// Post URLs keep the Jekyll permalink shape /blog/<post-date>-<name>/, where
// the date comes from frontmatter (which overrides the filename date) and the
// name from the filename. Pages use the plain filename base.
function makeSlug(filename: string, date: string | null): string {
  const base = filename.replace(/\.adoc$/, '')
  if (!date) return base
  const name = base.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `${date.slice(0, 10)}-${name}`
}

function convertFile(filePath: string): ContentItem | null {
  const raw = readFileSync(filePath, 'utf-8')

  let frontmatterData: Record<string, unknown> = {}
  let contentBody = raw

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (fmMatch) {
    try {
      const parsed = matter(raw)
      frontmatterData = parsed.data || {}
      contentBody = parsed.content
    } catch {
      const end = raw.indexOf('---', 4)
      frontmatterData = {}
      contentBody = raw.slice(end + 3).trimStart()
    }
  }

  let html: string
  let title = (frontmatterData.title as string) || ''
  let toc: TocEntry[] = []

  try {
    const doc = asciiDoc.load(contentBody, {
      safe: 'safe',
      attributes: {
        'skip-front-matter': '',
        sectanchors: '',
        idprefix: '',
        idseparator: '-',
      },
    })

    if (!title) {
      title = doc.getTitle() || ''
    }

    toc = extractToc(doc)
    html = doc.convert().replace(/<img /g, '<img loading="lazy" ')
  } catch (err: any) {
    console.error(`  Error converting ${filePath}: ${err.message}`)
    html = `<p class="error">Error converting content: ${err.message}</p>`
  }

  // gray-matter parses unquoted YAML dates into Date objects
  const rawDate: string | Date | undefined = frontmatterData.date
  const date = rawDate
    ? rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate).slice(0, 10)
    : null
  const slug = makeSlug(basename(filePath), date)
  const rawCategories = frontmatterData.categories
  const categories = Array.isArray(rawCategories) ? rawCategories : rawCategories ? [rawCategories as string] : []
  const authors = (frontmatterData.authors as Array<{ name: string; email?: string }>) || []
  const excerpt = (frontmatterData.excerpt as string) || ''

  return {
    title,
    slug,
    date,
    categories,
    authors,
    excerpt,
    toc,
    body: html,
    frontmatter: frontmatterData,
  }
}

let total = 0
// Deterministic output: stale JSON from earlier runs must not leak into the build
rmSync(OUTPUT_DIR, { recursive: true, force: true })
for (const section of SECTIONS) {
  const sectionDir = join(CONTENT_DIR, section)
  const outputDir = join(OUTPUT_DIR, section)

  if (!existsSync(sectionDir)) {
    console.log(`  Section "${section}" not found, skipping.`)
    continue
  }

  mkdirSync(outputDir, { recursive: true })

  const files = readdirSync(sectionDir).filter((f) => f.endsWith('.adoc'))

  let count = 0
  for (const file of files) {
    const filePath = join(sectionDir, file)
    if (statSync(filePath).isDirectory()) continue

    const item = convertFile(filePath)
    if (!item) continue

    writeFileSync(join(outputDir, `${item.slug}.json`), JSON.stringify(item, null, 2))
    count++
    total++
    console.log(`  ✓ ${section}/${item.slug}`)
  }
  console.log(`  ${section}: ${count} file(s)`)
}

console.log(`Content build complete: ${total} file(s)`)
