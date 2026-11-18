---
name: rhythm-culture-cms
description: Help the Rhythm Culture team update their own website. Use when they ask to add or change a blog post, a page, a shop product, price or payment link, add photos, or change what the site says. Written for non-developers; covers file formats, the safe preview-then-publish flow, and which changes need Andre.
---

# Updating the Rhythm Culture website

You are helping the **site owner, who is not a developer**, update their own website. They will describe what they want in plain English ("add a post about term 2", "change the 8 class pass to $130"). Do the work for them and explain in plain language: no jargon, no walls of code. Tell them what you changed and what happens next.

The site is Astro + Keystatic. Content is plain files, so you edit files directly. `AGENTS.md` has the short rules; this is the how-to.

## How every change goes live

1. **Get the latest, then make a safe copy.** `git switch main` and `git pull` (edits made in the website editor land on GitHub, not on this computer), then `git switch -c update/<short-topic>` (for example `update/term-2-post`). Do not change the live site directly.
2. **Make the change** (recipes below).
3. **Check it works:** `npm run build`. If it fails, fix or undo it. Never leave them with a broken site.
4. **Show them on their own computer, before anything is saved online.** Start the site locally and open the exact page that changed, so they see it as a visitor would:
   - In the Claude desktop app, start the **"Rhythm Culture (local preview)"** server and open the page in the app's browser pane. Anywhere else, run `npm run dev` and open `http://localhost:4321/<page>` (the home page is `http://localhost:4321/`).
   - Tell them in plain words what to look at ("scroll to the new paragraph", "the price should say $130"). For phone view, resize the window narrow.
   - Forms won't send from here. That's expected.
   - Not right? Change it and show it again. Don't commit yet.
   - If the site won't start (`node` or `npm` missing, missing packages, wrong Node version), run the `rc-setup` skill (`/rc-setup`): it checks this computer step by step and says what to fix.
5. **Save it online only when they say yes.** Commit, push the branch and open a pull request. Do **not** send the Vercel preview link: it asks for a Vercel login they don't have.
6. **Publish only when they say so:** merge the pull request. If they are not sure, wait. The live site updates a couple of minutes later.

**Used the website editor (`/keystatic`) instead?** Edits made there on a branch starting with `update/` are saved to GitHub. To look at one, run `git fetch`, switch to that branch (`git switch update/<name>`), then show it locally exactly as in step 4. Publish by merging its pull request. Edits made on `main` go live immediately with no preview.

Never push or merge without a clear yes. If something goes wrong after publishing, undo it (next section). Andre can also restore the previous version in Vercel in about a minute.

## Undo a publish

Use when they say "undo", "put it back", or "the last change broke the page". An undo is a new change that reverses the old one. Nothing is deleted.

1. `git switch main`, then `git pull`.
2. Find the change: `git log --first-parent -15 --format='%h %ad %s' --date=format:'%d/%m %H:%M'`. Pick it by date and message. Not sure which one? Ask.
3. Say it in plain words and wait for yes: "Undo 'Term 1 post', published today at 2:10pm?"
4. `git switch -c update/undo-<topic>`.
5. Revert, newest first, one at a time:
   - Message starts with "Merge" (a publish): `git revert --no-edit -m 1 <hash>`
   - Anything else (a website editor save, or a direct change): `git revert --no-edit <hash>`
6. Conflict? `git revert --abort`, stop, and tell them to contact Andre. A later change touched the same lines.
7. `npm run build`, show it locally, then "save it" and "publish" as above. Live again about 2 minutes after the merge.

- Never `git reset`, force-push or rewrite history to undo.
- Only website files undo. Stripe prices, forms, DNS and sent emails don't.
- Site down or blank right now? Tell them to call Andre as well. He can restore it in Vercel while you prepare the undo.

## What you can do yourself

### New blog post
Create `src/content/posts/<slug>.mdoc`. The filename is the web address: `/<slug>/`.

```
---
title: Term 1 classes start
link: /term-1-classes-start/
description: One sentence for Google (under 160 characters).
featured: /media/cms/term-1.webp
date: '2027-01-20'
categories:
  - News
---
Body in markdown.
```

The top block is YAML in the same layout Keystatic writes: keys in this order, the date in single quotes, and any field with no value left out entirely (no `featured` line if there is no photo). Put a value in quotes if it contains a colon. `link` must be `/<slug>/` and different from every other page. New posts show up on `/blog/` automatically, newest first. Ask for any facts you do not have (dates, times, prices, places): never invent them.

### Change a page
Find it: `grep -l 'link: /about/' src/content/pages/*.mdoc`, then edit the body text only. Keep `link:` as it is. Pages are laid out with blocks such as `{% hero %}`, `{% columns %}` and `{% testimonials %}`: **read `blocks.md` in this folder before changing a page's layout or adding a section**, and keep every block's opening and closing tags. A page can show a form under its text: set `form:` to `contact`, `quote`, `booking`, `camp`, or `""` for none.

### Shop product, price, payment link
`src/content/shop/<slug>.json`. The useful fields:

- `visible`: shown in the shop. `soldOut`: shows "Sold out".
- `price`, `salePrice`: numbers as text in AUD, no `$`.
- `description`: short text (markdown).
- `stripeUrl`: the Stripe **Payment Link** (`https://buy.stripe.com/...`). If empty, the button says "Enquire" instead.
- `options[]`: sizes or variations, each with `label`, `price`, `stripeUrl`.

Only change a price or payment link when they give you the exact new value, and remind them that the price inside Stripe's own Payment Link has to match what the site shows (the site cannot change what Stripe charges). Never make up a payment link.

### Photos
Save new photos into `public/media/cms/` with lowercase hyphenated names, reference them as `/media/cms/<file>`, and write short descriptive alt text in the markdown: `![Dundun class at Palmwoods](/media/cms/dundun-class.webp)`. Phone photos are 3 to 8 MB, so **always run the `compress-images` skill first** (convert to WebP is the best default for new photos).

### Change a form
The four forms (contact, quote, booking, camp) are listed in `src/lib/forms.ts`. Each field is one line: `f('name', 'Label', { type, required, options })`. The checks in the browser and on the server are built from this list automatically, so a field added here is checked and sent with no other change.

- They can add a field, remove one, change a label, a dropdown's options, whether it's required, or the booking terms text.
- Keep every existing field's `name` (the first value) as it is. The enquiries sheet and email are matched on it. To retire a field, remove its line. Don't reuse the name for something else.
- A new field's `name` is camelCase, short and unique within that form (`eventPostcode`). Use the right `type`: `email`, `tel`, `date`, `number`, `select` (with `options`), `textarea`, `checkbox`.
- Show it locally and fill the form in. It won't send from this computer; that's expected. After publishing, ask them to send one test enquiry and check it arrives.
- Where enquiries are emailed, the email's look and the enquiries sheet run on Andre's system: that's his.

### Delete or hide a page or product
Their call. Confirm which one by its title and address, then:

1. **Hide instead?** A product can be hidden (`visible: false`) or shown as sold out (`soldOut: true`) and brought back later. Offer that first. If they still want it gone, delete it.
2. Delete the file (`src/content/pages/<file>.mdoc` or `src/content/shop/<slug>.json`).
3. **Point the old address somewhere.** Add one line to the `redirects` list in `astro.config.mjs`, without the trailing slash, to the closest page: `'/old-page': '/classes/',` (a product goes to `/shop/`). Only add lines there. Change nothing else in that file.
4. Search for links to it: `grep -rn '/old-page/' src/content src/lib/nav.ts src/components/Footer.astro`. Point links inside pages and posts at the new place. If it's in the menu or footer, remove just that link.
5. `npm run build`, then check the old address locally: it should land on the new page.

Never delete `thank-you-*` pages (each form sends people to one), or the home, shop, blog or contact pages.

### Move a page (new web address)
Same as a delete, the other way round: change `link:` in the page, add a redirect line from the old address to the new one (step 3 above), and update links to it (step 4).

## Stop and say "this one needs Andre"

These change how the whole site works or reach outside it. Explain why, suggest they contact Andre (the developer), and do not edit them unless Andre has said so:

- **Where enquiries go and the enquiry emails** (they run on Andre's n8n), and the form machinery: `src/lib/formSchema.ts`, `src/pages/api/form.ts`, `src/components/Form.astro` (validation, spam protection, sending). The validation must never be weakened.
- **Site settings:** `astro.config.mjs` (apart from adding a redirect line), `keystatic.config.ts`, `package.json`, `.vercel` and environment variables.
- **The whole site's look at once:** the menu (`src/lib/nav.ts`, apart from removing a deleted page's link), `src/styles/global.css`, layouts, components, and new kinds of block.
- **Something the site can't do yet:** online bookings, an events calendar, a newsletter sign-up, logins.
- Domain, DNS, email, hosting, secrets, logins or `.env` files.
- Never run `npm run import` (it overwrites their edited pages and posts) and never touch `reference/`.

## Keep it right: the design rules

It's their website and they can try new layouts. Every change still has to look like the rest of the site. Before showing them anything, check:

- **Blocks only.** Build sections from the blocks in `blocks.md` (hero, section, columns, feature, testimonials, faq, button, banner, callout, chips, embed). No inline styles, HTML, `<iframe>`, or new CSS. If they want something no block can do, say so and suggest Andre adds a block. Don't fake it.
- **The site's colours and fonts.** Green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans text. Background colour comes only from a `section` `tone` (grey, white, dark, red, image). No green text on white.
- **One page shape.** One `hero` at the top with the page's only `#` title. `##` for section titles, `###` inside columns and cards. Alternate section tones so bands don't run together. End a sales page with a clear next step (a `button` to the right form or the shop).
- **Copy their own pages.** Before a new section, open a similar page (`/school-incursions/`, `/classes/`) and reuse its pattern: features in 3s or 4s, testimonials as cards, photos as a gallery row.
- **Photos.** Compressed WebP (`compress-images`), real alt text, banners landscape and at least 1600 px wide.
- **Their voice.** Write as "we" (Rhythm Culture). Never invent facts, prices or dates.
- **Check on a phone width** before you show them, and fix anything that wraps badly.
- If you are not sure what they mean, ask one short question before changing anything.
- End every job with a plain summary: what changed, which page to look at on their own computer, and what happens next (look, then say "publish").
