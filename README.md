# Emmy's Schedule — standalone app setup

This is a small standalone version of the tracker that lives on GitHub Pages
and saves data to a free Supabase database, so it works as a real app on
your iPhone (and any other device) with no manual git commits required for
day-to-day use..

## Stack

- **[Vue 3](https://vuejs.org)** (`<script setup>` Composition API) for the UI
- **[Vite](https://vitejs.dev)** for the dev server and production build
- **[Supabase](https://supabase.com)** for auth (email one-time-code
  sign-in) and data storage (Postgres, locked down with Row Level Security)
- Plain CSS, scoped per component — no CSS framework
- A minimal service worker (`public/sw.js`) just to make the app installable
  as a home-screen PWA; it doesn't cache anything for offline use, since the
  app needs a live connection to save data anyway
- **GitHub Actions** builds the app and deploys it to **GitHub Pages** on
  every push to `main`

## Project structure

```
index.html                    Vite entry point (mounts #app)
src/
  main.js                     App bootstrap, service worker registration
  App.vue                     Root component — auth gate + app shell
  style.css                   Global CSS variables and base styles
  components/
    AuthScreen.vue            Email + code sign-in screen
    StatsGrid.vue             Overnight / day-visit counters
    CalendarGrid.vue          Month view, day selection, legend
    EntryEditor.vue           Type picker + note field for the selected day
    RecentLog.vue             List of recent entries
  composables/
    useAuth.js                Session state; sign-in, verify, sign-out
    useSchedule.js             Schedule data, calendar state, save logic
  services/
    supabaseService.js         The only file that talks to Supabase
public/                       Static assets copied as-is into dist/
  manifest.json, sw.js, icon-*.png, CNAME
.github/workflows/deploy.yml  Builds and deploys to GitHub Pages
```

## Running locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

This starts a dev server (default `http://localhost:5173`). It talks to the
same Supabase project as the deployed app — the URL and anon key are
hardcoded in `src/services/supabaseService.js` — so signing in locally uses
the same live data as the real site. To point it at a different Supabase
project instead, edit `SUPABASE_URL` / `SUPABASE_ANON_KEY` in that file.

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # serve the built dist/ locally, to sanity-check a build
```
