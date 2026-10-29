// Imports the WordPress WXR export into src/content and downloads referenced images.
//   node scripts/import-wp.mjs            -> content only
//   node scripts/import-wp.mjs --images   -> content + download images to public/media
// Deliberately ignores shop_order / shop_coupon (customer data) and Divi layout library items.
//
// ONE-TIME MIGRATION TOOL. The files it writes are the same files the site owner edits in the CMS afterwards.
// Guardrails:
//   - By default it only CREATES files that do not exist yet; anything already in src/content is left untouched.
//   - --force overwrites existing files, and refuses to run unless src/content has no uncommitted changes
//     (so every overwrite can be undone with git).
// Post-launch todo: delete this script, its npm scripts and reference/wp-export.xml.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import TurndownService from 'turndown';
import { dump } from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const XML = path.join(ROOT, 'reference/wp-export.xml');
const OUT = path.join(ROOT, 'src/content');
const MEDIA = path.join(ROOT, 'public/media');
const ORIGIN = 'https://rhythmculture.com.au';
const DL = process.argv.includes('--images');
const FORCE = process.argv.includes('--force');

if (FORCE) {
  let dirty;
  try {
    dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/content'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    console.error('--force needs a git repository so overwritten content can be restored. Aborting.');
    process.exit(1);
  }
  if (dirty) {
    console.error('--force refused: src/content has uncommitted changes. Commit or stash them first, so nothing is lost.\n' + dirty);
    process.exit(1);
  }
  console.warn('--force: overwriting existing pages, posts, products and menu from the WordPress export. Undo with git.');
}
let kept = 0; // existing files left untouched

const xml = fs.readFileSync(XML, 'utf8');
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
const tag = (s, t) => {
  const m = s.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`));
  return m ? m[1] : '';
};
const meta = (s, key) => {
  for (const m of s.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)) {
    if (tag(m[1], 'wp:meta_key') === key) return tag(m[1], 'wp:meta_value');
  }
  return '';
};
const cats = (s) =>
  [...s.matchAll(/<category domain="(category|post_tag)" nicename="[^"]*"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map((m) => m[2]);

const attachments = new Map(); // id -> url
for (const i of items) if (tag(i, 'wp:post_type') === 'attachment') attachments.set(tag(i, 'wp:post_id'), tag(i, 'wp:attachment_url'));

const images = new Set();
const isUpload = (u) => /^https?:\/\/(www\.)?rhythmculture\.com\.au\/wp-content\/uploads\//i.test(u);
// "-300x200.jpg" -> original, when the original is a known attachment
const known = new Set([...attachments.values()]);
const unsize = (u) => {
  const o = u.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
  return known.has(o) ? o : u;
};
const local = (u) => {
  u = unsize(u);
  if (!isUpload(u)) return u;
  images.add(u);
  return '/media/' + u.split('/wp-content/uploads/')[1];
};

const attr = (s, name) => {
  const m = s.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? m[1] : '';
};

// Divi shortcodes -> plain semantic HTML. Layout attributes are dropped on purpose.
function divi(src) {
  // Divi stores per-device variants as separate sections; drop the ones hidden on desktop (disabled_on = phone|tablet|desktop).
  let s = src.replace(/\[et_pb_section([^\]]*)\][\s\S]*?\[\/et_pb_section\]/g, (m, a) => (/disabled_on="[^"|]*\|[^"|]*\|on"/.test(a) ? '' : m));
  // modules that carry an image / link / video as an attribute
  s = s.replace(/\[et_pb_image\b([^\]]*)\](?:\[\/et_pb_image\])?/g, (_, a) => (attr(a, 'src') ? `<img src="${attr(a, 'src')}" alt="${attr(a, 'alt')}">` : ''));
  s = s.replace(/\[et_pb_button\b([^\]]*)\](?:\[\/et_pb_button\])?/g, (_, a) =>
    attr(a, 'button_url') ? `<p><a class="btn" href="${attr(a, 'button_url')}">${attr(a, 'button_text')}</a></p>` : '');
  s = s.replace(/\[et_pb_video\b([^\]]*)\](?:\[\/et_pb_video\])?/g, (_, a) => (attr(a, 'src') ? `<p><a href="${attr(a, 'src')}">${attr(a, 'src')}</a></p>` : ''));
  s = s.replace(/\[et_pb_(?:fullwidth_)?header\b([^\]]*)\]([\s\S]*?)\[\/et_pb_(?:fullwidth_)?header\]/g, (_, a, b) =>
    (attr(a, 'title') ? `<h1>${attr(a, 'title')}</h1>` : '') + (attr(a, 'subhead') ? `<p>${attr(a, 'subhead')}</p>` : '') + b);
  // section background images become a leading <img> (kept as content, editable in the CMS)
  s = s.replace(/\[et_pb_section\b([^\]]*)\]/g, (_, a) =>
    attr(a, 'background_image') ? `<div><img src="${attr(a, 'background_image')}" alt="">` : '<div>');
  s = s.replace(/\[et_pb_(?:row|column)\b([^\]]*)\]/g, '<div>');
  s = s.replace(/\[\/et_pb_(?:section|row|column)\]/g, '</div>');
  // everything else: drop the tags, keep inner text (text modules hold the real HTML)
  s = s.replace(/\[\/?et_pb_[a-z_]+\b[^\]]*\]/g, '');
  s = s.replace(/\[\/?(?:caption|gallery|embed|vc_[a-z_]+)\b[^\]]*\]/g, '');
  return s;
}

function clean(html) {
  let s = divi(html || '');
  s = s.replace(/<div>\s*<\/div>/g, '').replace(/<div>\s*<\/div>/g, '');
  // rewrite upload URLs in src / href / data-bg / srcset to local paths
  s = s.replace(/(src|href|data-bg)="(https?:\/\/[^"]+)"/g, (_, k, u) => `${k}="${local(u)}"`);
  s = s.replace(/\s(srcset|sizes)="[^"]*"/g, '');
  s = s.replace(/https?:\/\/(www\.)?rhythmculture\.com\.au\//g, '/');
  // Divi repeats the page title per device/section: keep the first <h1> of each distinct text.
  const h1s = new Set();
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g, (m, t) => {
    const k = t.replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (h1s.has(k)) return '';
    h1s.add(k);
    return m;
  });
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.keep(['iframe']);
td.addRule('drop-empty-links', { filter: (n) => n.nodeName === 'A' && !n.textContent.trim() && !n.querySelector('img'), replacement: () => '' });
const md = (html) => td.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
const FORMS = { 1: 'contact', 17: 'quote', 27: 'booking', 5: 'camp' };

// Files are written exactly the way Keystatic saves them (js-yaml dump, schema key order, empty strings
// left out, JSON with 2-space indent + newline), so a client's first CMS save only shows their own change.
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined));
function write(dir, slug, front, body) {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  const file = path.join(OUT, dir, `${slug}.mdoc`);
  if (fs.existsSync(file) && !FORCE) { kept++; return false; }
  fs.writeFileSync(file, `---\n${dump(compact(front))}---\n${body}\n`);
  return true;
}

const stats = { page: 0, post: 0, product: 0, skippedDraft: 0 };
const seen = new Set();
for (const i of items) {
  const type = tag(i, 'wp:post_type');
  if (!['page', 'post'].includes(type)) continue;
  if (tag(i, 'wp:status') !== 'publish') { stats.skippedDraft++; continue; }
  let slug = tag(i, 'wp:post_name') || tag(i, 'wp:post_id');
  const key = type + slug;
  if (seen.has(key)) slug += '-' + tag(i, 'wp:post_id');
  seen.add(type + slug);
  const thumb = attachments.get(meta(i, '_thumbnail_id'));
  const content = tag(i, 'content:encoded');
  const formId = content.match(/\[gravityform[^\]]*\bid="(\d+)"/)?.[1];
  // Key order = keystatic.config.ts schema order.
  const front = {
    title: tag(i, 'title'),
    link: tag(i, 'link').replace(ORIGIN, ''),
    seoTitle: meta(i, '_yoast_wpseo_title'),
    description: meta(i, '_yoast_wpseo_metadesc'),
    featured: thumb ? local(thumb) : '',
    date: tag(i, 'wp:post_date').slice(0, 10),
    ...(type === 'post' ? { categories: cats(i) } : { form: FORMS[formId] ?? '' }),
  };
  if (write(type === 'post' ? 'posts' : 'pages', slug, front, md(clean(content.replace(/\[gravityform[^\]]*\]/g, ''))))) stats[type]++;
}

const byId = new Map(items.map((i) => [tag(i, 'wp:post_id'), { title: tag(i, 'title'), link: tag(i, 'link').replace(ORIGIN, '') }]));
// Products: the CSV is cleaner than the XML. Variations fold into their parent as `options`.
// Output is one JSON file per product in src/content/shop (a Keystatic collection). Re-running the import
// never overwrites an existing file's stripeUrl / visibility / options, so CMS edits survive.
function parseCsv(t) {
  const rows = []; let row = [], f = '', inQ = false;
  t = t.replace(/^﻿/, '');
  for (let k = 0; k < t.length; k++) {
    const c = t[k];
    if (inQ) { if (c === '"') { if (t[k + 1] === '"') { f += '"'; k++; } else inQ = false; } else f += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const rows = parseCsv(fs.readFileSync(path.join(ROOT, 'reference/products.csv'), 'utf8'));
const head = rows[0];
const recs = rows.slice(1).filter((r) => r.length > 5).map((r) => Object.fromEntries(head.map((h, n) => [h, r[n] ?? ''])));
const isVar = (r) => r.Type.startsWith('variation');
const variations = recs.filter(isVar);
const slugOf = (s) => s.toLowerCase().replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const shopDir = path.join(OUT, 'shop');
fs.mkdirSync(shopDir, { recursive: true });
const usedSlugs = new Set();
let shopCount = 0;
for (const p of recs.filter((r) => !isVar(r) && r.Published === '1')) {
  const wp = byId.get(p.ID);
  let slug = (wp?.link.match(/\/product\/([^/]+)\//)?.[1]) || slugOf(p.Name);
  if (usedSlugs.has(slug)) slug += '-' + p.ID;
  usedSlugs.add(slug);
  const file = path.join(shopDir, `${slug}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const options = variations.filter((v) => v.Parent === `id:${p.ID}`).map((v) => ({
    label: (v['Attribute 1 value(s)'] || v.Name.replace(p.Name, '').replace(/^[\s-]+/, '')).trim(),
    price: v['Regular price'] || '', stripeUrl: '',
  }));
  const price = p['Sale price'] || p['Regular price'] || '';
  const visible = p['In stock?'] === '1' && !/Camp Afro Foli/.test(p.Categories) && (Number(price) > 0 || options.length > 0);
  const rec = { // key order = keystatic.config.ts schema order
    name: p.Name.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(),
    visible: prev ? prev.visible : visible,
    soldOut: p['In stock?'] !== '1',
    category: p.Categories.split(',')[0].trim(),
    price: p['Regular price'] || '',
    salePrice: p['Sale price'] || '',
    image: p.Images.split(',').map((x) => x.trim()).filter(Boolean).map(local)[0] ?? '',
    description: md(clean(p['Short description'] || p.Description)),
    stripeUrl: prev?.stripeUrl ?? '',
    options: prev?.options?.length ? prev.options : options,
  };
  if (prev && !FORCE) { kept++; continue; }
  fs.writeFileSync(file, JSON.stringify(compact(rec), null, 2) + '\n');
  shopCount++;
}
stats.product = shopCount;
fs.rmSync(path.join(OUT, 'products.json'), { force: true });

// Menu, for rebuilding the nav. Items linking to a page/post have no title or url of their own.
const menu = items.filter((i) => tag(i, 'wp:post_type') === 'nav_menu_item' && tag(i, 'wp:status') === 'publish').map((i) => {
  const ref = byId.get(meta(i, '_menu_item_object_id'));
  return {
    id: tag(i, 'wp:post_id'), parent: meta(i, '_menu_item_menu_item_parent'), order: +tag(i, 'wp:menu_order'),
    title: tag(i, 'title') || ref?.title || '', url: meta(i, '_menu_item_url').replace(ORIGIN, '') || ref?.link || '',
  };
}).sort((a, b) => a.order - b.order);
if (fs.existsSync(path.join(OUT, 'menu.json')) && !FORCE) kept++;
else fs.writeFileSync(path.join(OUT, 'menu.json'), JSON.stringify(menu, null, 2));

fs.writeFileSync(path.join(ROOT, 'reference/image-list.txt'), [...images].sort().join('\n'));
console.log('created/updated:', stats, 'unique images referenced:', images.size);
if (kept) console.log(`${kept} existing file(s) left untouched. Use --force to overwrite them (needs a clean git tree).`);

if (DL) {
  const list = [...images];
  let done = 0, failed = [];
  const worker = async () => {
    while (list.length) {
      const u = list.pop();
      if (/[.](mp4|mov)$/i.test(u)) continue; // videos are not hosted in the repo (only hidden student pages linked them)
      const dest = path.join(MEDIA, u.split('/wp-content/uploads/')[1]);
      if (fs.existsSync(dest)) { done++; continue; }
      try {
        const r = await fetch(u);
        if (!r.ok) throw new Error(r.status);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
        done++;
      } catch (e) { failed.push(`${u} ${e.message}`); }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  fs.writeFileSync(path.join(ROOT, 'reference/image-failures.txt'), failed.join('\n'));
  console.log(`images downloaded/present: ${done}, failed: ${failed.length}`);
}
