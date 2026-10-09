import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nAllow: /\nSitemap: ' + (process.env.CLIENT_PUBLIC_URL || 'http://localhost:5173') + '/sitemap.xml')
})

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_PUBLIC_URL || 'http://localhost:5173'

    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('slug'),
      supabase.from('products').select('slug, created_at'),
    ])

    const categories = catRes.data || []
    const products = prodRes.data || []

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`

    for (const c of categories) {
      xml += `  <url>\n    <loc>${baseUrl}/category/${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
    }

    for (const p of products) {
      xml += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <lastmod>${p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
    }

    xml += '</urlset>'

    res.type('application/xml')
    res.send(xml)
  } catch {
    res.status(500).send('Error generating sitemap')
  }
})

export default router
