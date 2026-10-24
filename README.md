# Destinify

**Find your next Philippine escape.** Destinify is a destination-matching web app for the Philippines. Set your budget, travel style, and travel month, and it scores and ranks **675 destinations**, from crowd favorites to quiet corners few people visit, from Batanes to Tawi-Tawi.

Destinify is a deployable static web app for discovering destinations across the Philippines. It runs in the browser without a build step, and it can be served locally or deployed to a static host with optional PHP/MySQL support for saved accounts, trips, and admin features.


**Contents:** [Features](#features) · [Run it locally](#run-it-locally) · [Deploy](#deploy) · [Project structure](#project-structure) · [Backend](#backend-php--mysql) · [Accounts and admin](#accounts-roles-and-the-admin-console) · [Configuration](#configuration) · [Editing the data](#editing-the-data) · [Data notes](#data-notes-and-limits)

---

## Features

**Matching and discovery**
- Weighted match score (0–100%) based on destination type, activities, budget, trip length, and season
- Adjustable weights (defaults: 30 / 25 / 20 / 10 / 15), rescaled to 100%
- Preference quiz, "Surprise me", search, region and trip-length filters
- Tabs for All, Popular, Hidden gems, In season now, Favorites, and My trip
- "Near me" sorting using your location, plus sort by best match, lowest budget, shortest trip, A to Z, and top rated
- Side-by-side comparison of up to 3 destinations
- "Picked for you" recommendations based on your trip, places you viewed, and your own reviews

**Regions, starting point and TikTok**
- Filter by the 18 administrative regions, from NCR and CAR through Region I to Region XIII, MIMAROPA, NIR, and BARMM
- Pick where you are starting from (or use your location) and budgets are re-estimated, so a short trip from Antipolo to Manila costs less than the Metro Manila default. The minimum is ₱1,000
- A TikTok spots tab, a TikTok badge on cards, and photo tips and hashtags on the detail page
- Region and starting-point info, Google Maps and Directions buttons, and a "Know before you go" note on every detail page
- Every destination shows a picture: Wikipedia and Wikimedia Commons photos, then a generated illustration if none is found

**My trip, Favorites, and travel tips**
- My trip shows photos, region, cost, live weather, and travel time between stops. Drag to reorder, tap a stop to open it, and open directions
- A trip budget meter, a packing list built from your stops, calendar export, print, and share link
- Favorites has stats, filters (TikTok, beach and sea, nature, culture), sorting, and one-tap add to trip
- Travel tips has eight sections: best time, weather, money, getting around, an interactive packing checklist, safety and health, culture and food, and a regional cheat sheet

**Search and assistant**
- Search button in the header (also `Ctrl+K` or `/`) with live results across names, provinces, types, and activities, plus a region filter
- A "Search" button under the search field in the filter panel
- Chatbot (bottom-right) with a topics menu, voice input, and photo cards. It suggests places by budget, region, type, activity, or month, compares places, estimates costs, answers questions about food, money, safety, culture and transport, and plans a trip by days and budget. It runs in the browser from the catalog, so it needs no server or API key

**Two color modes**
- **Basic mode** uses the Dawn Rose look: a soft peach-and-rose sunrise over Mayon, with plum text and magenta accents
- **Dark mode** uses the Golden Hour look: a glowing sunset scene, with cream text and gold accents
- The switch in the header remembers your choice. Buttons, chips, the map section, the chatbot, and search all follow the active mode

**Destination pages**
- Photo gallery from Wikimedia Commons, with credits
- Live 5-day weather from Open-Meteo, and a "should I go this week?" verdict
- Best-month heatmap with typhoon-season markers
- Getting there, local tips, packing list, sample day-by-day plan, and nearby places
- Festivals and events for the destination
- Traveler reviews and ratings

**Trip planning**
- Cost estimate by number of travelers and travel style (Budget, Standard, Comfort)
- Route optimizer, drag-and-drop ordering, and rough travel-time estimates between stops
- Day-by-day planner with drag-and-drop and an overpacked-day warning
- Auto trip builder (give it days and a budget)
- Copy itinerary, share link, calendar export (`.ics`), and print itinerary

**Launch kit (v13)**
- New sunrise logo, favicon, app icons and social preview image; `robots.txt` and a friendly `404.html`
- My trip actions give clear feedback: optimize route, see on map, calendar (.ics), print, copy itinerary and share (native share sheet where available)
- Profile with photo upload and details (full name, email, phone, home city, bio, usual budget, favorite trip types) and a "use my preferences in search" button
- Admin console with Overview charts, destination search, add, edit and hide, review moderation, users, CSV exports, backup and restore, an activity log, and a deployment checklist
- About, Privacy, Terms and Send feedback in the footer, a first-visit tour, and an Install app link. Set `CFG.contactEmail` at the top of `assets/features10.js` to receive feedback by email

**Map**
- Leaflet map with clustered pins, colored by region and sized by popularity
- Street, terrain, and satellite layers
- Trip route drawn as a gold line

**Extras**
- Festivals and events calendar by month
- Catalog insights (breakdown by region, type, and season)
- Accounts with Traveler and Admin roles, a profile with photo, and an admin console (see below)
- Dark mode and responsive layout
- Installable PWA with offline fallback

---

## Run it locally

No install is needed, but the app must be served over HTTP (not opened as a `file://` page) so the service worker and API calls work.

**XAMPP:** copy the project folder into `htdocs` and open `http://localhost/Destinify/`.

**Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000/`.

---

## Deploy

**Static hosting (GitHub Pages, Netlify, any web host).** Upload the project folder as it is. The site runs without a backend and keeps each visitor's accounts, trips, favorites and reviews in their own browser. It must be served over HTTPS for install, offline mode and the copy buttons.

1. Push to GitHub, then **Settings > Pages** and choose the `main` branch.
2. Open the published address and hard refresh (Ctrl+Shift+R) the first time.

**PHP hosting with MySQL.** Upload the whole folder including `api/`, create the database from `database/destinify.sql`, and set `api/config.php` (see Backend). This gives real shared accounts and admin tools.

**Before you go live**
- Open the Admin console, then **Reports and backup**, and follow the deployment checklist
- Set `CFG.contactEmail` (see Configuration)
- Read the About, Privacy and Terms text in `features10.js` and adjust it to your situation
- Confirm festival dates, fees and travel details you rely on with official sources
- On Apache, keep the root `.htaccess`: it blocks `.git`, `database/`, `tools/` and `docs/`, and sends the security headers. After upload, check `https://yoursite/.git/HEAD` and `https://yoursite/database/destinify.sql` return 404
- Run `python tools/add_sri.py` once (needs internet). It pins the CDN scripts and styles with integrity hashes in `index.html`
- Set `'force_https_cookie' => true` in `api/config.php` on an HTTPS site
- The Content-Security-Policy in `index.html` (and `.htaccess`) lists the only sites the page may load from. If you add a new CDN, API or map tile source, add it there too, or the browser will block it

---

## Project structure

```
Destinify/
├── index.html          Page layout and script loading order
├── manifest.json       PWA manifest
├── sw.js               Service worker (network first, offline fallback)
├── robots.txt          Search engine rules
├── 404.html            Page not found
├── api/                PHP backend (MySQL)
├── database/           destinify.sql (fresh install) and upgrade.sql (existing database)
├── docs/               DATA_REVIEW.md: what was checked in the data, with sources
├── tools/              build_sql.py (builds the SQL) and check_data.py (data checks)
└── assets/
    ├── style.css       Styles, light and dark themes
    ├── theme.css       Basic (Dawn Rose) and Dark (Golden Hour) colors, loaded after style.css
    ├── data.js         Destination catalog (675 rows)
    ├── details.js      Description, getting there, and tip per destination
    ├── images.js       Wikipedia photo loader and title overrides
    ├── app.js          Core logic: matching, cards, map, trip planner
    ├── features.js     Accounts, reviews, match weights, trip builder
    ├── features2.js    Quiz, recommendations, calendar and print export, profile, PWA
    ├── features3.js    Photo gallery and live weather
    ├── features4.js    Drag-and-drop trips, day planner, heatmap, smarter picks
    ├── features5.js    Festivals calendar and favorites
    ├── features6.js    Global search and the travel chatbot
    ├── features7.js    Basic / Dark mode switch
    ├── regions.js      Regions, starting points, and the TikTok-famous list
    ├── features8.js    Region filter, starting-point budgets, TikTok spots, detail extras
    ├── features9.js    My trip, Favorites, and Travel tips upgrades
    ├── api-bridge.js   Connects the site to the PHP backend when it is available
    ├── stable-ids.js   Permanent destination ids (slugs), so saved data survives changes to data.js
    ├── features10.js   Launch kit: trip actions, profile, admin console, feedback, tour, install
    ├── logo.svg        Destinify logo
    ├── og-image.png    Social preview image
    ├── apple-touch-icon.png
    ├── icon-192.png
    └── icon-512.png
```

Scripts load in this order: `data.js`, `details.js`, `images.js`, `app.js`, then `features.js` to `features7.js`, `regions.js`, `features8.js`, and `features9.js`, then `features10.js`. Each feature file builds on the one before it, so keep that order.

---

## Backend (PHP + MySQL)

The site works two ways. With no backend (for example on GitHub Pages) it uses `data.js` and the browser's own storage. With the PHP backend running (for example on XAMPP) it switches to MySQL automatically, and the footer shows **Database: connected**.

**With the backend**
- Destinations, regions, TikTok flags and hidden places come from MySQL
- Real accounts with hashed passwords, and each user's trip and favorites are saved to the database
- Reviews are shared between users
- Admin actions are saved to the database: add, edit and hide destinations, delete reviews, change user roles, delete users, with an audit log
- Travelers can delete their own reviews

**Set up on XAMPP**
1. Put the `api` folder in `C:\xampp\htdocs\Destinify\api`.
2. Copy `api\config.sample.php` to `api\config.php`. The defaults match a fresh XAMPP (user `root`, no password).
3. In phpMyAdmin, open **Import** and import `database/destinify.sql`. It creates the `destinify_app` database with all destinations, regions and tables.
   - **Already have a database?** Import `database/upgrade.sql` instead. It adds the new columns, tables and destinations and keeps your users, reviews, favorites and trips. It is safe to run more than once.
4. Open `http://localhost/Destinify/api/health.php`. You should see `"ok":true` and the number of destinations. The page is public, so it shows nothing else.
5. Open `http://localhost/Destinify/`, then **Sign in**, then **Create account**.
6. To make yourself an admin, run this in phpMyAdmin: `UPDATE users SET role='admin' WHERE username='yourusername';`

`api/config.php` holds your database password and is listed in `.gitignore`, so it is not uploaded to GitHub. GitHub Pages cannot run PHP, so the live GitHub site stays in no-backend mode.

**Keeping the database in sync with `data.js`.** The SQL files are generated, so they cannot drift from the site's own data. After you edit `assets/data.js`, `details.js` or `regions.js`, run `python tools/build_sql.py` and import the new `database/upgrade.sql`. Existing destination ids are kept, so saved trips, favorites and reviews keep pointing at the same places.

**API files** (`api/`): `bootstrap.php` (shared setup), `destinations.php`, `auth.php`, `state.php` (trip and favorites), `reviews.php`, `admin.php`, `health.php`, and `regions_map.php`. The browser side is `assets/api-bridge.js`.

## Editing the data

### Add a destination (`assets/data.js`)

One destination per line, fields separated by `|`:

```
name|province|group|lat|lng|type|budget PHP|days|activities|popular|best months
```

Example:
```
Sagada|Mountain Province|L|17.084|120.901|Mountain|6200|3|hk cv cm|1|11-4
```

| Field | Notes |
|---|---|
| group | `L` Luzon and Palawan, `V` Visayas, `M` Mindanao |
| type | Beach, Island, Mountain, Waterfall, Heritage, City, Diving, Surf, Cave, Lake, Nature, or Adventure |
| budget | Approximate cost per person for the suggested stay, in PHP |
| activities | Space-separated codes (see below) |
| popular | `1` popular, `0` hidden gem |
| best months | `start-end`, e.g. `11-4`. Optional, defaults to `11-5` |

Activity codes: `sw` swimming, `sn` snorkeling, `dv` diving, `hk` hiking, `sf` surfing, `ih` island hopping, `ss` sightseeing, `cm` camping, `fd` food trip, `cv` caving, `kc` kayaking, `cw` culture walks, `wl` wildlife, `cy` canyoneering, `ad` adventure sports, `ph` photography, `rl` relaxation, `bk` cycling.

**Add new places at the end of the file.** Saved trips, favorites, and reviews refer to a destination by its position in the list, so inserting rows in the middle would shift them.

### Add details (`assets/details.js`)

```
name|description|how to get there|tip
```

The name must match `data.js` exactly. Don't use `|` inside any field.

### Fix a photo (`assets/images.js`)

Photos load from Wikipedia at runtime. If a place shows the wrong picture, add its exact Wikipedia article title to `IMG_TITLES`, or point it to your own image in `IMG_URL`. Results are cached in the browser's `localStorage`.

### Add a festival (`assets/features5.js`)

Add a row to `FEST` with `n` (name), `d` (destination name exactly as in `data.js`), `m` (months, 1–12), `w` (when), and `x` (description).

---

## Accounts, roles and the admin console

Destinify has two roles, **Traveler** and **Admin**, and it stores accounts in one of two ways:

| | No backend (static hosting) | With the PHP + MySQL backend |
|---|---|---|
| Accounts | Saved in the visitor's own browser | Saved in MySQL, passwords hashed on the server |
| Trips, favorites, reviews | Saved per browser | Saved per account and shared across devices |
| Admin | Built-in test admin for trying the console | Promote a real account (see Backend below) |

**Traveler profile.** Photo upload, display name, full name, email, phone, home city, bio, usual budget and favorite trip types, with a button that applies those preferences to the search. With the backend, everything is saved to MySQL (the photo and details live in a `user_profiles` table that the API creates automatically), so a profile follows the account to any device.

**Admin console** (Admin button in the header)
- **Overview:** counts, breakdown charts by island group and type, top rated and most saved places, and recent admin activity
- **Destinations:** search, add, edit and hide or restore places
- **Reviews and feedback:** moderate reviews and read feedback
- **Users:** change roles and remove accounts
- **Reports and backup:** CSV exports (destinations, reviews, users), JSON backup and restore, and a deployment checklist

With the backend connected, adding and hiding destinations sync to MySQL. Editing built-in places, deleting reviews and managing other accounts are done in phpMyAdmin.

---

## Configuration

At the top of `assets/features10.js`:

```js
const CFG={contactEmail:""};
```

Set `contactEmail` to receive messages from the **Send feedback** form by email. Leave it empty to keep feedback in the sender's browser only.

---

## Built with

- Vanilla JavaScript, HTML, and CSS
- [Bootstrap 5.3](https://getbootstrap.com/)
- [Leaflet](https://leafletjs.com/) and Leaflet.markercluster
- [Open-Meteo](https://open-meteo.com/) for weather (no API key)
- Wikipedia and Wikimedia Commons for photos
- Fraunces and Work Sans from Google Fonts

---

## Data notes and limits

- Budgets, best months, coordinates, travel times, and festival dates are **approximate prototype data**, not official figures.
- Always confirm fees, permits, schedules, festival dates, and travel advisories with official sources (DOT, local tourism offices, PAGASA) before you travel.
- Photos belong to their authors and are used under their own Wikipedia and Wikimedia Commons licenses. A credit link is shown with each one.
- Without the backend, reviews, accounts, trips, favorites and profile details are stored in your own browser, so they are not shared between devices.

---

## Stable destination ids

Every destination has a permanent id made from its name (for example `el-nido`, `paoay-church-and-dunes`). Trips, favorites, reviews, the day plan and share links are saved by that id, never by the place's position in `data.js`, so you can insert, reorder or delete rows without breaking anything people saved. Data saved by the older version (by position) is converted automatically the first time it is read, and an old numeric share link still opens.

- **Rename a place:** add the old id to `ALIASES` at the top of `assets/stable-ids.js`, for example `{"old-id":"new-id"}`.
- **Two places with the same name:** pin one id by hand in `PINNED`.
- A place removed from `data.js` is simply hidden, and reviews written for it are kept in case it comes back.
- With the backend, the database id is the permanent key.

## Data checks

`python tools/check_data.py` checks every row (structure, coordinates against GeoNames, budget outliers). `docs/DATA_REVIEW.md` lists what was verified against which source, what was corrected, and what could not be verified (budgets in particular are estimates, not official prices).

---

## Roadmap

- Check budgets and fees against official local sources for the most visited places
- Add `source` and `last reviewed` fields to each destination
- Review the 26 coastal places in PAGASA Type I areas whose best months run into June
- Add more festivals and events
- Add more Mindanao destinations to balance the catalog
