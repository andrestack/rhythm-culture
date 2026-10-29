---
name: compress-images
description: Compress website images and optionally convert them to WebP, updating every reference. Use when asked to shrink, optimise, compress or convert images (jpg, png) to webp, when images are too big or slow the site down, or before committing newly added photos.
---

# Compress and convert images

Script: `.claude/skills/compress-images/compress.mjs` (needs `sharp`, already a dev dependency). Run from the project root. Images live in `public/media/`; new uploads from the CMS go in `public/media/cms/`.

## Usually: do this

1. Start with a dry run so you can say what will happen:
   ```bash
   node .claude/skills/compress-images/compress.mjs --dry-run
   ```
2. Ask the user which they want (default to the first if they just say "compress"):
   - **Compress only** keeps the file names and types, so nothing else changes. Safe.
   - **Convert to WebP** (`--webp`) is smaller again (usually 25 to 35 percent below a compressed JPEG) and every browser supports it. It renames files from `.jpg`/`.png` to `.webp` and rewrites all references in `src/` automatically.
3. Run it:
   ```bash
   node .claude/skills/compress-images/compress.mjs                    # compress in place
   node .claude/skills/compress-images/compress.mjs --webp             # convert to webp + fix references
   node .claude/skills/compress-images/compress.mjs public/media/cms   # only new uploads
   ```
4. `npm run build` and confirm it passes. Then tell the user the before/after size and how many files had references updated.

## Options

| Flag | Default | Meaning |
|---|---|---|
| `paths...` | `public/media` | Files or folders to process |
| `--webp` | off | Convert JPEG/PNG to WebP, delete the original, rewrite references |
| `--max-width` | 1920 | Resize anything wider than this (never enlarges) |
| `--quality` | 80 | 1 to 100. 75 for smaller files, 85 for photos that need to look perfect |
| `--refs` | `src` | Comma list of folders or files searched for references to rewrite (add `README.md` etc. if needed) |
| `--dry-run` | off | Report only, change nothing |

## What it does and does not do

- Only replaces a file when the result is smaller. Strips camera metadata (location, etc.) and applies the photo's rotation first.
- WebP conversion keeps the original if WebP would be larger.
- References are rewritten by exact path (`/media/2019/01/photo.jpg` becomes `/media/2019/01/photo.webp`). Images outside `public/` or referenced from outside the `--refs` folders (for example an email template or an external site) will break: tell the user if they link to site images from elsewhere.
- Compression is lossy and in place. Original photos are not kept in the repo, but Git history keeps earlier commits, so a mistake can be reverted with Git. Each compression pass on a JPEG or PNG loses a little detail, so run it once per image, not repeatedly. WebP files that are already small enough are skipped, so re-running `--webp` only touches new uploads.
- GIFs, SVGs and videos are left alone. Videos over about 20 MB should not go in the repo: use YouTube or Vimeo and embed.

## Good habits to suggest

- Photos from a phone are 3 to 8 MB. Run this before committing them.
- Give the user a one-line summary, for example "37 images, 142 MB down to 31 MB, build passes."
