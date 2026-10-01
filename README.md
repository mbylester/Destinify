# Destinify

**Find your next Philippine escape.** Destinify is a destination-matching web app for the Philippines. Set your budget, travel style, and travel month, and it scores and ranks **500 destinations**, from crowd favorites to quiet corners few people visit, from Batanes to Tawi-Tawi.

It is a static front-end prototype: no build step, no backend, no API keys. Open it in a browser and it works.

> A system proposal by Huerto, Benlester N.

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

**Map**
- Leaflet map with clustered pins, colored by region and sized by popularity
- Street, terrain, and satellite layers
- Trip route drawn as a gold line

**Extras**
- Festivals and events calendar by month
- Catalog insights (breakdown by region, type, and season)
- Accounts with Traveler and Admin roles (demo, stored in the browser)
- Admin dashboard: add or hide destinations, view stats, download a CSV report
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

## Project structure

```
Destinify/
├── index.html          Page layout and script loading order
├── manifest.json       PWA manifest
├── sw.js               Service worker (network first, offline fallback)
└── assets/
    ├── style.css       Styles, light and dark themes
    ├── data.js         Destination catalog (500 rows)
    ├── details.js      Description, getting there, and tip per destination
    ├── images.js       Wikipedia photo loader and title overrides
    ├── app.js          Core logic: matching, cards, map, trip planner
    ├── features.js     Accounts, reviews, match weights, trip builder, admin
    ├── features2.js    Quiz, recommendations, calendar and print export, profile, PWA
    ├── features3.js    Photo gallery and live weather
    ├── features4.js    Drag-and-drop trips, day planner, heatmap, smarter picks
    ├── features5.js    Festivals calendar and favorites
    ├── icon-192.png
    └── icon-512.png
```

Scripts load in this order: `data.js`, `details.js`, `images.js`, `app.js`, then `features.js` to `features5.js`. Each feature file builds on the one before it, so keep that order.

---

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

## Demo accounts and admin

Accounts are **demo only** and live in the browser's `localStorage`. Passwords are hashed with SHA-256 before they are stored, but there is no server.

- Admin demo login: `admin` / `admin123`

If you deploy this publicly, change or remove the default admin account first. Anyone can read it in the source.

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
- Reviews, accounts, trips, and favorites are stored in your own browser, so they are not shared between devices.

---

## Roadmap

- Move accounts, reviews, and trips to a PHP/MySQL backend (each `localStorage` call in `features.js` maps to an endpoint)
- Fill in coordinates and details with checked, official sources
- Add more festivals and events
- Add more Mindanao destinations to balance the catalog
