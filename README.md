# Emerson's Schedule — standalone app setup

This is a small standalone version of the tracker that lives on GitHub Pages
and saves data to a free Supabase database, so it works as a real app on
your iPhone (and any other device) with no manual git commits required for
day-to-day use. You'll only commit to the repo when the *code* changes —
not when your *data* changes.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (free tier is plenty for this).
2. Click **New Project**. Pick any name/region, set a database password
   (you won't need to remember it — just save it somewhere).
3. Wait ~1 minute for the project to finish provisioning.

## 2. Create the data table

In your Supabase project, open the **SQL Editor** (left sidebar) and run this:

```sql
create table schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  entry_date date not null,
  type text not null check (type in ('overnight','day-visit','both')),
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

This creates the table and locks it down so only you (once signed in) can
ever see or change your own rows — nobody else, even with the public API
key, can read your data.

## 3. Turn on email sign-in

Supabase email sign-in (magic link) is on by default. Optional but
recommended: in **Authentication → URL Configuration**, add the GitHub
Pages URL you'll get in step 5 as a **Redirect URL**, so the sign-in link
sends you back to the right place. You can come back and do this after
step 5 if it's easier.

## 4. Get your API keys

In your Supabase project, go to **Settings → API**. You need two values:

- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon public** key (a long string)

Open `index.html` in this folder and paste them in near the top of the
`<script>` section:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

The anon key is safe to put in client-side code — it's meant to be public.
The row-level security policies from step 2 are what actually protect your
data, not keeping this key secret.

## 5. Push to GitHub and turn on Pages

1. Create a new **private or public** GitHub repo (either is fine).
2. Add all the files from this folder (`index.html`, `manifest.json`,
   `sw.js`, `icon-192.png`, `icon-512.png`) to the repo and push:
   ```bash
   git init
   git add .
   git commit -m "Emerson schedule tracker app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages** → under "Build and
   deployment", set **Source** to "Deploy from a branch", branch `main`,
   folder `/ (root)`. Save.
4. After a minute, your app will be live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 6. Add it to your iPhone home screen

1. Open that URL in **Safari** on your iPhone (must be Safari, not Chrome).
2. Tap the **Share** icon → **Add to Home Screen**.
3. It'll now show up as an app icon and open full-screen, no browser bars.

## 7. Sign in

The first time you open it, enter your email and tap **Send sign-in
link** — you'll get an email with a one-time link. Tap it, and you're in.
Your existing dates (the ones already logged) will load in automatically
the first time you sign in, since they're built into the code as a
one-time migration.

## Going forward

- **Data changes** (logging a new date, editing a note): saved instantly
  to Supabase, no commit needed, syncs across every device you sign into.
- **Code changes** (styling tweaks, new features): edit the files and
  push to GitHub like normal; Pages redeploys automatically in about a
  minute.
- If you want me to add new dates the way we've been doing in chat, just
  tell me — I'll update the `SEED_ENTRIES` block in `index.html` and give
  you the updated file to commit. Everyone's existing saved data is
  untouched either way, since the migration only fills in dates that
  aren't already saved.
