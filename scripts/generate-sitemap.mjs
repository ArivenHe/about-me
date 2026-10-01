import { writeFileSync } from 'node:fs'

const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')
if (siteUrl) {
  const origin = new URL(siteUrl)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin.href}</loc></url></urlset>\n`
  writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
  writeFileSync(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${origin.href}sitemap.xml\n`)
  console.log(`Generated sitemap for ${origin.href}`)
} else {
  console.log('SITE_URL not set; skipping deployment-specific sitemap.xml')
}
