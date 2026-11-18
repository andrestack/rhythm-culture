---
name: rhythm-culture-onboarding
description: Show Bec and Nat (Rhythm Culture) around their website setup. Use on "show me around", "how does this work", "where do I find…", "what do I do when…", or when they seem lost about which tool does what (website editor, Claude, enquiries sheet, email, domain, shop).
---

# Rhythm Culture: the tour

Bec and Nat run Rhythm Culture. They are not developers. They use Windows.

Computer not set up yet, or the preview won't start? Run the `rc-setup` skill first (`/rc-setup`).

## How to talk

| Rule | Means |
|---|---|
| One stop per reply | 2–3 short sentences, one try-it, then "Next stop?" |
| Answer first | No greeting, no "let me", no recap. |
| Plain words | No code on screen unless they must type it. |
| Full sentences when it matters | Steps, warnings, logins, and when they sound confused. |
| Secrets stay hidden | Never show or repeat passwords, keys or codes. If they need one: ask Andre. |
| Real changes | Follow `.agents/skills/rhythm-culture-cms/SKILL.md`. This skill explains; that one does the work. |

Asked about one thing only? Jump straight to that stop.

## Slideshow

Open it first. It is one file, no internet needed:

- Windows: `start docs\onboarding\slides.html`
- Mac: `open docs/onboarding/slides.html`

Say: "The tour is open in your browser. Use the arrow keys, and ask me about any slide."
Jump to a slide with `#slide-<name>`: welcome, big-picture, which-tool, editor-login, editor-text, editor-photos, claude, enquiries, shop, connectors, good-to-know, andre.
If a stop below changes, update its slide too (plain HTML in `docs/onboarding/slides.html`).

## Big picture

| Part | Job | Where |
|---|---|---|
| Website | What visitors see. Rebuilds itself after every change. | rhythmculture.com.au |
| Website editor (Keystatic) | Text, prices, blog posts, products. | rhythmculture.com.au/keystatic |
| Claude (this app) | Bigger changes: pages, layouts, photos, bulk edits. | This app, on this folder |
| Enquiries | Every form goes to the inbox and the enquiries sheet. | info@ inbox + Google Sheet |
| GitHub | Stores the site's files and every past version. | github.com, one login |
| Vercel | Puts the site online. Andre looks after it. | No login needed |
| VentraIP | Domain and info@ email, same as before. | VentraIP / webmail |

Rule of thumb: **words and prices → website editor. Layout, new pages, many pages → Claude.**

## Stops

### 1. Website editor
- Go to rhythmculture.com.au/keystatic. Click **Log in with GitHub** (once per browser).
- Open **Pages**, **Blog posts** or **Shop products**. Type in the **Content** box like a document.
- Coloured boxes are layout blocks. Change the words inside. Don't delete the boxes.
- **Save** publishes. The live site updates in about 2 minutes.
- Leave **URL path** alone. **SEO title** and **SEO description** are what Google shows.
- Try it: open the Testimonials page and look around. Don't save.

### 2. Photos
- Easiest: drag the photo into this chat and name the page. Claude shrinks it (`compress-images` skill) and shows the page first.
- In the editor: **insert image** in the toolbar, add a short description, **Save**. Under 1 MB only. Uploads land in `public/media/cms/`.
- Banner, featured and product photos are file paths, not uploads. Ask Claude to place them.
- Banners: landscape, at least 1600 px wide.
- Big photo uploaded and the page feels slow? Offer to compress it.

### 3. Bigger changes (Claude)
- Describe it: "add a blog post about Term 1 classes".
- Claude shows it on this computer first. Nothing goes live until they say "publish".
- Try it: "Show me the home page on my computer."

### 4. Enquiries
- Four forms: contact, quick quote, booking, Camp Afro Foli.
- Each one is emailed to info@ and saved as a row in the enquiries sheet. The sheet link is at the bottom of every enquiry email.
- Email missing? Check Spam, then the sheet. The sheet always has it.
- Andre gets an alert if a form stops saving.
- Try it: open the sheet and find this week's enquiries.

### 5. Shop
- Products live in the editor under **Shop products**.
- Each product needs a **Stripe Payment Link** (`https://buy.stripe.com/...`). Without one, the button says **Enquire**. With one, it says **Buy**.
- Making links (with Andre, the first time):
  1. They log in to their own Stripe account.
  2. Pick products from `reference/stripe-links-todo.csv`. They confirm each price out loud. Never guess a price.
  3. With the Stripe connector on, create one link at a time. Show name and price. Wait for their OK.
  4. Drums and packages need shipping address collection and a shipping rate.
  5. Paste each link into the product. Preview the shop, then publish.
- A price change goes in Stripe **and** on the site.

### 6. Student videos
- At rhythmculture.com.au/classes/student-resources/, behind one shared password.
- Students enter it once per device. It lasts about 6 months.
- New password: ask Andre.

### 7. Google
- Search Console shows how Google sees the site. The sitemap is submitted.
- Old WordPress addresses show as "redirect" or "not found" for a few weeks. That's normal.

### 8. Email, domain, old site
- info@ email still runs on VentraIP (webmail.rhythmculture.com.au).
- The domain is at VentraIP. Don't change DNS without Andre.
- The old WordPress site is still on VentraIP, off the domain. Keep that hosting: email depends on it.

### 9. Connectors
Recommend only these:

| Connector | For | Example |
|---|---|---|
| Gmail | Enquiries, replies | "Summarise this week's enquiries" |
| Google Drive | Enquiries sheet, photos, docs | "How many bookings this month?" |
| Google Calendar | Dates before quoting | "Am I free on 19 January?" |
| Stripe | Shop Payment Links | Stop 5 |

Add one: **Settings › Connectors › Browse connectors › Connect**, sign in, **Allow**. Switch it on from the **+** menu in a chat. Not listed? Tell Andre.
Drafting an email is fine. Sending needs their clear yes. Never connect an account they didn't ask for.

## Jobs for Andre

Say why, then point to Andre: andre@hinterlandweb.com, 0461 546 818.
- What a form asks, or where it sends.
- Domain, DNS, email settings, hosting.
- Student video password.
- A page's web address, redirects, anything called "settings".
- GitHub login or access errors.
- Something looks broken after publishing. He can roll back in a minute.
