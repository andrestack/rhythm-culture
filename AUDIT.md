# Audit, 29 Oct 2026

Final audit of the prototype at commit `ab91e80`, before the client demo. Each finding says how it was checked. **Verified** means reproduced during the audit, not inferred from reading the code. All test edits were reverted; the working tree is unchanged.

Method:
- fresh build (450 pages);
- crawled every built page for broken links and images;
- checked all 1,081 URLs in the live site's sitemaps against the build;
- saved a page, a post and a product through Keystatic and rebuilt;
- cloned the repo fresh on Windows;
- sent edge-case requests to `/api/form`;
- read the code.

---

## Blockers (fix before the demo): all four fixed, 29 Oct

| | Fix | Verified by |
|---|---|---|
| B1 | `src/lib/content.ts` parses frontmatter with js-yaml (the library Keystatic uses), normalises line endings, and defaults every field Keystatic may drop (`link` falls back to `/<filename>/`). All 458 content files were rewritten in Keystatic's own save format, and the importer now writes that format too. | Saved a page, a post and a product through Keystatic and rebuilt: build passes and the changes appear on the site. The page and product saves were one-line diffs. A post's body still gets reformatted by Keystatic on its first save (link-wrapped images unwrapped, whitespace); that is Keystatic's markdown serializer and is harmless. |
| B2 | `.gitattributes` forces LF on every OS (`* text=auto eol=lf`, images and fonts binary); the parser also tolerates CRLF. | Built with a content file converted to CRLF: it parsed. `git checkout` now writes LF on this Windows machine. |
| B3 | Removed `wpId` from the 44 product files and the importer. | Product opens in Keystatic, a price change saves as a one-line diff, and `/shop/` shows the new price. |
| B4 | The five booking terms, copied verbatim from the live Gravity Form, now render above the booking checkbox (`note` in `src/lib/forms.ts`), with the original wording "I have read and agree to the terms and conditions above". | Terms present in the built `/booking-form/` page. |

The original findings follow, unchanged.

### B1. Any Keystatic save of a page or post breaks the build. Verified.
- **Cause:** `src/lib/content.ts:17-21` reads frontmatter by splitting on `---\n` and running `JSON.parse` on each line. The importer writes JSON-quoted values (`title: "About"`), but Keystatic writes YAML: unquoted strings (`title: AFRO KIWI IN MALI`), quoted dates (`'2013-02-04'`) and block lists (`categories:\n  - OUR STORIES`). It also drops empty keys.
- **Reproduced:** one Keystatic save of a post, then `npm run build` failed with `Unexpected token 'A', "AFRO KIWI IN MALI" is not valid JSON`.
- **Fix:** parse frontmatter with a real YAML parser after normalising `\r\n`. Better still, read content with Keystatic's reader (`createReader` from `@keystatic/core/reader`) or an Astro content collection, so the site and the CMS share one parser.
- **Also:** push every content file through Keystatic's serializer once, so a client's first save gives a one-line diff instead of a 20-line reformat (the Team Beat lesson).

### B2. A fresh clone on Windows cannot build. Verified.
- **Cause:** `core.autocrlf=true` on Windows checks content out with CRLF line endings (`---\r\n`), and the same `split('---\n')` then finds no frontmatter.
- **Hidden on Vercel:** Vercel builds on Linux, so its builds pass. Andre's other laptop and a client using the desktop app on Windows would both get a broken local build.
- **Fix:** add `.gitattributes` with `* text=auto eol=lf`, run `git add --renormalize .`, and make the parser CRLF-tolerant (B1's fix covers that).

### B3. Shop products cannot be opened in Keystatic. Verified.
- **Symptom:** every product shows `Field validation failed: Key on object value "wpId" is not allowed`. The importer writes `wpId` (`scripts/import-wp.mjs:203`), but the CMS schema doesn't define it.
- **Verified:** with `wpId` removed from one product, the editor opened, a price change saved, the build passed and `/shop/` showed the new price.
- **Fix:** remove `wpId` from the 44 JSON files and the importer.

### B4. The booking form asks clients to accept terms the page no longer shows.
- The booking page says "Please read the terms and conditions at the end of the form", and the new checkbox says "I accept the booking terms and conditions above". The terms (starting "1. All invoices must be paid within 14 days…") lived inside the Gravity Form, and the importer doesn't read forms.
- **Fix:** copy the terms from the live booking form into the page body, or into the form definition, before launch.

---

## High: visible on the live site or losing SEO

### H1. 624 old URLs will return 404. Verified against the live sitemaps.
- Posts, products and pages are all covered, but these archive pages aren't:
  - 31 category archives (`/category/*`);
  - 592 tag archives (`/tag/*`);
  - the author archive (`/author/rhythmcu/`).
- The RSS feed (`/feed/`) is missing too.
- **Fix:**
  - Build real `/category/<slug>/` archive pages, since posts already carry their categories.
  - 301 `/tag/*`, `/author/*` and `/feed/` to `/blog/`, or add an RSS feed at `/feed/` with `@astrojs/rss`.
  - Astro rejects dynamic redirect patterns, so either generate the 592 tag redirects from the export, as was done for product tags, or use Vercel pattern redirects (check that they apply with the Astro adapter).

### H2. WordPress plugin shortcodes show as raw text. Verified.
- These appear on the homepage, the class pages, `/more-classes/` and `/classes-calender/`:
  - `[instagram-feed feed=2]` (5 pages);
  - `[custom-facebook-feed feed=1]`;
  - `[eventCalendar]`;
  - `[elfsight_instagram_feed …]` (2);
  - `[new_royalslider id="2"]`.
- **Fix:** strip unknown `[shortcode]` tags in the importer, then decide per page what replaces them: an Instagram link, an events list, or nothing.

### H3. 67 images on 9 posts still load from WordPress's image CDN. Verified.
- URLs like `https://i1.wp.com/rhythmculture.com.au/wp-content/uploads/…` weren't recognised as uploads (`scripts/import-wp.mjs:60` only matches the bare domain), so they were never downloaded. They break when WordPress is switched off.
- **Fix:** match `i[0-2].wp.com/rhythmculture.com.au/…` in `local()`, then download and rewrite.

### H4. Content that Divi stored in module settings was lost, beyond plain layout loss.
Counted from the export (published pages only):
- **Testimonials:** 17, on `/team-building/`, `/vacation-care/`, `/early-learning-and-kindergarten-incursions/` and `/drum-sing-dance-program/`. The quotes survive, but the author names don't.
- **Slides:** 47, on `/about/`, `/school-incursions/`, `/workshops/` and `/rhythm-culture-under-8s/`. Their headings, buttons and images are gone.
- **Blurbs:** 22, on 5 pages including the homepage. Their titles and icons or images are gone.
- **Full-width images:** 11, on 7 pages including both contact pages. Gone entirely.
- **Call-to-action boxes:** 3 on the homepage. Their titles and buttons are gone.
- **Blog feed modules** on the homepage, `/blog/` and `/vacation-care/` are gone. The homepage has no "latest posts" section any more.

These are mostly the sales pages. **Fix:** extend `divi()` to read `heading`, `title`, `author`, `button_text`/`button_url`, `image` and `src` from these modules, then re-import with `--force` before any client edits. Otherwise, fix these pages by hand.

---

## Medium

- **M1. A new CMS entry can crash the build.** If an editor leaves "URL path" or "Date" empty, Keystatic omits the key:
  - `e.link.replace` (`src/pages/[...slug].astro:11`) throws on the missing `link`;
  - `b.date.localeCompare` (`src/lib/content.ts:35`) throws on the missing `date`.

  A typed date like "20 Jan" sorts wrongly. **Fix:**
  - default `link` to `/<filename>/`;
  - make it required, with a `^/[a-z0-9-/]+/$` pattern;
  - use `fields.date` for the date.
- **M2. Keystatic in GitHub mode commits straight to `main`.** That deploys to production with no preview, which contradicts the "preview, then publish" story in the README and skills. And once branch protection is on (recommended), those saves fail. **Fix:** set `branchPrefix` in the GitHub storage config so edits go on branches with PRs, or decide that Keystatic text edits go live directly and document that.
- **M3. Without JavaScript, the forms send personal data in the URL.**
  - `<form>` (`src/components/Form.astro:7`) has no `method` or `action`, so a no-JS submit becomes a GET to the same page.
  - Names, emails and phone numbers end up in the address bar and server logs, the page reloads, and nothing is sent.
  - **Fix:** `method="post" action="/api/form"`, and let the API accept form-encoded bodies and redirect to a thank-you page.
- **M4. `/api/form` returns 500 for `Origin: null`. Verified.** `new URL(origin)` throws (`src/pages/api/form.ts:23`); privacy tools and sandboxed frames send `null`. **Fix:** wrap it in a try and treat a bad origin as 403.
- **M5. The n8n webhook has no authentication.** Anyone who learns its URL can post to it directly and skip the zod checks. **Fix:** send a shared secret header (`FORM_WEBHOOK_SECRET`) and check it in n8n.
- **M6. 107 broken internal links.** They are mostly old WordPress attachment pages (`/post-name/dsc01984/`), old product slugs (`/product/kids-drum-class/`) and retired pages (`/afro-foli-festival/`, `/kindergarten-program/`). **Fix:** in the importer, unwrap links around images that point to attachment pages (Keystatic already does this when it saves). Redirect or unlink the rest.
- **M7. 33 product descriptions show a literal `\n`.** The WooCommerce CSV escapes line breaks, so the shop shows "…4 weeks. \n \nThis pass…". **Fix:** replace `\\n` with real newlines in the importer, then re-import the shop.
- **M8. Old "Student Video Resources" pages have no redirect.** `/classes/16973-2/…` was hidden on purpose but now 404s. **Fix:** redirect it to `/classes/`.

## Low and improvements

- **Accessibility:**
  - 620 of 1,327 images have no alt text.
  - The green headings (`#7cda24`) on white have about a 1.7:1 contrast ratio. They fail WCAG even for large text. The colour is inherited from the old site.
  - The mobile menu button has no `aria-expanded`.
  - Pages often have two `<h1>`s.
- **Performance:**
  - Open Sans loads via a render-blocking Google Fonts `@import` (`src/styles/global.css:1`); self-host it (`@fontsource/open-sans`).
  - Content images have no `width`/`height` (layout shift) and no `loading="lazy"`.
  - `/blog/` lists all 358 posts on one page.
  - The form script is 86 KB, mostly zod; `zod/mini` would cut that.
- **SEO basics still missing:** sitemap (`@astrojs/sitemap`), `robots.txt`, a 404 page, favicon, Open Graph tags. Product pages use raw markdown as their meta description.
- **Old content quirks:**
  - 5 links start with `http://http://`.
  - 4 links point at `http://www.rhythmculture.com.au` (harmless, but could be relative).
- **Repo hygiene:**
  - `reference/products.csv` includes 24 `sfw_pwd` values (anti-spam plugin tokens); drop that column.
  - `@types/turndown` belongs in devDependencies.
  - The nav (`menu.json`) can't be edited in the CMS; a Keystatic singleton would fix that.
- **Rate limiter:** the in-memory map never forgets old IP addresses, which only matters on a long-lived instance.

## Checked and fine

- No public page loads JavaScript except form pages; CSS is inlined.
- Every post, product and page URL from the live sitemaps resolves, apart from the two hidden pages in M8.
- Pages with embedded YouTube or Facebook iframes keep them through a Keystatic save.
- Product prices save from Keystatic and rebuild correctly, once B3 is fixed.
- Form API: validation errors, the honeypot, wrong content type, a foreign origin and the missing webhook all behave as intended (tested earlier).
- No secrets in the repo. The WordPress export with customer orders is git-ignored.
- The importer guard works (tested earlier).

## Suggested order

1. B1 + B2 (one parser change, plus `.gitattributes`), then B3, then a normalisation pass through Keystatic.
2. B4, H2, H3, M7 (importer fixes, then `npm run import -- --force` while no client edits exist yet).
3. H4 sales pages, by importer or by hand.
4. H1 redirects and category pages, M1, M2, M3 to M5.
5. The rest as polish before cutover.
