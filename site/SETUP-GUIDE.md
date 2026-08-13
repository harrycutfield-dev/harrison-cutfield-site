# Harrison Cutfield & Co — Website + CMS Guide
**Ray White CI · Luxury build · Self-managed content**

You now have a complete site **plus a free admin dashboard** where you log in and add listings, sold properties, reviews and team members through simple forms — no code, no touching HTML. This guide gets it live and shows the day-to-day.

---

## What you've got (the files)

```
index.html          ← the website (don't need to edit this by hand)
SETUP-GUIDE.md       ← this guide
/data/
   site.json         ← about text, stats, phone/email/office, socials
   listings.json     ← properties for sale
   sales.json        ← recently sold
   reviews.json      ← client testimonials
   team.json         ← your team
/admin/
   index.html        ← the CMS login page (yoursite.com/admin)
   config.yml        ← CMS settings (one line to edit before launch)
/images/uploads/     ← photos you upload via the CMS land here
```

The website reads everything from `/data`. The CMS edits `/data`. You only ever use the CMS.

---

## How it all fits together (30-second version)

1. Your files live in a **GitHub** repository (free).
2. **Cloudflare Pages** (or Netlify) watches that repo and publishes the live site (free).
3. You go to **yoursite.com/admin**, log in with GitHub, and edit content in forms.
4. Hitting **Publish** saves to GitHub → the site rebuilds in ~30 seconds. Done.

You do this setup **once**. After that it's just "log in → add listing → publish."

---

## One-time setup (about 20–30 minutes)

### Step 1 — Put the files on GitHub
1. Create a free account at **github.com**.
2. Click **New repository** → name it `harrison-cutfield-site` → keep it **Public** → Create.
3. On the repo page: **Add file → Upload files**, drag in everything from this folder (index.html, the `data`, `admin`, `images` folders, etc.), then **Commit**.

### Step 2 — Point the CMS at your repo
1. In the repo, open `admin/config.yml` → pencil icon to edit.
2. Change the `repo:` line to **your** username/repo, e.g. `repo: harrisoncutfield/harrison-cutfield-site`.
3. Commit the change.

### Step 3 — Publish the site with Cloudflare Pages (free)
1. Sign up at **dash.cloudflare.com** → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick your `harrison-cutfield-site` repo. Framework preset: **None**. Build command: **leave blank**. Output directory: **/** (root). Deploy.
3. You get a live URL like `harrison-cutfield-site.pages.dev`. (Netlify works the same way — drag-and-drop or connect Git.)

### Step 4 — Turn on CMS login (GitHub auth)
The CMS needs permission to save to GitHub. Easiest free route on Cloudflare:
1. On GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App.**
   - Homepage URL: your site URL.
   - Authorization callback URL: `https://<your-oauth-worker>/callback` (from the next step).
2. Deploy the small, free **Sveltia CMS Auth** Cloudflare Worker (one-click template — link in the Sveltia docs) and paste in your GitHub OAuth Client ID + Secret.
3. That's it — visiting `yoursite.com/admin` now offers "Login with GitHub."

> This auth step is the only fiddly part. If you'd like, I can walk you through it live on your screen — just say the word and I'll drive the browser with you.

### Step 5 — Connect your domain
1. Buy `harrisoncutfield.co.nz` (Cloudflare Registrar or any registrar, ~$30/yr).
2. In Cloudflare Pages → your project → **Custom domains → Set up a domain** → follow the wizard.

---

## Day-to-day: adding content

Go to **yoursite.com/admin** and log in. You'll see tabs down the side:

**Add a listing**
Listings → Featured Listings → **＋ Add Listing** → fill Address, Suburb, Price/display text, Method (For Sale / Auction / etc.), beds/baths/cars, upload a Photo → **Publish**. It appears on the site in under a minute.

**Add a sold property** — Recent Sales → Add → Address, Suburb, Sold date, Photo → Publish.

**Add a review** — Reviews → Add → paste the quote + client name → Publish.

**Add / edit team** — The Team → Add → Name, Role, Photo → Publish.

**Edit contact details, stats or about text** — Site & Contact → edit the fields → Publish. (Stats are the four big numbers on the dark band; About is the three paragraphs in the intro.)

To remove or reorder items, use the trash/drag handles next to each entry in the list. Same flow every time: edit → Publish.

---

## Previewing on your own computer first (optional)

Because the site loads data files, double-clicking `index.html` won't show the listings (browsers block local file loading). To preview properly, run a tiny local server:

1. Open Terminal in this folder.
2. Run: `python3 -m http.server 8000`
3. Visit `http://localhost:8000` in your browser.

(Once it's deployed online, everything just works — this is only for local previewing.)

---

## Adding photos — sizes that look best
- Hero background: 1920×1080
- Listing / sold photos: ~1200×800 (landscape)
- Team portraits: ~900×1200 (portrait)
- Your portrait (intro section): ~1000×1250

The hero image is the one thing still set in `index.html` — find `<div class="ph-hero"></div>` and swap it for `<img class="ph-hero" src="images/uploads/hero.jpg" alt="" style="object-fit:cover">`. (Happy to do this for you.)

---

## Ray White CI compliance — before you go public
- **Get sign-off** from your office manager / Ray White marketing that an independent "& Co" agent site is approved, and whether they require the official Ray White logo lockup (this build uses a temporary "H" mark — easy to swap once you have logo files).
- **Licensed agency name**: set it in the CMS under *Site & Contact → Licensed agency name* (it appears in the legal footer). Confirm the correct entity (e.g. CR Marketing North Shore Limited for Ray White Milford).
- Footer already links Privacy, Legal, REA and AML.

---

## Enquiry / appraisal emails — ALREADY WIRED
The contact form now emails enquiries to **harrison.cutfield@raywhite.com** with a copy to **harrycutfield@gmail.com**, using FormSubmit (no account needed).

**One-time activation:** the very first time the form is submitted on the live site, FormSubmit sends a confirmation email to harrison.cutfield@raywhite.com. Click the link in it once — after that, every enquiry arrives automatically. (To change recipients later, edit `ENQUIRY_TO` / `ENQUIRY_CC` near the bottom of `index.html`.)

## Property reels (sold-home videos)
Vertical 9:16 reels in the "Reels" section. In the CMS → **Reels → ＋ Add**, per reel you can EITHER:
- **Upload an MP4** (vertical, ideally < ~40MB) — it autoplays muted and loops, Instagram-style; or
- **Paste a YouTube/Vimeo link** (including Shorts) — shows a cover image with a play button, plays on click.
Add an optional cover image (recommended for link videos). Reorder/delete with the list controls.

## Off-Market listings (gated)
A dedicated "Off-Market" section sits behind an unlock gate:
- Visitors see the listings **frosted/blurred** with a form: Email (validated), Mobile (validated), property they own (optional), and buying timeframe (Now / 1–2 / 3–6 months / Longer).
- On submit, their details are **emailed to both your inboxes**, and the section **defrosts** so they can browse. Once unlocked it stays unlocked on that device.
- Unlocked listings are **filterable** by price, location, beds and bathrooms.
- Clicking a listing opens a **private-viewing request**: full name, email, phone (all validated), plus preferred day & time — emailed to you with the listing name attached.

Add/edit off-market homes in the CMS → **Off-Market**. Each is a list item with title, suburb, price (a number for the filter + a display version), beds/baths/cars, photo and a blurb.

**Important — privacy:** the off-market data lives in a public file, and client-side unlocking gates the *interface*, not the raw files (a technical visitor could view source). So treat these as **teasers**: title, suburb, price band, a lifestyle photo and a blurb — **not** the exact street address. Share the precise address privately when you reply to a viewing request. For listings that must stay fully confidential, don't publish identifying photos.

## Your photos
Two slots are wired: your **portrait** (About section + team card) = `images/uploads/harrison.jpg`, and the **hero background** = `images/uploads/hero.jpg`. Add them either by dropping the files into `images/uploads/` with those exact names, or via the CMS (Site & Contact → portrait / hero image).

---

*Design, branding, structure and the editing system are done. Your job: GitHub + Cloudflare once, get CI sign-off, then it's just "log in and publish." Want me to walk you through the live deploy on your screen, or drop in real North Shore photography first?*
