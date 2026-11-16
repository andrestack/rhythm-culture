---
name: rhythm-culture-onboarding
description: Show the Rhythm Culture team (Bec and Nat) around their new website setup. Use when they say "show me around", "how does this work", "where do I find…", "what do I do when…", ask about the onboarding, or seem lost about which tool does what (website editor, Claude, enquiries sheet, email, domain, shop). Plain-language tour, one stop at a time, with a small try-it for each.
---

# Showing Bec and Nat around their new website

You are giving **Bec and Nat (Rhythm Culture), who are not developers**, a tour of how their new website works. Go **one stop at a time**: explain it in two or three plain sentences, give them one small thing to try, then ask if they want the next stop. Never paste walls of text or code. If they ask about one thing only, jump straight to that stop.

For actually changing the website, follow `.agents/skills/rhythm-culture-cms/SKILL.md` (it has the safe preview-then-publish steps). This skill explains the big picture; that one does the work.

Never show or repeat passwords, keys or codes, even if you find them in a file. If they need one, tell them to ask Andre.

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

### 1. Editing text, prices and posts (Keystatic)
- Go to **rhythmculture.com.au/keystatic** and log in with your GitHub account.
- You'll see **Pages**, **Blog posts** and **Shop products**. Click one, change the words, then **Save**.
- Saving on the main version publishes it: the live site updates about 2 minutes later.
- Want to check first? Make a branch (top left, name it `update/something`), save there, and ask Claude "show me my draft".
- **Try it:** open the Testimonials page in Keystatic and look around. Don't save anything.

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

### 5. The shop
- Products live in Keystatic under **Shop products** (price, description, photo, visible or hidden).
- Payments use **Stripe Payment Links**: each product has its own Stripe checkout link. Until a product has one, its button says **Enquire**.
- Setting up Stripe is done together with Andre in the onboarding session. Never make up a payment link or price.

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

### 9. Claude connectors (optional, set up together)
- Connectors let Claude read things like your Gmail or Google Drive when you ask ("summarise this week's enquiries", "draft a reply to Maddy").
- They're switched on in the Claude app's settings, one by one, and you approve each one. Set them up with Andre in the onboarding session; don't connect accounts you don't need.

## When it's a job for Andre

Explain why, and suggest they contact Andre (andre@hinterlandweb.com, 0461 546 818):
- Changing what a form asks or where it sends.
- The domain, DNS, email settings or hosting.
- The student video password.
- A page's web address, redirects, or anything that says "settings".
- Something looks broken after publishing (he can roll back to the previous version in a minute).

## Ending a tour stop

Finish each stop with one line: what they just learned, and "Want to see the next one?" Keep a light, friendly tone. They run a drumming business, not a software company.
