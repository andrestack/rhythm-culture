import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import fs from 'node:fs';

// Vercel matches a redirect like "/cart" exactly, so "/cart/" (how old WordPress links end) would 404.
// After the build, let every redirect also match with a trailing slash.
const redirectSlashes = {
  name: 'redirect-slashes',
  hooks: {
    'astro:build:done': () => {
      const file = new URL('./.vercel/output/config.json', import.meta.url);
      if (!fs.existsSync(file)) return;
      const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const r of cfg.routes) if (r.status >= 300 && r.status < 400 && r.src?.endsWith('$') && !r.src.endsWith('/?$')) r.src = r.src.replace(/\/?\$$/, '/?$');
      fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
    },
  },
};

// Site pages prerender to static HTML; only /keystatic (admin) and /api/form run on demand.
export default defineConfig({
  site: 'https://rhythmculture.com.au',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic(), redirectSlashes],
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  // Put the stylesheet in the page itself: one less file to wait for before the first paint.
  build: { inlineStylesheets: 'always' },
  // Redirects set up on WordPress (Redirection plugin), carried over 05/11/2026.
  redirects: {
    '/dundun-dance-classes': '/dance-classes/',
    '/teachers-2': '/about/',
    '/contact-us': '/contact-us-2/',
    '/more-workshops': '/workshops/',
    '/nathaniel-full-bio': '/about/',
    '/full-bio-bec': '/about/',
    '/more-artists': '/about/',
    '/school-kindergarten': '/school-incursions/',
    '/more-classes': '/classes/',
    '/classes-calender': '/classes/',
    '/bassidi-full-bio': '/about/',
    '/full-bio-amadou': '/about/',
    // Student video pages live behind a password at /classes/student-resources/ (src/pages/classes/student-resources).
    // The old WordPress page id URL points there too. Never redirect /classes/student-resources/ itself: redirects run before the page.
    ...Object.fromEntries(['', '/drum-and-dance-2025', '/drum-and-dance-2025/classes-february-to-april']
      .map((sub) => [`/classes/16973-2${sub}`, `/classes/student-resources${sub}/`])),
    '/product/12-class-pass-drum-dance-classes': '/shop/',
    // WooCommerce URLs that no longer exist.
    '/cart': '/shop/',
    '/checkout': '/shop/',
    '/my-account': '/',
    '/shop-2': '/shop/',
    // Old WordPress pages Nat agreed to drop (10/11/2026).
    '/test-page': '/',
    '/mobile-booking-page': '/booking-form/',
    '/mobile-booking-page-2': '/booking-form/',
    ...Object.fromEntries([
      'product-category/africandrums', 'product-category/camp-afro-foli', 'product-category/percussion',
      'product-category/rhythm-culture-drum-dance-classes', 'product-category/rhythm-culture-events',
      'product-category/school-drum-packages', 'product-category/vouchers-tuition', 'product-category/uncategorized',
      ...['african-drumming', 'african-instruments', 'camp-afro-foli', 'dance-class', 'dance-classes', 'dance-workshop', 'djembe',
        'djembe-drum', 'djembe-workshops', 'drum', 'drum-and-dance-retreat', 'drum-class', 'drum-for-sale', 'drum-hire',
        'drum-workshop', 'drumming-classes-sunshine-coast', 'drumming-workshop', 'music-lessons-sunshine-coast',
        'noosa-north-shore', 'percussion', 'percussion-package', 'sunshine-coast', 'whats-on'].map((t) => `product-tag/${t}`),
    ].map((path) => [`/${path}`, '/shop/'])),
  },
});
