import type { APIRoute } from 'astro'
import { getList } from '@/lib/content'
import { siteData } from '@/data/site'

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)
}

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(siteData.url)).toString()

  const items = getList('posts')
    .map((post) => {
      const link = `${base}blog/${post.slug}/`
      const parts = [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
      ]
      if (post.date) parts.push(`      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`)
      if (post.excerpt) parts.push(`      <description>${escapeXml(post.excerpt)}</description>`)
      parts.push('    </item>')
      return parts.join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteData.title)} — News</title>
    <link>${base}</link>
    <description>Announcements from ${escapeXml(siteData.legal.name)}</description>
    <language>en</language>
    <atom:link href="${base}rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
