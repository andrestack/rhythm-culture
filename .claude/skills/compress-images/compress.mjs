#!/usr/bin/env node
// Compress images in place and optionally convert them to WebP, fixing every reference in the site.
//
//   node compress.mjs [paths...] [--webp] [--max-width 1920] [--quality 80] [--dry-run] [--refs src,README.md]
//
// paths      files or folders (default: public/media). Run from the project root.
// --webp     write .webp next to each JPEG/PNG, delete the original, and rewrite references to it
//            in the --refs locations (default: src). Needs the image to live under public/.
// --dry-run  report what would happen, change nothing.
// Only replaces a file when the result is smaller. Needs `sharp` installed in the project.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const valueFlags = new Set(['--max-width', '--quality', '--refs']);
const targets = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));

const WEBP = flag('--webp');
const DRY = flag('--dry-run');
const MAX_W = Number(opt('--max-width', 1920));
const Q = Number(opt('--quality', 80));
const REFS = opt('--refs', 'src').split(',');
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');

const walk = (p, out = []) => {
  if (!fs.existsSync(p)) return out;
  if (fs.statSync(p).isFile()) { out.push(p); return out; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) walk(path.join(p, e.name), out);
  return out;
};
const files = (targets.length ? targets : ['public/media']).flatMap((t) => walk(path.resolve(t)))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

const rename = new Map(); // "/media/x.jpg" -> "/media/x.webp"
let before = 0, after = 0, changed = 0;
const failed = [];
const queue = [...files];

const worker = async () => {
  while (queue.length) {
    const f = queue.pop();
    try {
      const buf = fs.readFileSync(f);
      before += buf.length;
      const isWebp = /\.webp$/i.test(f);
      let img = sharp(buf, { failOn: 'none' }).rotate(); // bake in EXIF orientation, strip metadata
      const { width } = await img.metadata();
      if (isWebp && width <= MAX_W) { after += buf.length; continue; } // already WebP and small enough: re-encoding only loses quality
      if (width > MAX_W) img = img.resize({ width: MAX_W });

      if (WEBP && !isWebp) {
        const out = await img.webp({ quality: Q, effort: 5 }).toBuffer();
        if (out.length >= buf.length) { after += buf.length; continue; } // webp would not help; keep original
        const dest = f.replace(/\.[a-z]+$/i, '.webp');
        if (!DRY) { fs.writeFileSync(dest, out); fs.unlinkSync(f); }
        const rel = path.relative(PUBLIC, f);
        if (!rel.startsWith('..')) rename.set('/' + rel.split(path.sep).join('/'), '/' + path.relative(PUBLIC, dest).split(path.sep).join('/'));
        after += out.length; changed++;
        continue;
      }
      const out = isWebp ? await img.webp({ quality: Q }).toBuffer()
        : /\.png$/i.test(f) ? await img.png({ compressionLevel: 9, effort: 10 }).toBuffer()
        : await img.jpeg({ quality: Q, mozjpeg: true }).toBuffer();
      if (out.length < buf.length) { if (!DRY) fs.writeFileSync(f, out); after += out.length; changed++; }
      else after += buf.length;
    } catch (e) { failed.push(`${f}: ${e.message}`); }
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

// Point every reference at the new .webp file.
let rewrites = 0;
if (WEBP && rename.size) {
  const TEXT = /\.(astro|md|mdoc|mdx|json|ts|tsx|js|mjs|css|html|yaml|yml)$/i;
  const refFiles = REFS.flatMap((r) => walk(path.resolve(r))).filter((f) => TEXT.test(f) && !f.includes('node_modules'));
  for (const rf of refFiles) {
    let s = fs.readFileSync(rf, 'utf8');
    let t = s;
    for (const [from, to] of rename) t = t.split(from).join(to);
    if (t !== s) { rewrites++; if (!DRY) fs.writeFileSync(rf, t); }
  }
}

const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
console.log(`${DRY ? '[dry run] ' : ''}${files.length} images, ${changed} ${WEBP ? 'converted/shrunk' : 'shrunk'}: ${mb(before)} -> ${mb(after)}`);
if (WEBP) console.log(`${rename.size} converted to .webp, ${rewrites} files had references updated`);
if (failed.length) console.log('failed:\n' + failed.join('\n'));
