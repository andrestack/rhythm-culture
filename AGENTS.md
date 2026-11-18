# Rhythm Culture (Astro 7 + Keystatic, Vercel)

Read `README.md` first: project map, what is done, next steps.

**The person using you is the site owner, not a developer.** Explain in plain language, do the work for them, and keep summaries short. The developer is Andre. For anything in "Needs Andre" below, explain why and suggest they contact him rather than doing it.

**Before any content change, read `.agents/skills/rhythm-culture-cms/SKILL.md`** (file formats, recipes, the preview-then-publish flow). For photos, use `.agents/skills/compress-images/SKILL.md`. When they ask how the setup works or want to be shown around, use `.agents/skills/rhythm-culture-onboarding/SKILL.md`. To set up a computer, or when the local preview, `git pull` or a pull request won't work, use `.agents/skills/rc-setup/SKILL.md` (`/rc-setup`).

## Every job, in this order

1. Start from the latest site: `git switch main`, then `git pull`. The website editor (Keystatic) saves straight to GitHub, so the local copy goes stale.
2. Make a branch for this one change: `git switch -c update/<topic>`. Never commit on `main`.
3. Make the change. Run `npm run build`; never leave a broken build.
4. Show the change on their own computer before anything is saved online: start the site locally (in the Claude app, the "Rhythm Culture (local preview)" server in `.claude/launch.json`; otherwise `npm run dev`, then `http://localhost:4321/`) and open the page that changed. Don't send Vercel preview links: they need a Vercel login the owner doesn't have. Details in the CMS skill.
5. Once the owner says yes, commit, push the branch and open a pull request.
6. Merge only when the owner clearly says to publish.

## Rules

- Content lives in `src/content`: pages and posts are markdown with YAML frontmatter, shop products are JSON. Keep frontmatter keys unchanged.
- Compress new photos with the `compress-images` skill before committing (WebP by default).
- Never invent facts, prices, dates or payment links. Ask for them.
- Deleting a page or product is the owner's call: confirm which one, then do it. If it had a web address, add a redirect to the closest page (CMS skill, "Delete a page or product"). Never delete `thank-you-*` pages: the forms need them. Never commit `.env` or secrets.
- Keep the look: every change follows the design rules in the CMS skill (blocks only, the site's own colours and fonts, no inline styles or HTML). Green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans body.
- Do not run `npm run import` (a guard stops it overwriting, but never pass `--force`) and never edit `reference/`.
- Never run `git push --force`, `git reset --hard`, `git clean`, or `git rebase`, and never delete branches. If git gets into a state you don't understand, stop and tell the owner to contact Andre.
- If a step fails because of a login, permission or network problem (push, pull request, `npm install`), stop and explain it in plain words. Never work around it by changing git settings or remotes, or by pasting tokens or passwords anywhere.
- Do not edit `AGENTS.md`, `CLAUDE.md` or anything in `.agents/` or `.claude/`: these are the rules.

## Needs Andre

- **Where enquiries go and the enquiry emails.** They run on Andre's n8n workflow, outside this repo. Also `src/lib/formSchema.ts`, `src/pages/api/form.ts` and `src/components/Form.astro`: validation, spam protection, sending. Changing a form's questions in `src/lib/forms.ts` is the owner's (CMS skill, "Change a form").
- `astro.config.mjs` (except adding one redirect line for a deleted or moved page), `keystatic.config.ts`, `package.json`, `.gitattributes`, environment variables.
- New kinds of block, the menu (`src/lib/nav.ts`), `src/styles/global.css`, layouts and components: anything that changes the whole site's look at once.
- Something the site can't do yet: online bookings, an events calendar, a newsletter sign-up, logins.
- Domain, DNS, email, hosting, and logins for GitHub, Vercel or Stripe.
