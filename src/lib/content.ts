import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export interface Entry {
  title: string; date: string; link: string; description: string; seoTitle: string;
  featured: string; categories: string[]; form: string; body: string; html: string;
}

const dir = (d: string) => path.join(process.cwd(), 'src/content', d);

// Entries are Keystatic markdoc files: YAML frontmatter + markdown body.
// The importer writes frontmatter values as JSON strings, which are valid YAML.
function read(d: string): Entry[] {
  return fs.readdirSync(dir(d)).filter((f) => f.endsWith('.mdoc')).map((f) => {
    const raw = fs.readFileSync(path.join(dir(d), f), 'utf8');
    const [, fm, ...rest] = raw.split('---\n');
    const data: Record<string, any> = {};
    for (const line of fm.split('\n')) {
      const i = line.indexOf(': ');
      if (i > 0) data[line.slice(0, i)] = JSON.parse(line.slice(i + 2));
    }
    const body = rest.join('---\n').trim();
    return { categories: [], form: '', ...data, body, html: marked.parse(body, { async: false }) as string } as Entry;
  });
}

// Utility pages that belonged to WooCommerce / WP, or stale student-only pages.
const HIDE = new Set([
  '/cart/', '/checkout/', '/my-account/', '/test-page/', '/shop/', '/shop-2/',
  '/classes/16973-2/', '/classes/16973-2/drum-and-dance-2025/', '/classes/16973-2/drum-and-dance-2025/classes-february-to-april/',
]);

export const pages = () => read('pages').filter((p) => !HIDE.has(p.link));
export const posts = () => read('posts').sort((a, b) => b.date.localeCompare(a.date));
export interface Product {
  slug: string; name: string; category: string; visible: boolean; soldOut: boolean; price: string; salePrice: string;
  image: string; description: string; stripeUrl: string; options: { label: string; price: string; stripeUrl: string }[];
}
export const products = (): Product[] =>
  fs.readdirSync(dir('shop')).filter((f) => f.endsWith('.json')).map((f) => ({
    options: [], stripeUrl: '', ...JSON.parse(fs.readFileSync(path.join(dir('shop'), f), 'utf8')), slug: f.replace(/\.json$/, ''),
  }));
export const menu = () => {
  const m: { id: string; parent: string; title: string; url: string }[] = JSON.parse(fs.readFileSync(path.join(dir('.'), 'menu.json'), 'utf8'));
  const kids = (p: string) => m.filter((x) => x.parent === p && x.title && (!HIDE.has(x.url) || x.url === '/shop/'));
  return kids('0')
    .filter((x) => !x.url.startsWith('tel:'))
    .map((x) => ({ ...x, children: kids(x.id).filter((c) => !c.url.includes('#')) }));
};
