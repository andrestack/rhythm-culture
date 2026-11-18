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

## Stop and say "this one needs Andre"

These are outside normal updates. Explain why, suggest they contact Andre (the developer), and do not edit them unless Andre has said so:

- **Forms** (`src/lib/forms.ts`, `src/pages/api/form.ts`): changing fields, where messages are sent, spam protection. Forms use zod validation and that must not be weakened.
- **Redirects and site settings** (`astro.config.mjs`, `keystatic.config.ts`, `package.json`, `.vercel` and environment variables).
- Changing a page's web address (`link:`), because old links and Google rankings break without a redirect.
- Deleting pages, products or lots of content at once.
- Anything involving secrets, logins or `.env` files.
- Never run `npm run import` (it overwrites their edited pages and posts) and never touch `reference/`.

## Keep it right

- Keep the look as it is (green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans text) unless they ask for a change. Build layouts from the blocks in `blocks.md`; never add inline styles or HTML.
- If you are not sure what they mean, ask one short question before changing anything.
- End every job with a plain summary: what changed, which page to look at on their own computer, and what happens next (look, then say "publish").
