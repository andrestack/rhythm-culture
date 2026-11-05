# Rhythm Culture: Astro rebuild

Rebuild of rhythmculture.com.au (WordPress + Divi + WooCommerce) as Astro 7 + Keystatic on Vercel.
Started 2026-10-29. Source: a WordPress export (XML) and a WooCommerce product CSV, plus images scraped from the live site.

**Status: working prototype, not launched.** `AUDIT.md` (29 Oct) lists what is left before launch; its four blockers are fixed. It builds (about 450 static pages) and the main flows run locally. Code is on GitHub (andrestack/rhythm-culture); nothing is deployed and no DNS has been touched.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321, CMS at /keystatic
npm run build      # static output + 2 on-demand routes (/keystatic, /api/form)
```

Node 24 was used. Copy `.env.example` to `.env` and set `FORM_WEBHOOK_URL` to try forms end to end.

---

## What has been done

| Area | State |
|---|---|
| **Content import** | 56 pages, 358 posts, 44 products imported by `scripts/import-wp.mjs`. Drafts, orders, coupons and Divi layout-library items are skipped. |
| **URLs** | Every page and post keeps its old WordPress address (`link` in each file). Products keep `/product/<slug>/`. |
| **Body content** | Divi shortcodes were flattened to plain markdown. Text, headings, links and images survive. **Divi column and grid layouts do not**, so image grids and hero sections now read as images in a text flow. |
| **Look** | Original logo, green `#7cda24` / red `#e02b20` palette, Assegai display font, Open Sans, dropdown nav built from the WP menu, dark footer. Styles are in `src/styles/global.css`. |
| **Images** | 636 of 644 referenced images downloaded to `public/media/` and compressed (110 MB total). 8 returned 403 and are listed in `reference/image-failures.txt` (old 2012/2017 files). |
| **Forms** | The 4 Gravity Forms (contact, quick quote, event booking, Camp Afro Foli registration) are rebuilt. See *Forms* below. |
| **CMS** | Keystatic at `/keystatic` edits Pages, Blog posts and Shop products. |
| **Shop** | `/shop/` lists 30 visible products by category; every product has a page. Buy buttons are Stripe Payment Links once you paste them in. Until then they say "Enquire". |
| **Redirects** | Old `/cart`, `/checkout`, `/shop-2`, `/my-account` and all old `/product-category/*` and `/product-tag/*` URLs redirect (see `astro.config.mjs`). |

### Deliberately left out

- WooCommerce orders and customers (the export contains 678 orders with customer data; they are not imported and `reference/wp-export.xml` is git-ignored. **Delete that file when the migration is finished.**)
- Cart, checkout, accounts. Stripe Payment Links replace them.
- Student Video Resources pages (stale, Andre said not needed).
- Instagram and Facebook feeds, the events calendar plugin, popups, Mailchimp for WooCommerce.
- Camp Afro Foli products (hidden by default; they look like past events).
- Gravity Forms entry history.

---

## Project map

```
scripts/import-wp.mjs     WP export -> src/content (one-time migration tool, guarded: see "Re-running the import")
.agents/skills/           rhythm-culture-cms (client editing guide) and compress-images (+ compress.mjs, run via `npm run compress`). Edit skills here only.
.claude/skills/           generated copy of .agents/skills for Claude Code (scripts/sync-skills.mjs, runs before every build)
docs/editing-guide.html   client guide: how editing works (diagram) and when to call André; open in a browser
src/content/pages/*.mdoc  pages (markdown + YAML frontmatter)
src/content/posts/*.mdoc  blog posts
src/content/shop/*.json   one file per product
src/content/menu.json     nav source
src/lib/content.ts        reads content; HIDE list = WP utility pages not rendered
src/lib/forms.ts          form field definitions (the one place to add or change a form)
src/lib/formSchema.ts     zod schemas generated from forms.ts
src/pages/api/form.ts     server-side form handler
src/pages/[...slug].astro all pages and posts, by their old URL
src/pages/shop.astro, product/[slug].astro, blog.astro, index.astro
keystatic.config.ts       CMS schema
reference/                original exports (products.csv, wp-export.xml (git-ignored), image lists)
```

---

## Forms

- One field list per form in `src/lib/forms.ts`. **Every form uses zod**: schemas are generated from that list in `src/lib/formSchema.ts`, run in the browser for inline errors, and run again on the server in `/api/form`. Browser checks alone are never trusted.
- `/api/form` also checks a honeypot (returns a fake "ok", forwards nothing), same-origin, JSON content type, body size, and rate-limits to 5 per 10 minutes per address (in-memory per serverless instance: it slows one bot, it is not a hard cap).
- Valid submissions are forwarded as JSON to `FORM_WEBHOOK_URL` (server-only env var, never prefix with `PUBLIC_`). Payload: `{ formType, subject, page, submittedAt, data }`.
- A page shows a form through its **Form shown under the content** setting in the CMS (`form:` in frontmatter: `contact`, `quote`, `booking`, `camp`).
- Without `FORM_WEBHOOK_URL` the API returns 503 and the form tells the visitor to call.

---

## Work in progress: homepage redesign (5 Nov 2026)

On branch `update/homepage-redesign`, not built yet. The owner chose the **"Big Beat"** direction (big hero photo, four audience photo tiles **with clear space between them**, dark strip of cities). Everything needed to continue:

- Design notes and open questions: `docs/superpowers/specs/2026-11-05-homepage-redesign-design.md`
- Mockups of all three directions (A is the chosen one): `docs/mockups/homepage-directions.html`

To pick it up on another computer:

```bash
git fetch
git switch update/homepage-redesign
npm install
npm run dev
```

Then ask the assistant to "continue the homepage redesign from the design notes".

**Node version gotcha:** the site needs Node 24 (`.nvmrc`); Astro refuses anything below 22.23.4. On Andre's Mac the app's preview button picked up an older Node bundled with another tool (`~/.local/bin/node`, from Hermes) and crashed. The workaround was to start the site in a terminal with Node 24 first on the PATH and point the preview at `http://127.0.0.1:4321/`. Check `node -v` before starting.

---

## Next steps, in order

1. **Repo.** Create the GitHub repo (`https://github.com/andrestack/rhythm-culture`; the CMS config already points at it). Before the first commit check size: `public/media` is now about 110 MB after `npm run compress`. `node_modules`, `dist`, `.vercel`, `.env` and `reference/wp-export.xml` are already git-ignored.
2. **Vercel project.** Import the repo. Set `FORM_WEBHOOK_URL`. Note: Vercel Hobby blocks deploys of private repos when the commit author is not the owner and is non-commercial only, so a client site wants Pro (see the harness section).
3. **Keystatic on GitHub.** Create the Keystatic GitHub App and add its env vars on Vercel (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`). Until then `/keystatic` works locally only (`PUBLIC_KEYSTATIC_STORAGE=local|github` overrides the default).
4. **n8n form webhook. Built 30 Oct 2026** on n8n.hinterlandweb.cloud: `Rhythm Culture — Website Forms` (`UYDm46oXvG5W0qF2`, active, path `/webhook/rhythm-culture-form`). It checks the `X-RC-Secret` header (credential "Rhythm Culture form secret"), saves every enquiry to the Google Sheet "Rhythm Culture — Website enquiries" (André's Drive), replies `{ok:true}` only after saving (a failed save returns 500 and alerts André through the Error Handler), then emails info@rhythmculture.com.au from Gmail account 2 with Reply-To set to the customer. The header `X-RC-Test: 1` sends the email to André instead. `Rhythm Culture — Quiet Forms Alert` (`MJJTRZsIAqrVqehv`) Telegrams André if no real enquiry arrives for 7 days; **it is OFF until launch**. On Vercel set `FORM_WEBHOOK_URL` and `FORM_WEBHOOK_SECRET` (values are in the local `.env`). Still to do: test all four forms from the deployed preview.
5. **Images.** Done: `npm run compress` shrank 635 images from 188 MB to 108 MB (max 1920px wide, JPEG q80) and two unreferenced videos (80 MB) were removed. Still to do: optionally convert to WebP (`npm run compress -- --webp`, which also rewrites every reference; try `--dry-run` first), and replace the logo-as-photo shop images.
6. **Stripe.** Create one Payment Link per product: `reference/stripe-links-todo.csv` lists the 38 needed. For drums and packages enable shipping-address collection and add a shipping rate (WooCommerce used an Australia Post plugin). Paste each URL into the product's **Stripe Payment Link** field in the CMS (field only accepts `buy.stripe.com` links). Optionally authorise Stripe in `/mcp` and have Claude create them, after reviewing the list.
7. **Page-by-page visual review.** Only `/african-drumming-classes/` and `/shop/` have been checked by eye. Walk the 56 pages against the live site and fix layout gaps (grids, teacher bios, "Choose" buttons on the old Divi pages). Mark finished pages in a checklist.
8. **Gaps to fill.** Instagram strip (link grid is enough), events/dates (the old plugin is gone: either text on the pages or a small collection), Mailchimp signup embed, GA4 and Facebook pixel snippets in `src/layouts/Base.astro`, favicon, 404 page, `robots.txt`, sitemap (`@astrojs/sitemap`).
9. **Legal / SEO check.** Confirm the Assegai font licence covers the new host (it is a MyFonts webfont copied from the live theme). Compare titles and descriptions with the old site. Check all old URLs resolve (crawl the 9 old sitemaps against the build output).
10. **Cutover.** Preview URL signed off -> lower DNS TTL -> point the domain at Vercel -> watch Search Console. Keep the WordPress site untouched until then. Afterwards see *Post-launch todo*.

### Re-running the import

`scripts/import-wp.mjs` is a **one-time migration tool**, and it has a guardrail because the files it writes are the files the client edits afterwards:

- `npm run import` only **creates** files that don't exist yet. Every existing page, post, product and the menu is left untouched and counted ("N existing files left untouched"). Running it after the client has edited content changes nothing.
- `npm run import -- --force` overwrites existing files from the old WordPress export. It **refuses to run unless `src/content` has no uncommitted changes**, so any overwrite can be undone with git (`git restore src/content`). Use it only deliberately, on a branch.
- `npm run import:images` also downloads referenced images that are missing (images are never overwritten).

The guard is code, not a lock: someone can still pass `--force` on a clean tree. After launch, delete the tool (see *Post-launch todo*).

### Post-launch todo

Once the domain is live and the client has started editing:

1. **Delete the importer:** remove `scripts/import-wp.mjs` and the `import` and `import:images` entries in `package.json`. Without the tool there is nothing to overwrite their edits. Remove `turndown` from dependencies if nothing else uses it.
2. **Delete `reference/wp-export.xml`** (contains customer orders) and, if not needed, `reference/products.csv`, `image-list.txt`, `image-failures.txt`.
3. Update `AGENTS.md` and `.agents/skills/rhythm-culture-cms/SKILL.md`: drop the lines about not running the import.
4. Tag the final migrated state (`git tag migration-complete`) so a known-good version is one command away.
5. **Before Nathaniel gets push access:** branch protection on `main` (require a pull request). The repo is private on a free GitHub account, where protection is unavailable (API returns 403 "Upgrade to GitHub Pro"); needs GitHub Pro (~US$4/mo) or a paid org. Until then the agent rules and Keystatic's `update/` branches are habits, not locks.
6. Retire the old WordPress site only after Search Console shows no crawl problems, and keep a backup of it.

---

## Claude / ChatGPT as the CMS (client demo)

The idea (see Andre's harness-as-CMS plan): the client uses the **Claude or Codex desktop app** pointed at the project folder to make changes in plain language, while Keystatic stays available for routine text edits. Two different tools, two different jobs:

| | Keystatic (`/keystatic`) | Claude / Codex desktop app |
|---|---|---|
| Best for | Fixing text, prices, a blog post, swapping a Stripe link | New pages, restructuring, bulk edits, SEO, "make this section look like that" |
| Safe by | Typed fields, only touches content files | Branches + a local look on their own PC + review (below) |
| Needs | A browser and GitHub login | Desktop app, the folder, Git |

### Setup checklist

1. **Use the desktop app, not the CLI,** for clients. Give it access to this folder only.
2. **Branch, don't edit `main`.** Add branch protection so `main` needs a pull request. The client checks each change **locally on their own PC** before anything is committed (see *Local preview* below). Vercel also builds a preview URL per branch, but it sits behind a Vercel login the client doesn't have, so it is for you, not them. Rule for the agent: never push to `main`, never push without the client saying yes.
3. **`AGENTS.md`, `CLAUDE.md` and two skills are already in the repo** (`.agents/skills/`, copied to `.claude/skills/` for Claude). The copy is a real folder, not a symlink, because Git on Windows can't create symlinks without Developer Mode and the client uses Windows. `npm run build` refreshes it automatically (`prebuild` runs `scripts/sync-skills.mjs`), so after editing a skill, build and commit both folders; `npm run sync-skills -- --check` reports drift. `rhythm-culture-cms` is written for a non-developer client: it walks Claude through adding posts, editing pages, products and photos in plain language, and the branch, build, preview and publish flow, and tells it which changes need you (forms, redirects, config, URL changes). `compress-images` shrinks photos and can convert them to WebP. Codex (the ChatGPT desktop app) reads `AGENTS.md` and `.agents/skills/`, but not `CLAUDE.md` (`CLAUDE.md` is a pointer to `AGENTS.md` for Claude). `AGENTS.md` says the user is the owner and not a developer, and:
   - Stack: Astro 7 + Keystatic, content in `src/content`, forms in `src/lib/forms.ts`.
   - **Every form must use zod** via `forms.ts` / `formSchema.ts`.
   - Work on a branch, run `npm run build`, open a PR, wait for review. Never touch `main`.
   - Do not run `npm run import` (it overwrites edited content) and never edit `reference/`.
   - Never commit `.env` or secrets.
   - Page URLs (`link:` frontmatter) must not change without adding a redirect in `astro.config.mjs`.
   - Don't invent prices, dates or Stripe links; ask before deleting any page.
   - Forms, redirects and config need Andre (the agent explains and suggests contacting you).
4. **Pre-load a few safe tasks** in the demo: "add a blog post about the new term", "update the 4 class pass price", "add a school incursion testimonial to the Incursions page", "change the homepage hero text". Each ends in a local look, a branch and a build check.
5. **Guard sensitive files.** `src/lib/forms.ts` and `/api/form` (spam protection and validation), `astro.config.mjs` (redirects). `AGENTS.md` and the skill already tell the agent to stop and refer the client to you. This is guidance, not enforcement: branch protection and PR review on `main` are what actually stop a bad change.
6. **Ownership.** Decide before handing over who owns the GitHub repo, the Vercel account (Pro is a paid seat per person) and the domain. Vercel project transfer can hand it over later.
7. **Keep Keystatic for the boring edits.** Telling the client "text and prices: Keystatic; anything structural: ask Claude" cuts the chance an agent rewrites the wrong thing.

### Local preview (the client's preview step)

Vercel preview links need a Vercel login, so the client doesn't use them. Instead the assistant runs the site on their own PC and shows the changed page in the app **before anything is committed**:

- **Claude desktop app:** `.claude/launch.json` defines "Rhythm Culture (local preview)" (`npm run dev`, port 4321). The assistant starts it and opens the page in the app's browser pane. **Untested here:** I ran the same command and viewed the site in the browser pane, but the app's own `launch.json` lookup only works when the app is opened on this project folder. Check it on the client's PC.
- **Codex / ChatGPT desktop app:** not verified. The rules say to run `npm run dev` and open `http://localhost:4321/`. Test whether the app can show a local page before promising it.
- **One-time setup on the client's PC (about 15 minutes):** install Node 24 (`.nvmrc`), run `npm install` in the project folder, then ask the assistant to start the site and check it opens.
- **Editor drafts:** edits saved in `/keystatic` on an `update/` branch can be looked at by asking "show me my draft": the assistant fetches that branch and runs it locally.
- **Limits:** only the client sees it, forms don't send from a local run (no webhook secret there), and Vercel's own build after merge is still the final check. `npm run build` runs before every commit.
- **Keystatic-only clients** (no assistant) have no preview: Keystatic saves straight to `main` unless `branchPrefix` is set, and then the preview needs a Vercel login again.

### Demo script (10 minutes)

1. Open the live site at https://rhythm-culture.vercel.app. Show `/shop/` and a class pass.
2. In `/keystatic`, create a branch (top left), change a price, save, then ask the assistant "show me my draft" and it runs that branch on this PC (GitHub storage must be set up first, step 3 above).
3. In the desktop app, ask: "Add a new blog post 'Term 1 classes start' with this text." It starts the site on this PC and shows the post in the app. Nothing is online yet. Say "save it" (branch and PR), then "publish" (merge).
4. Submit the quote form on the live site and show the email arriving (needs step 4 above).
5. Show how to roll back: Vercel -> Deployments -> promote the previous one.

### Caveats to tell the client honestly

- Divi layout (columns, hero sections) was simplified. Some pages look plainer than before until step 7 is done.
- No cart: each product is a separate Stripe checkout. Fine for class passes, less so for mixed baskets.
- The in-memory rate limit is best effort.
- The agent can make mistakes, which is why the local look and PRs exist. Do not hand over `main` push rights.