import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// Site pages prerender to static HTML; only /keystatic (admin) and /api/form run on demand.
export default defineConfig({
  site: 'https://rhythmculture.com.au',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic()],
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  // WooCommerce URLs that no longer exist.
  redirects: {
    '/cart': '/shop/',
    '/checkout': '/shop/',
    '/my-account': '/',
    '/shop-2': '/shop/',
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
