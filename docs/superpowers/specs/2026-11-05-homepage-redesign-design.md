# Homepage redesign: "Big Beat"

Status: **direction chosen, not built yet.** Branch: `update/homepage-redesign`.

## Why

The current homepage (`src/pages/index.astro`) renders the imported WordPress page
`src/content/pages/rhythm-culture-african-drumming-incursions-workshops-and-classes.mdoc`
as one long column of text under a single hero photo. The owner asked for something
"really different". Three directions were mocked up; the owner picked **A · Big Beat**,
with one change: **more breathing space between the photos**.

Mockups (all three, A marked as chosen): `docs/mockups/homepage-directions.html`.
Open it from a local web server at the project root so the photos load, for example
`npx serve .` and then `/docs/mockups/homepage-directions.html`. Opening the file
directly also works in most browsers.

## What Big Beat is

Top to bottom:

1. **Header:** logo left, short nav and a red "Get a quote" pill right (existing site header can stay).
2. **Hero:** full-width photo (`/media/2018/09/A08R7271-e1550205581543.jpg`, students drumming),
   dark gradient from the bottom, one big Assegai line in white with the second half in green
   ("Bring the drums **to your school**"), one sentence under it, two buttons:
   red "Get a quick quote" and green "See programs".
3. **Four audience tiles,** each a photo with a dark gradient and a label, linking to that audience's page:
   - Kindy & Early Learning (`/media/2019/02/RC-Kindy-601.jpg`)
   - School Incursions (`/media/2018/09/A08R7253.jpg`)
   - Corporate Drumming (`/media/2018/05/180321121002_BJA2651.jpg`)
   - Weekly Classes, Sunshine Coast (`/media/2021/07/BecAfro-02-scaled.jpg`)
   **Owner feedback: leave clear space between the tiles** (mockup uses an 18px gap,
   18px padding and rounded corners; on the real page use a comfortable gap and stack
   to 2 columns on tablet and 1 on phone).
4. **Dark strip:** the six cities in green Assegai (Sunshine Coast · Brisbane · Melbourne ·
   Sydney · Perth · Adelaide) and a red "Book now" button.

## Rules that still apply

- Keep the brand: green `#7cda24`, red `#e02b20`, Assegai headings, Open Sans body
  (tokens in `src/styles/global.css`). Green text only on dark backgrounds.
- Wording in the mockup is a draft. Reuse the facts already on the current homepage;
  do not invent numbers, testimonials, prices or dates. Ask the owner for any new copy.
- Do not change any page's `link:`. Tile links must point at existing pages
  (check `src/content/pages/*.mdoc` for the right `link:` of each audience page).
- Photos already exist in `public/media/`. New photos go through the `compress-images` skill.
- The rest of the current homepage text should stay below the new sections (or be trimmed
  only with the owner's OK), so nothing useful for search disappears.

## Open questions for the owner

- Final hero headline and the sentence under it.
- Which page "See programs" and each tile should open. Best guess, all existing pages:
  Kindy `/early-learning-and-kindergarten-incursions/`, Schools `/school-incursions/`,
  Corporate `/team-building/`, Classes `/african-drumming-classes/` (or `/classes/`),
  "See programs" `/drum-sing-dance-program/`.
- How much of the existing long text stays under the new sections.

## Next steps

1. Build the sections in `src/pages/index.astro` (or a component), styles in `global.css`.
2. `npm run build`, then show it locally (see README, "Local preview") and get the owner's OK.
3. Commit, push, open a pull request. Merge only when the owner says publish.
