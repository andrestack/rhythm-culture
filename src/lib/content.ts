import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdoc } from './markdoc';
import { load } from 'js-yaml';

export interface Entry {
  title: string; date: string; link: string; description: string; seoTitle: string;
  featured: string; categories: string[]; form: string; body: string; html: string;
}

const dir = (d: string) => path.join(process.cwd(), 'src/content', d);

// Entries are Keystatic markdoc files: YAML frontmatter + markdown body, parsed with js-yaml (the library
// Keystatic itself uses). Keystatic omits empty fields when it saves, so every field needs a default here.
const FRONTMATTER = /^---\n([\s\S]*?)\n?---\n?([\s\S]*)$/;

function read(d: string): Entry[] {
  return fs.readdirSync(dir(d)).filter((f) => f.endsWith('.mdoc')).map((f) => {
    const raw = fs.readFileSync(path.join(dir(d), f), 'utf8').replace(/\r\n?/g, '\n');
    const m = raw.match(FRONTMATTER);
    if (!m) throw new Error(`src/content/${d}/${f}: missing --- frontmatter block`);
    let data: Record<string, any>;
    try {
      data = (load(m[1]) as Record<string, any>) ?? {};
    } catch (err) {
      throw new Error(`src/content/${d}/${f}: frontmatter is not valid YAML. ${(err as Error).message}`);
    }
    const slug = f.replace(/\.mdoc$/, '');
    const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
    const body = m[2].trim();
    return {
      title: '', description: '', seoTitle: '', featured: '', form: '', categories: [],
      ...data,
      title: String(data.title ?? slug),
      link: data.link || `/${slug}/`, // new CMS entries without a URL path fall back to their file name
      date,
      body,
      html: renderMarkdoc(body, `src/content/${d}/${f}`),
    } as Entry;
  });
}

// Pages not built from the pages collection (/shop/ has its own route), or stale student-only pages.
const HIDE = new Set([
  '/shop/',
  '/classes/student-resources/', '/classes/student-resources/drum-and-dance-2025/', '/classes/student-resources/drum-and-dance-2025/classes-february-to-april/',
]);

// Pages sent to students after they sign up: they work, but stay out of Google.
export const NOINDEX = new Set(['/welcome/', '/level-up/', '/did-you-enjoy-your-class/', '/what-to-bring-what-to-expect/']);

export const pages = () => read('pages').filter((p) => !HIDE.has(p.link));
export const posts = () => read('posts').sort((a, b) => b.date.localeCompare(a.date));
export interface Product {
  slug: string; name: string; category: string; visible: boolean; soldOut: boolean; price: string; salePrice: string;
  image: string; description: string; stripeUrl: string; options: { label: string; price: string; stripeUrl: string }[];
}
export const products = (): Product[] =>
  fs.readdirSync(dir('shop')).filter((f) => f.endsWith('.json')).map((f) => ({
    // Keystatic drops empty fields on save, so default them all.
    name: '', category: '', visible: false, soldOut: false, price: '', salePrice: '', image: '', description: '', stripeUrl: '', options: [],
    ...JSON.parse(fs.readFileSync(path.join(dir('shop'), f), 'utf8')),
    slug: f.replace(/\.json$/, ''),
  }));
export const menu = () => {
  const m: { id: string; parent: string; title: string; url: string }[] = JSON.parse(fs.readFileSync(path.join(dir('.'), 'menu.json'), 'utf8'));
  const kids = (p: string) => m.filter((x) => x.parent === p && x.title && (!HIDE.has(x.url) || x.url === '/shop/'));
  return kids('0')
    .filter((x) => !x.url.startsWith('tel:'))
    .map((x) => ({ ...x, children: kids(x.id).filter((c) => !c.url.includes('#')) }));
};
