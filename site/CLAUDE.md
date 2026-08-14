# Cutfield & Co Website, working notes

## WRITING RULE, ABSOLUTE
NEVER use dashes in any writing, anywhere, ever. This means no em-dashes and no en-dashes (the long "," style dashes). Use commas, full stops, or the word "to" for ranges (e.g. "1 to 2 months") instead. Ordinary hyphens inside compound words are fine and expected (e.g. "off-market", "mid-century", "school-zoned"). This rule applies to every file: page copy, data JSON, the CMS config, guides, comments, and any new content created for Harrison.

## ORDERING RULE
Always present Featured Listings and Recent Sales sorted most expensive to least. The site does this automatically in index.html (sort by priceValue, falling back to any $ amount parsed from the price / sold detail). Keep this rule for any future listing or sales work.

## STANDING PHOTO RULE (ANY listing, sold, or off-market home, every time)
Whenever a home is added to or already on the website (listings.json, sales.json, offmarket.json):
1. CHECK FIRST: does it already have a local `gallery` (images/uploads/listings/<slug>/NN.jpg)? If yes and complete, leave it.
2. FIRST TIME (no photos / only an external or single cover): get the FULL photo set from VaultRE and add ALL of them, in the exact order they appear in Vault.
3. Host locally at images/uploads/listings/<slug>/01.jpg, 02.jpg, ... ; set `image` = 01.jpg (card cover) AND `gallery` = the full ordered list. Never rely on external CDN URLs (they expire).
4. The galleries cycle in the click-through popup on BOTH the home page (index.html, its own openDetail/pd-* carousel) and every sub-page (listings/sales/offmarket via detail.js) — so all presentations of every home are covered. If you touch the carousel JS, update BOTH index.html and detail.js.
5. If Vault genuinely has no photos for the home (some off-market/private), leave `image`/`gallery` empty so the "Photos to come" placeholder shows.
6. Drop pure marketing-banner graphics (filenames containing "banner") from galleries; keep floorplans.

### How to pull photos from Vault (no clicking needed — API pipeline)
Log into login.vaultre.com.au first (session expires). All same-origin, run from the browser console / Chrome MCP:
- Resolve address -> propertyid: GET `/cgi-bin/clientvault/ajax/ajaxglobalsearch.cgi?category=office&query=<addr>` -> options[].id (pick the record with the most photos; addresses can have duplicate prospect records).
- Get ordered filenames + count: GET `/cgi-bin/clientvault/property/ajaxdisplayphotosv2.cgi?propertyid=<id>&imageSize=small&isgrid=0` -> parse `small.<photoid>__<ts>-<seq>-<ORIGINALNAME>` in DOM order.
- Fire the export: POST `/cgi-bin/clientvault/property/ajaxdownloadphotos.cgi` body `propertyid=<id>&resolution=web` -> {isok:1}. Vault EMAILS a download link (full-res is email-only; the in-app CDN only serves 180px thumbs).
- The email (from noreply@vaultre.com.au, subject "Property photos for <addr>") links to a 1-hour signed S3 zip: `https://s3-ap-southeast-2.amazonaws.com/24hourclientvault/downloadphotos/<propertyid>-images-web.zip?AWSAccessKeyId=...&Expires=...&Signature=...`. The plaintext body is urldefense-mangled: decode ``->"=17", `*2B`->%2B, `*2F`->%2F, `*3D`->%3D.
- Fetch the zip (ctx_execute, server-side — no CORS), unzip, then map the zip's original filenames to the Vault display order to name them 01.jpg..NN.jpg.
Full method recorded in user memory `website_listing_photos`.


## Deploy / Netlify credit discipline
- Every push to GitHub auto-triggers a Netlify build, which costs build minutes.
- Do NOT push for every small change. Batch edits, preview locally first, then push ONCE.
- Local preview (free, no build): run `python3 build-preview.py` then open `_preview.html`
  in a browser. It embeds the data so it renders exactly like the live site with no server.
- Only after Harrison confirms the preview should changes be committed to GitHub.
- `_preview.html` is a local-only file. It does not need to be committed or deployed.

## Off-market homes workflow
When Harrison adds a private (off-market) sale home, he will name the property or give a link to its property info.
- Look up the property info (beds, baths, cars, suburb) on Relab, or research it from public records (homes.co.nz, oneroof, propertyvalue) when needed.
- Off-market cards show ONLY: photo, beds, baths, cars, suburb, price and method of sale (if a current listing). NEVER include the listing agent or any property description text.
- Photos: Harrison will give a link for the photos to add if there are any. If there are no photos, leave the image blank so the card shows the "Photos to come" placeholder (already built into the no-image cover in index.html and offmarket.html).
- Data lives in data/offmarket.json. Keep sorted most expensive to least (handled automatically).

## Property detail panel (click any listing / sale / off-market card)
Clicking a Featured Listing, Recent Sale, or off-market card opens a pop-up detail panel (openDetail in index.html). It reads an optional `detail` object on each item in data/listings.json, data/sales.json and data/offmarket.json:
- `detail.description`: a short prose blurb (follow the no-dashes rule).
- `detail.schools`: `{ "primary": "...", "intermediate": "...", "secondary": "..." }`.
- `detail.soldPrice` (sales only): e.g. "$1,430,000". If present, the panel shows "Sold for $X". If absent, it shows "Sold" plus a "Request sale price" button (Ray White does not publish prices, so leave soldPrice out unless Harrison confirms a figure that is OK to publish).
- `detail.floor` / `detail.land` / `detail.year` (optional): added as extra fact chips.

When a NEW listing or off-market home is added, research and fill in `detail` the same way:
1. School zones: web-search the suburb (e.g. "<suburb> Auckland school zone primary intermediate college") and record primary, intermediate and secondary. The panel already appends a caveat to confirm exact-address zoning at educationcounts.govt.nz, so suburb-level zones are fine.
2. Description: keep it honest and location-grounded (accommodation + suburb lifestyle + school value). Do NOT invent specific interior features that cannot be verified.
3. Sold price: only fill `detail.soldPrice` when Harrison confirms it is OK to publish; otherwise omit so the "Request sale price" button shows.
Known North Shore suburb school zones used so far: Forrest Hill = Forrest Hill School / Wairau Intermediate / Westlake Boys' & Girls'. Sunnynook = Sunnynook School / Wairau Intermediate / Westlake Boys' & Girls'. Campbells Bay & Browns Bay = (Campbells Bay or Browns Bay School) / Murrays Bay Intermediate / Rangitoto College. Greenhithe = Greenhithe School / Albany Junior High / Albany Senior High. Coatesville = Coatesville School / Albany Junior High / Albany Senior High. Hobsonville Point = Hobsonville Point Primary (Y1 to 8) / Hobsonville Point Secondary. Torbay = Torbay School / Northcross Intermediate / Long Bay College.

## Adding a live listing (data/listings.json)
A live listing is one entry in data/listings.json: `address`, `suburb` ("Suburb, North Shore"), `price` (e.g. "By Negotiation"), `method` (e.g. "For Sale"), `beds`, `baths`, `cars`, `image`, and a `detail` block (description + schools, plus optional floor/land/year chips). The page (listings.html) sorts and renders automatically; no HTML edit needed.
- Property facts: pull beds/baths/cars/floor/land/method from the VaultRE record (cars = garages + open parking spaces). Price stays "By Negotiation" unless Harrison says otherwise.
- Photos: see the STANDING PHOTO RULE below.
- Then run `python3 build-preview.py` and have Harrison open _preview.html before any push.

## Property reels, ABSOLUTE RULE: Harrison only
Every reel on the site must feature Harrison Cutfield ONLY. For any reel Harrison uploads (source files live in /Users/harrisoncutfield/Real Estate/listings/<address>/reel or /Reel):
- Cut out every on-camera moment of Drew Miller and any other agent or person, keeping only Harrison's segments plus the property footage and the Ray White end card.
- Harrison is the younger agent, dark hair, navy suit. Drew Miller is older, light tan/grey suit. Confirm identity against images/uploads/harrison-headshot.png if unsure, and check on-screen name captions.
- If a shot is a two-shot (Harrison standing next to another agent in the same frame), cut the whole shot, since the other person cannot be removed without losing Harrison too. Do not leave any frame containing another person.
- Also remove team/agent end cards that show other agents (e.g. the 3-agent "Drew Miller / Paige Field / Harrison Cutfield" card), even though it includes Harrison.
- Watch for background appearances (e.g. another agent seen through a window).

How to build a reel (matches the existing baltimore/beach-road/upper-harbour files):
1. Build a 1 fps labelled contact sheet to find which seconds contain people, then extract larger frames to classify Harrison vs others, then use scene detection (`select='gt(scene,0.25)'`) to get exact shot-cut times so cuts land on shot boundaries.
2. Cut with ffmpeg trim+concat, then scale to 720x1280, fps=30, format=yuv420p. Source reels are usually already 9:16 (1080x1920); if landscape, crop to 9:16.
3. Encode: `-c:v libx264 -preset veryfast -crf 28 -profile:v main -level 4.0 -x264-params keyint=60:min-keyint=60 -movflags +faststart -an` (no audio; reels autoplay muted and looped). Target roughly 7 to 9 MB.
4. Regenerate the poster jpg from a clean Harrison frame (720x1280) so the still never shows another agent.
5. Update data/reels.json (title, suburb, videoFile videos/<name>.mp4, poster videos/<name>.jpg). Videos live in the videos/ folder served at the site root, with /videos/* set to long-cache immutable in the _headers file.

## CR Group comparables (Compare tool)
- data/crgroup.json holds Ray White CR Group current listings + recent sales for the home page Compare tool, scraped from the Mairangi Bay & Milford office pages (rwmairangibay.co.nz/properties/residential-for-sale and /properties/sold-residential).
- No agent or description text. Ray White does not publish sale prices publicly, so recent sales show the sold date.
- Refresh periodically by re-scraping those office pages.

## Repo
- GitHub: harrycutfield-dev/harrison-cutfield-site (files nested under "Cutfield & Co Website/")
- Host: Netlify project "harrisoncutfield", live at harrisoncutfield.co.nz
