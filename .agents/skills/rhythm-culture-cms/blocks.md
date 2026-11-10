# Page blocks

Pages are laid out with **blocks**: tags like `{% columns %}` inside the page text. The website editor (`/keystatic`) shows the same blocks as boxes with an Edit button, so changes made either way are interchangeable.

Each block is defined in three places that must match: `src/lib/markdoc.ts` (how it looks), `keystatic.config.ts` (how the editor shows it) and this file. **Adding a new kind of block, or a new option, is Andre's job.** Using the existing ones is yours.

## The blocks

| Block | Use it for | Options |
|---|---|---|
| `hero` | The photo at the top of a page, with the title and usually a button. Once per page, first thing. | `image` (required), `align` center/left, `size` tall/short, `accent` white/green (heading colour) |
| `section` | A full-width band to set part of the page apart. | `tone` grey/white/dark/red/image, `image` (only with tone "image") |
| `columns` + `column` | Side-by-side content: 2 to 5 columns. Stacks on phones. If every column holds just one photo, the row becomes a photo gallery: photos are cropped to the same shape and stay side by side on phones. | `layout` equal/wide-left/wide-right, `align` top/center. On a `column`: `card` dark/light puts that column in a rounded box (dark = dark box with green heading, light = white box, best on a grey band). A numbered list inside a card gets red number circles. |
| `feature` | A red icon above a short heading and sentence ("Free drum hire"). Put 3 or 4 in `columns`. | `icon`: dollar, pin, thumbs-up, check, people, music, star, heart, calendar, school, chat, smile |
| `testimonials` + `testimonial` | Client quotes on cards. Put the quotes inside one `testimonials` block. | `name`, `role` (role and organisation) |
| `faq` + `question` | Questions that open to show the answer, for FAQs and any long list of explanations. Each `question` has a `title` and its answer inside; put them all in one `faq`. Use it instead of a wall of text. | `title` (the question) |
| `button` | A red button. Self-closing (ends with `/%}`). | `label`, `href` (both required), `align` center/left |
| `banner` | The multicoloured stripe with one line of big text. | `image` (leave out to use the standard stripe) |
| `callout` | One or two sentences in large red text, centred. | none |
| `embed` | A YouTube/Vimeo video, Google map or Facebook post. Self-closing. | `src` (the *embed* link), `title`, `ratio` video/map/post |

## Examples

```
{% hero image="/media/cms/term-2.webp" align="left" %}
# Term 2 drum classes

Every Tuesday at Palmwoods Memorial Hall

{% button label="Book now" href="/shop/" align="left" /%}
{% /hero %}

## Why join?

{% columns %}
{% column %}
{% feature icon="music" %}
### No experience needed

Beginners are welcome every week.
{% /feature %}
{% /column %}
{% column %}
{% feature icon="people" %}
### Friendly group

Meet people who love rhythm.
{% /feature %}
{% /column %}
{% column %}
{% feature icon="dollar" %}
### Drums supplied

No need to buy a drum to start.
{% /feature %}
{% /column %}
{% /columns %}

{% testimonials %}
{% testimonial name="Jane Smith" role="Teacher, Example State School" %}
"The kids loved it."
{% /testimonial %}
{% /testimonials %}

{% embed src="https://www.youtube.com/embed/GaSS94SQbQY" title="Drum class video" /%}
```

## Headings

- `#` is the page title. One per page, normally inside the `hero`.
- `##` is a section title. It shows centred and red.
- `###` is a heading inside a column, feature or band.

## Rules

- Prefer photos over Facebook embeds. Embedded posts load slowly and show as empty boxes when a browser blocks Facebook; link to the page with a `button` instead.
- Every block that opens must close: `{% columns %}` … `{% /columns %}`. `button` and `embed` close themselves with `/%}`.
- Inside `columns`, put each column's content between `{% column %}` and `{% /column %}`, with nothing outside them.
- Never paste raw HTML or `<iframe>` code: it won't show. Use `embed` with the link from YouTube's Share → Embed (the `src="…"` part) or Google Maps' Share → Embed a map.
- Never use green for text on white (it can't be read). Green headings are only for a `hero` with `accent="green"`.
- Do not change the words of a page when the request was about layout.
- Run `npm run build` after any block change. A typo in a block stops the build, and the error names the file and line.
