# Emerson's Schedule — standalone app setup

This is a small standalone version of the tracker that lives on GitHub Pages
and saves data to a free Supabase database, so it works as a real app on
your iPhone (and any other device) with no manual git commits required for
day-to-day use. You'll only commit to the repo when the *code* changes —
not when your *data* changes.

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

## Setting up your own deployment from scratch

The steps below are for standing up a brand-new copy of this app (your own
Supabase project, your own GitHub Pages site) — skip these if you're just
running an already-configured copy locally (see above).

### 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (free tier is plenty for this).
2. Click **New Project**. Pick any name/region, set a database password
   (you won't need to remember it — just save it somewhere).
3. Wait ~1 minute for the project to finish provisioning.

### 2. Create the data table

In your Supabase project, open the **SQL Editor** (left sidebar) and run this:

```sql
create table schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  entry_date date not null,
  type text not null check (type in ('none','overnight','day-visit','both')),
  note text default '',
  updated_at timestamptz default now(),
  unique(user_id, entry_date)
);

alter table schedule_entries enable row level security;

create policy "Users can view own entries" on schedule_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on schedule_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on schedule_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on schedule_entries
  for delete using (auth.uid() = user_id);
```

**Already have this table from before `'none'` was a valid type?** Run this
once instead of recreating the table, so notes can be saved on days with
no visit type:

```sql
alter table schedule_entries
  drop constraint schedule_entries_type_check;

alter table schedule_entries
  add constraint schedule_entries_type_check
  check (type in ('none', 'overnight', 'day-visit', 'both'));
```

This creates the table and locks it down so only you (once signed in) can
ever see or change your own rows — nobody else, even with the public API
key, can read your data.

### 3. Turn on email sign-in

Supabase email OTP sign-in is on by default. The app uses the 6-digit
**code** flow (not the magic link), so under **Authentication → Email
Templates → Magic Link**, make sure the template includes `{{ .Token }}`
— that's what makes the 6-digit code actually show up in the email.

### 4. Get your API keys

In your Supabase project, go to **Settings → API**. You need two values:

- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon public** key (a long string)

Open [`src/services/supabaseService.js`](src/services/supabaseService.js)
and paste them in near the top:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

The anon key is safe to put in client-side code — it's meant to be public.
The row-level security policies from step 2 are what actually protect your
data, not keeping this key secret.

### 5. Push to GitHub and turn on Pages

This is a Vite + Vue app, so GitHub Pages needs to build it before serving
it — that's handled by the included GitHub Actions workflow at
`.github/workflows/deploy.yml`.

1. Create a new **private or public** GitHub repo (either is fine).
2. Push everything in this folder (`node_modules` and `dist` are
   gitignored, so `git add .` won't include them):
   ```bash
   git init
   git add .
   git commit -m "Emerson schedule tracker app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages** → under "Build and
   deployment", set **Source** to **"GitHub Actions"** (not "Deploy from a
   branch"). No further config needed — the workflow already runs `npm ci`,
   `npm run build`, and publishes `dist/` on every push to `main`.
4. Watch the **Actions** tab for the "Deploy to GitHub Pages" run to go
   green. After that, your app will be live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   (or your custom domain, if you have a `public/CNAME` file set up.)

### 6. Add it to your iPhone home screen

1. Open that URL in **Safari** on your iPhone (must be Safari, not Chrome).
2. Tap the **Share** icon → **Add to Home Screen**.
3. It'll now show up as an app icon and open full-screen, no browser bars.

### 7. Sign in

The first time you open it, enter your email and tap **Send sign-in
code** — you'll get an email with a 6-digit code. Enter it in the app and
tap **Verify code**, and you're in. (This whole flow stays inside the app,
which matters if you've added it to your iPhone home screen — a magic
*link* would hand off to Safari instead.) Your existing dates (the ones
already logged) will load in automatically the first time you sign in,
since they're built into the code as a one-time migration.

## Going forward

- **Data changes** (logging a new date, editing a note): saved instantly
  to Supabase, no commit needed, syncs across every device you sign into.
- **Code changes** (styling tweaks, new features): edit the files in
  `src/` and push to GitHub like normal; the GitHub Actions workflow
  rebuilds and redeploys Pages automatically in about a minute.
- If you want me to add new dates the way we've been doing in chat, just
  tell me — I'll update the `SEED_ENTRIES` block in
  `src/composables/useSchedule.js` and give you the updated file to
  commit. Everyone's existing saved data is untouched either way, since
  the migration only fills in dates that
  aren't already saved.
