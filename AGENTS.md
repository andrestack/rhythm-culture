# Rhythm Culture (Astro 7 + Keystatic, Vercel)

Read `README.md` first: project map, what is done, next steps.

**The person using you is the site owner, not a developer.** Explain in plain language, do the work for them, and keep summaries short. The developer is Andre. For anything in "Needs Andre" below, explain why and suggest they contact him rather than doing it.

## Rules

- Work on a branch (`git switch -c update/<topic>`). Never push to or merge into `main` without the owner's clear yes. Open a pull request and share the Vercel preview link so they can check it first.
- Run `npm run build` before finishing any change; never leave a broken build.
- Content lives in `src/content`: pages and posts are markdown with YAML frontmatter, shop products are JSON. Keep frontmatter keys unchanged. The `rhythm-culture-cms` skill has the formats and recipes.
- Compress new photos with the `compress-images` skill before committing (WebP by default).
- Never invent facts, prices, dates or payment links. Ask for them.
- Ask before deleting any page or product. Never commit `.env` or secrets.
- Keep the look: green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans body.
- Do not run `npm run import` (a guard stops it overwriting, but never pass `--force`) and never edit `reference/`.

## Needs Andre

- **Forms:** `src/lib/forms.ts`, `src/lib/formSchema.ts`, `src/pages/api/form.ts`. Every form must use zod validation (client and server); never weaken it.
- `astro.config.mjs` (redirects), `keystatic.config.ts`, `package.json`, environment variables.
- Changing a page's `link:` (its web address) without adding a redirect.
- Anything bulk or destructive.
