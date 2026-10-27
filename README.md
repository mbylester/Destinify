# Destinify

**Find your next Philippine escape.** Destinify is a destination-matching web app for the Philippines. Set your budget, travel style, and travel month, and it scores and ranks **675 destinations**, from crowd favorites to quiet corners few people visit, from Batanes to Tawi-Tawi.

**Live site: [destinify.wuaze.com](https://destinify.wuaze.com/)**

Destinify is a web app built with plain HTML, CSS, and JavaScript, with no build step. It runs on its own as a static site, and it has an optional PHP and MySQL backend for real accounts, saved trips, reviews, email, and the admin tools. The live site runs with the backend on free PHP hosting.

**Contents:** [Features](#features) · [Run it locally](#run-it-locally) · [Deploy](#deploy) · [Project structure](#project-structure) · [Backend](#backend-php--mysql) · [Email](#email-password-reset-and-feedback) · [Accounts and admin](#accounts-roles-and-the-admin-console) · [Editing the data](#editing-the-data) · [Configuration](#configuration) · [Data notes](#data-notes-and-limits)

* * *

## Features

**Matching and discovery**

- Weighted match score (0 to 100%) based on destination type, activities, budget, trip length, and season
- Adjustable weights (defaults: 30 / 25 / 20 / 10 / 15), rescaled to 100%
- Preference quiz, "Surprise me", search, region and trip-length filters
- Tabs for All, Popular, Hidden gems, In season now, Favorites, and My trip
- "Near me" sorting using your location, plus sort by best match, lowest budget, shortest trip, A to Z, and top rated
- Side-by-side comparison of up to 3 destinations
- "Picked for you" recommendations based on your trip, places you viewed, and your own reviews

**Travel passport, home sections and quick start**

- **Travel passport:** mark a place with "I've been here", watch a counter like "12 of 675 places", and see every place you visited on a map. Open the passport to see your visited list, remove a place, or add places from all 675 with search, filters, and "Show more"
- **What's new** and **Trending this month** sections at the bottom of the home page, built from festivals, the season, and how often places are opened
- **Quick start:** a first-visit "What do you want to do?" panel with three big buttons (Beach, Hike, Culture and food) that shows picks right away
- **Near me:** the closest places to where you are, when you allow location
- Every card opens the full destination details from the home sections and from the passport
- Follows the site language (English or Filipino) and the light or dark mode

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

**Two color modes and two languages**

- **Basic mode** uses the Dawn Rose look: a soft peach-and-rose sunrise over Mayon, with plum text and magenta accents
- **Dark mode** uses the Golden Hour look: a glowing sunset scene, with cream text and gold accents
- The mode switch in the header remembers your choice. Buttons, chips, the map section, the chatbot, and search all follow the active mode
- A language toggle (EN / TL) switches the interface between English and Filipino

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

**Accounts and email**

- Accounts with Traveler and Admin roles, a profile with photo, and an admin console (see below)
- **Forgot password by email:** the Forgot password panel asks for the account's email and sends a private reset link that works once and lasts 1 hour
- **Feedback by email:** the Send feedback form is also emailed to the site owner automatically
- Review editing, admin analytics, and backups in the admin console

**Launch kit**

- Sunrise logo, favicon, app icons and social preview image; `robots.txt` and a friendly `404.html`
- My trip actions give clear feedback: optimize route, see on map, calendar (.ics), print, copy itinerary and share (native share sheet where available)
- Profile with photo upload and details (full name, email, phone, home city, bio, usual budget, favorite trip types) and a "use my preferences in search" button
- Admin console with Overview charts, destination search, add, edit and hide, review moderation, users, CSV exports, backup and restore, an activity log, and a deployment checklist
- About, Privacy, Terms and Send feedback in the footer, a first-visit tour, and an Install app link

**Map**

- Leaflet map with clustered pins, colored by region and sized by popularity
- Street, terrain, and satellite layers
- Trip route drawn as a gold line

**Extras**

- Festivals and events calendar by month
- Catalog insights (breakdown by region, type, and season)
- Responsive layout
- Installable PWA with offline fallback

* * *

## Run it locally

No install is needed, but the app must be served over HTTP (not opened as a `file://` page) so the service worker and API calls work.

**XAMPP:** copy the project folder into `htdocs` and open `http://localhost/Destinify/`. For accounts, reviews, and email, also set up the backend (see [Backend](#backend-php--mysql)).

**Python (static mode, no backend):**

```
python -m http.server 8000
```

Then open `http://localhost:8000/`.

* * *

## Deploy

Destinify can be deployed two ways.

### Option 1: Static hosting (GitHub Pages, Netlify, any web host)

Upload the project folder as it is. The site runs without a backend and keeps each visitor's accounts, trips, favorites and reviews in their own browser. It must be served over HTTPS for install, offline mode, location, and the copy buttons.

1. Push to GitHub, then **Settings > Pages** and choose the `main` branch.
2. Open the published address and hard refresh (Ctrl+Shift+R) the first time.

Email features and shared accounts need PHP and MySQL, so they do not work on static hosting.

### Option 2: PHP hosting with MySQL (what the live site uses)

This gives real shared accounts, the admin tools, and email. The live site at [destinify.wuaze.com](https://destinify.wuaze.com/) runs this way on free InfinityFree hosting, and any PHP and MySQL host works the same way.

1. **Create a hosting account** and a MySQL database. Note the database host, name, username, and password. On most shared hosts the host is not `localhost`.
2. **Import the database.** Export your local database from phpMyAdmin (or use the files in `database/`) and import it into the new one. If the import complains about `CREATE DATABASE`, export again without that statement.
3. **Upload the project** into the web root (usually `htdocs` or `public_html`) using the host's File Manager or an FTP client such as FileZilla. Do not upload `.git`, `backups`, or `database`. Delete any default `index` page the host created, and remove any ZIP you uploaded once it is extracted.
4. **Create the two config files on the server.** They are not in Git, because they hold passwords:
   - `api/config.php`: the database settings (copy from `api/config.sample.php`)
   - `api/f11_config.php`: database, site address, and email settings (see [Email](#email-password-reset-and-feedback))
5. **Set `site_url`** in `api/f11_config.php` to your real address, for example `https://destinify.wuaze.com/`, so reset links point to the live site.
6. **Check the backend.** Open `https://your-domain/api/health.php`. It should show `"ok":true` and the number of destinations.
7. **Make yourself admin** by running this in phpMyAdmin: `UPDATE users SET role='admin' WHERE username='yourusername';`
8. **Test everything on the live site:** sign in, create an account, the passport, "Near me" (needs HTTPS), and the Forgot password email.

**A note on new domains:** a brand-new address can take from a few minutes up to 72 hours before it opens on every network, because of DNS caching. If it does not open on one device, try another network or wait.

### Updating the live site

The live site does not update when you push to GitHub. After changing files:

1. Test the change on XAMPP first.
2. Upload only the changed files to the host. **Never overwrite `api/config.php` or `api/f11_config.php`** on the server, because your local copies hold local settings.
3. Raise the `?v=` number on the changed `<script>` and `<link>` lines in `index.html` (for example `features13.js?v=20261032`) so browsers load the new file.
4. Push to GitHub as your backup.

The live database and your local database are separate. Accounts and data created online stay online.

### Before you go live

- Open the Admin console, then **Reports and backup**, and follow the deployment checklist
- Set the feedback email (see [Configuration](#configuration))
- Read the About, Privacy and Terms text in `features10.js` and adjust it to your situation
- Confirm festival dates, fees and travel details you rely on with official sources

* * *

## Project structure

```
Destinify/
├── index.html          Page layout and script loading order
├── manifest.json       PWA manifest
├── sw.js               Service worker (network first, offline fallback)
├── robots.txt          Search engine rules
├── 404.html            Page not found
├── api/                PHP backend (MySQL and email)
├── database/           SQL files for the database
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
    ├── features10.js   Launch kit: trip actions, profile, admin console, feedback, tour, install
    ├── features11.js   Later additions: password reset requests, backups, admin analytics
    ├── features12.js   Later additions: review editing and other admin and account updates
    ├── features13.js   Travel passport, home sections, quick start, Near me, email forms
    ├── features13.css  Styles for the features13 sections
    ├── i18n.js         English and Filipino (EN / TL) language toggle
    ├── logo.svg        Destinify logo
    ├── og-image.png    Social preview image
    ├── apple-touch-icon.png
    ├── icon-192.png
    └── icon-512.png
```

Scripts load in this order: `data.js`, `details.js`, `images.js`, `app.js`, then `features.js` to `features13.js` (with `regions.js` after `features7.js`), and last `i18n.js`. Each feature file builds on the one before it, so keep that order.

* * *

## Backend (PHP + MySQL)

The site works two ways. With no backend (for example on GitHub Pages) it uses `data.js` and the browser's own storage. With the PHP backend running (on XAMPP or a PHP host) it switches to MySQL automatically, and the footer shows **Database: connected**.

**With the backend**

- Destinations, regions, TikTok flags and hidden places come from MySQL
- Real accounts with hashed passwords, and each user's trip and favorites are saved to the database
- Reviews are shared between users
- Admin actions (add a destination, hide or restore one) are saved to the database
- Password reset and feedback emails can be sent

**Set up on XAMPP**

1. Put the project in `C:\xampp\htdocs\Destinify`.
2. Copy `api\config.sample.php` to `api\config.php`. The defaults match a fresh XAMPP (user `root`, no password).
3. In phpMyAdmin, open **Import** and import `destinify.sql` from the `database` folder. It creates the `destinify_app` database.
4. Open `http://localhost/Destinify/api/health.php`. You should see `"ok":true` and the number of destinations.
5. Open `http://localhost/Destinify/`, then **Sign in**, then **Create account**.
6. To make yourself an admin, run this in phpMyAdmin: `UPDATE users SET role='admin' WHERE username='yourusername';`

`api/config.php` and `api/f11_config.php` hold passwords and are never uploaded to GitHub (keep both in `.gitignore`).

**API files** (`api/`): `bootstrap.php` (shared setup), `destinations.php`, `auth.php`, `state.php` (trip and favorites), `reviews.php`, `admin.php`, `health.php`, `regions_map.php`, `review_photo.php`, `track.php`, and `dump.php`. The email and passport features add `f11_lib.php` (database, rate limits, and a small SMTP mailer), `f11_password.php` (reset by email), `f11_feedback.php` (feedback by email), and `f11_track.php` (what is trending). They create their own tables (`f11_resets`, `f11_feedback`, `f11_views`, `f11_ratelimit`) the first time they run. The browser side is `assets/api-bridge.js`.

* * *

## Email: password reset and feedback

Email is sent with SMTP, for example a Gmail account with an App Password. Create `api/f11_config.php` like this and fill in your own values:

```php
<?php
return [
  'db' => ['host'=>'localhost','name'=>'destinify_app','user'=>'root','pass'=>''],
  'site_url' => 'http://localhost/Destinify/',   // your real address when live
  'smtp' => [
    'host'=>'smtp.gmail.com','port'=>587,'secure'=>'tls',
    'user'=>'you@gmail.com',
    'pass'=>'your-16-letter-app-password',
    'from_name'=>'Destinify',
  ],
  'admin_email' => 'you@gmail.com',   // where feedback arrives
  'find_user_sql'    => "SELECT u.id, u.username, p.email FROM users u JOIN user_profiles p ON p.user_id=u.id WHERE p.email=? LIMIT 1",
  'set_password_sql' => "UPDATE users SET password_hash=? WHERE id=?",
];
```

**Gmail App Password:** turn on 2-Step Verification on the sending account, then create an App Password at `myaccount.google.com/apppasswords`. Use that code as `smtp.pass`, never your normal password.

**How password reset works**

1. The visitor opens **Sign in**, then **Forgot password?**, and types the email on their account.
2. If an account uses that email, a private reset link is sent. It works once and expires in 1 hour. The reply is the same either way, so nobody can find out which emails have accounts.
3. The link opens the site and asks for a new password (at least 8 characters).

An account can only be reset by email if it has an email saved in its profile. Other accounts need the admin.

**Check these if email does not arrive:** the `find_user_sql` and `set_password_sql` lines match your table and column names, the App Password is correct, the Gmail account is the one that created it, and the host allows outgoing SMTP (some free hosts block it, and in that case a paid host or an email service is needed). Also check the spam folder.

* * *

## Accounts, roles and the admin console

Destinify has two roles, **Traveler** and **Admin**, and it stores accounts in one of two ways:

|                           | No backend (static hosting)                | With the PHP + MySQL backend                   |
|---------------------------|--------------------------------------------|------------------------------------------------|
| Accounts                  | Saved in the visitor's own browser         | Saved in MySQL, passwords hashed on the server |
| Trips, favorites, reviews | Saved per browser                          | Saved per account and shared across devices    |
| Admin                     | Built-in test admin for trying the console | Promote a real account (see Backend above)     |

**Traveler profile.** Photo upload, display name, full name, email, phone, home city, bio, usual budget and favorite trip types, with a button that applies those preferences to the search. With the backend, everything is saved to MySQL (the photo and details live in a `user_profiles` table that the API creates automatically), so a profile follows the account to any device. The email saved here is the one used for password reset.

**Admin console** (Admin button in the header)

- **Overview:** counts, breakdown charts by island group and type, top rated and most saved places, and recent admin activity
- **Destinations:** search, add, edit and hide or restore places
- **Reviews and feedback:** moderate reviews and read feedback
- **Users:** change roles and remove accounts
- **Reports and backup:** CSV exports (destinations, reviews, users), JSON backup and restore, and a deployment checklist
- **Feedback email:** the address that the footer's Send feedback form opens a message to, saved in the database

With the backend connected, adding and hiding destinations sync to MySQL. Editing built-in places, deleting reviews and managing other accounts are done in phpMyAdmin.

* * *

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

| Field       | Notes                                                                                              |
|-------------|----------------------------------------------------------------------------------------------------|
| group       | `L` Luzon and Palawan, `V` Visayas, `M` Mindanao                                                   |
| type        | Beach, Island, Mountain, Waterfall, Heritage, City, Diving, Surf, Cave, Lake, Nature, or Adventure |
| budget      | Approximate cost per person for the suggested stay, in PHP                                         |
| activities  | Space-separated codes (see below)                                                                  |
| popular     | `1` popular, `0` hidden gem                                                                        |
| best months | `start-end`, e.g. `11-4`. Optional, defaults to `11-5`                                             |

Activity codes: `sw` swimming, `sn` snorkeling, `dv` diving, `hk` hiking, `sf` surfing, `ih` island hopping, `ss` sightseeing, `cm` camping, `fd` food trip, `cv` caving, `kc` kayaking, `cw` culture walks, `wl` wildlife, `cy` canyoneering, `ad` adventure sports, `ph` photography, `rl` relaxation, `bk` cycling.

**Add new places at the end of the file.** Saved trips, favorites, passport marks, and reviews refer to a destination by its position in the list, so inserting rows in the middle would shift them.

### Add details (`assets/details.js`)

```
name|description|how to get there|tip
```

The name must match `data.js` exactly. Don't use `|` inside any field.

### Fix a photo (`assets/images.js`)

Photos load from Wikipedia at runtime. If a place shows the wrong picture, add its exact Wikipedia article title to `IMG_TITLES`, or point it to your own image in `IMG_URL`. Results are cached in the browser's `localStorage`.

### Add a festival (`assets/features5.js`)

Add a row to `FEST` with `n` (name), `d` (destination name exactly as in `data.js`), `m` (months, 1 to 12), `w` (when), and `x` (description). Festivals also feed the "What's new" section on the home page.

* * *

## Configuration

- **Feedback email (in the app):** in the Admin console, set the **Feedback email** so the footer's Send feedback form opens a message addressed to you. It is saved in the database. Leave it empty to turn it off.
- **Feedback email (in code):** at the top of `assets/features10.js`, `const CFG={contactEmail:""};` is the fallback when no backend is connected.
- **Automatic email:** `api/f11_config.php` (see [Email](#email-password-reset-and-feedback)) controls password reset emails and the automatic feedback email.
- **Cache version:** the `?v=` number on the script and style links in `index.html`. Raise it after changing a file so browsers load the new one.

* * *

## Built with

- Vanilla JavaScript, HTML, and CSS
- PHP and MySQL for the optional backend
- [Bootstrap 5.3](https://getbootstrap.com/)
- [Leaflet](https://leafletjs.com/) and Leaflet.markercluster
- [Open-Meteo](https://open-meteo.com/) for weather (no API key)
- Wikipedia and Wikimedia Commons for photos
- Fraunces and Work Sans from Google Fonts

* * *

## Data notes and limits

- Budgets, best months, coordinates, travel times, and festival dates are **approximate prototype data**, not official figures.
- Always confirm fees, permits, schedules, festival dates, and travel advisories with official sources (DOT, local tourism offices, PAGASA) before you travel.
- Photos belong to their authors and are used under their own Wikipedia and Wikimedia Commons licenses. A credit link is shown with each one.
- Without the backend, reviews, accounts, trips, favorites, passport marks and profile details are stored in your own browser, so they are not shared between devices.
- The travel passport is saved in the visitor's own browser, not on their account.
- Free hosting can be slower and may limit outgoing email.

* * *

## Roadmap

- Add admin endpoints to edit destinations and delete reviews when connected to the database
- Save the travel passport to the account so it follows the user across devices
- Fill in coordinates and details with checked, official sources
- Add more festivals and events
- Add more Mindanao destinations to balance the catalog
