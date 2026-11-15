import type { APIRoute } from 'astro';
import { pages, posts, products, NOINDEX } from '../lib/content';

// Built from the same content as the site, so new pages, posts and products appear here automatically.
// Left out: pages kept out of Google (NOINDEX), thank-you pages, hidden products and the student video pages (not in pages()).
const SKIP = (link: string) => NOINDEX.has(link) || link.startsWith('/thank-you');

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const entries: { loc: string; lastmod?: string }[] = [
    { loc: url('/') },
    { loc: url('/blog/') },
    { loc: url('/shop/') },
    ...pages().filter((p) => p.link !== '/' && p.link !== '/blog/' && !SKIP(p.link)).map((p) => ({ loc: url(p.link) })),
    ...posts().map((p) => ({ loc: url(p.link), lastmod: p.date })),
    ...products().filter((p) => p.visible).map((p) => ({ loc: url(`/product/${p.slug}/`) })),
  ];
  const seen = new Set<string>();
  const body = entries
    .filter((e) => !seen.has(e.loc) && seen.add(e.loc))
    .map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
