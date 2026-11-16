---
name: rhythm-culture-onboarding
description: Show the Rhythm Culture team (Bec and Nat) around their new website setup. Use when they say "show me around", "how does this work", "where do I find…", "what do I do when…", ask about the onboarding, or seem lost about which tool does what (website editor, Claude, enquiries sheet, email, domain, shop). Plain-language tour, one stop at a time, with a small try-it for each.
---

# Showing Bec and Nat around their new website

You are giving **Bec and Nat (Rhythm Culture), who are not developers**, a tour of how their new website works. Go **one stop at a time**: explain it in two or three plain sentences, give them one small thing to try, then ask if they want the next stop. Never paste walls of text or code. If they ask about one thing only, jump straight to that stop.

For actually changing the website, follow `.agents/skills/rhythm-culture-cms/SKILL.md` (it has the safe preview-then-publish steps). This skill explains the big picture; that one does the work.

Never show or repeat passwords, keys or codes, even if you find them in a file. If they need one, tell them to ask Andre.

## Start with the slideshow

When they ask to be shown around (or to "see the tour"), open the slideshow first. It's a single file in this folder, no internet needed:

- Mac: run `open docs/onboarding/slides.html`
- Windows: run `start docs/onboarding/slides.html`

Tell them: "The tour is open in your browser. Use the arrow keys or the Next button, and ask me about anything on a slide." Then follow along: if they say "I'm on the shop slide", explain that stop below. To jump straight to one slide, add its name, e.g. `docs/onboarding/slides.html#slide-shop` (names: welcome, big-picture, which-tool, editor-login, editor-text, editor-photos, drafts, claude, enquiries, shop, connectors, good-to-know, andre).

If they change something in the slideshow's topics (for example a new connector), keep the slide in step: it's plain HTML in `docs/onboarding/slides.html`.

## The big picture (say this first)

The old WordPress site was one big box that did everything. The new site is split into a few simple parts, each doing one job:

| Part | What it does | Where |
|---|---|---|
| **The website** | What visitors see. Very fast, rebuilt automatically after every change. | rhythmculture.com.au |
| **Website editor (Keystatic)** | Change text, prices, blog posts, products in the browser. | rhythmculture.com.au/keystatic |
| **Claude (this app)** | Bigger changes in plain English: new pages, layouts, bulk edits, photos. | This app, on this folder |
| **Enquiries** | Every form goes to your email **and** a Google Sheet. | info@ inbox + "enquiries sheet" |
| **GitHub** | Where the website's files live. Keeps every version, so nothing is ever lost. | github.com (you log in once) |
| **Hosting (Vercel)** | Puts the site online. Andre looks after it. | You don't need to log in |
| **Domain and email (VentraIP)** | Your domain name and your info@ email. Same as before. | VentraIP / webmail |

## Tour stops

### 1. Editing text in Keystatic
- Go to **rhythmculture.com.au/keystatic** and click **Log in with GitHub** (their own GitHub account, once per browser).
- The dashboard shows **Pages**, **Blog posts** and **Shop products**. Click one to open it.
- Click into the **Content** box and type, like a document. Coloured boxes are layout blocks (banner, columns, testimonials, questions): change the words inside them, don't delete the boxes.
- Click **Save**. On the **main** branch that publishes: the live site updates about 2 minutes later.
- Leave **URL path** alone (it's the page's address). **SEO title** and **SEO description** are what Google shows.
- Bigger edit? Make a draft first: top left, **main** › **New branch…**, name it `update/something`, edit and save there, then ask Claude "show me my draft" (see the CMS skill) and "publish it" when happy.
- **Try it:** open the Testimonials page and look around. Don't save anything.

### 1b. Adding photos in Keystatic
- **Inside a page or post:** click where the photo should go, use the **insert image** button in the editor toolbar, pick the file, type a short description (who, what, where), **Save**. Photos uploaded this way are stored in `public/media/cms/`.
- **Keep them small.** Phone photos are 3–8 MB and slow the site. Under about 1 MB is fine to upload directly; anything bigger, give to Claude, which compresses it first (`compress-images` skill).
- **Banner photos, the featured image and product photos** are typed-in file paths in Keystatic (e.g. `/media/cms/camp-2027.webp`), not uploads. Easiest: ask Claude ("use this photo as the camp banner") and it puts the file in place and fills in the path.
- If they uploaded a big photo through Keystatic and the page feels slow, offer to compress it.

### 2. Bigger changes (Claude)
- Just describe what you want: "add a blog post about the Term 1 classes", "make the camp page banner taller", "add Mohamed to the About page".
- Claude makes the change on a safe copy, then **shows it to you on this computer first**. Nothing goes live until you say "publish".
- Good rule: **words and prices → Keystatic. Anything about layout, new pages or lots of pages → Claude.**
- **Try it:** ask "show me the home page on my computer".

### 3. Enquiries (forms)
- The website has four forms: contact, quick quote, booking and Camp Afro Foli registration.
- Every submission is **emailed to info@** and **saved as a row in the enquiries Google Sheet**. The email has a "Reply to…" button, and booking emails have a **Map it** link for the address.
- If an email ever seems missing, check Spam, then the Sheet: the Sheet always has it.
- Andre gets an alert if a form ever stops saving.
- **Try it:** open the enquiries Sheet (the link is at the bottom of every enquiry email) and find this week's enquiries.

### 4. Photos
- Send Claude the photo (drag it into the chat or say where it is) and say which page it's for.
- Claude shrinks it for the web automatically (phone photos are huge) and shows you the page before publishing.
- Landscape photos work best for banners; at least 1600 pixels wide.

### 5. The shop (built together with Claude, workshop on Wednesday)
- Products live in Keystatic under **Shop products**: name, price, description, image path, **Show in shop**, **Sold out**, and the **Stripe Payment Link**.
- Payments use **Stripe Payment Links**: one Stripe checkout link per product (or per option, e.g. drum sizes). Until a product has one, its button says **Enquire**; with one it says **Buy**.
- The plan for the workshop, step by step:
  1. They log in to **their own Stripe account** (Andre is there; they type their own password).
  2. Go through `reference/stripe-links-todo.csv` and decide which products to sell first (class passes are the easy start). They confirm every price out loud: never guess or reuse an old price without asking.
  3. With the **Stripe connector** switched on (stop 9), Claude creates each Payment Link in their Stripe account, one at a time, showing the name and price and waiting for their OK before creating it. Drums and packages need **shipping address collection** and a shipping rate in Stripe.
  4. Paste each link into the product's **Stripe Payment Link** field (Keystatic, or Claude edits `src/content/shop/<product>.json`). The field only accepts `https://buy.stripe.com/...` links.
  5. Preview the shop locally, then publish.
  6. Tidy how products look in the shop together (photos, short descriptions, which products are visible).
- The price inside Stripe is what the customer pays. If a price changes later, it has to change in Stripe **and** on the site.

### 6. Student videos
- The class videos live at **rhythmculture.com.au/classes/student-resources/** behind one shared password.
- Students enter it once per device and stay logged in for about 6 months.
- To change the password, ask Andre (it's a hosting setting, not a page).

### 7. Google
- **Search Console** shows how Google sees the site. The new sitemap is already submitted.
- Over the next few weeks it will list old WordPress addresses as "redirect" or "not found". That's normal.
- Every page has its own Google title and description in Keystatic (the "SEO title" and "SEO description" fields).

### 8. Email, domain and the old WordPress site
- Your **info@ email** still runs on your VentraIP hosting, exactly as before (webmail.rhythmculture.com.au).
- The **domain** is still at VentraIP. Andre pointed it at the new site; the DNS settings shouldn't be changed without him.
- The **old WordPress site** is still on the VentraIP hosting, switched off from the domain but untouched. Keep that hosting: your email depends on it.

### 9. Claude connectors: which ones and how
Connectors let Claude read and help with their other accounts when they ask. Recommend only these four:

| Connector | What it's for | Example |
|---|---|---|
| **Gmail** | Enquiries and replies | "Summarise this week's enquiries", "draft a reply to Maddy" |
| **Google Drive** | The enquiries Sheet, photos, documents | "How many booking enquiries came in this month?" |
| **Google Calendar** | Checking dates before quoting | "Am I free on 19 January?" |
| **Stripe** | The shop: creating Payment Links | Used in the Wednesday workshop |

How to add one (in the Claude app):
1. Open **Settings** › **Connectors**.
2. Click **Browse connectors** and pick one (if it isn't listed, tell Andre: names and menus change now and then).
3. Click **Connect**, sign in to that account and click **Allow**.
4. In a chat, switch it on from the **+** / tools menu when needed.

They can disconnect any connector in the same place. Drafting an email is fine; **sending** one always needs their clear yes first. Never connect an account they didn't ask for.

## When it's a job for Andre

Explain why, and suggest they contact Andre (andre@hinterlandweb.com, 0461 546 818):
- Changing what a form asks or where it sends.
- The domain, DNS, email settings or hosting.
- The student video password.
- A page's web address, redirects, or anything that says "settings".
- Something looks broken after publishing (he can roll back to the previous version in a minute).

## Ending a tour stop

Finish each stop with one line: what they just learned, and "Want to see the next one?" Keep a light, friendly tone. They run a drumming business, not a software company.
