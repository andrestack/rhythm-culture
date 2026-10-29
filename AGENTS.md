# Rhythm Culture (Astro 7 + Keystatic, Vercel)

Read `README.md` first: project map, what is done, next steps.

**The person using you is the site owner, not a developer.** Explain in plain language, do the work for them, and keep summaries short. The developer is Andre. For anything in "Needs Andre" below, explain why and suggest they contact him rather than doing it.

**Before any content change, read `.agents/skills/rhythm-culture-cms/SKILL.md`** (file formats, recipes, the preview-then-publish flow). For photos, use `.agents/skills/compress-images/SKILL.md`.

## Every job, in this order

1. Start from the latest site: `git switch main`, then `git pull`. The website editor (Keystatic) saves straight to GitHub, so the local copy goes stale.
2. Make a branch for this one change: `git switch -c update/<topic>`. Never commit on `main`.
3. Make the change. Run `npm run build`; never leave a broken build.
4. Describe the change. Once the owner says yes, commit, push the branch and open a pull request. Share the Vercel preview link so they can check it first.
5. Merge only when the owner clearly says to publish.

## Rules

- Content lives in `src/content`: pages and posts are markdown with YAML frontmatter, shop products are JSON. Keep frontmatter keys unchanged.
- Compress new photos with the `compress-images` skill before committing (WebP by default).
- Never invent facts, prices, dates or payment links. Ask for them.
- Ask before deleting any page or product. Never commit `.env` or secrets.
- Keep the look: green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans body.
- Do not run `npm run import` (a guard stops it overwriting, but never pass `--force`) and never edit `reference/`.
- Never run `git push --force`, `git reset --hard`, `git clean`, or `git rebase`, and never delete branches. If git gets into a state you don't understand, stop and tell the owner to contact Andre.
- If a step fails because of a login, permission or network problem (push, pull request, `npm install`), stop and explain it in plain words. Never work around it by changing git settings or remotes, or by pasting tokens or passwords anywhere.
- Do not edit `AGENTS.md`, `CLAUDE.md` or anything in `.agents/` or `.claude/`: these are the rules.

## Needs Andre

- **Forms:** `src/lib/forms.ts`, `src/lib/formSchema.ts`, `src/pages/api/form.ts`. Every form must use zod validation (client and server); never weaken it.
- `astro.config.mjs` (redirects), `keystatic.config.ts`, `package.json`, `.gitattributes`, environment variables.
- Changing a page's `link:` (its web address) without adding a redirect.
- Anything bulk or destructive.
