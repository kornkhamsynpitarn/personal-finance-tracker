# Finance Tracker

A mobile-style personal finance tracker with dual currency (THB/MMK) support,
the 50/30/20 budgeting rule, manual daily exchange rates, and per-user login
with cloud-saved data (via Supabase).

## 1. Set up Supabase (handles login + storing your data)

1. Go to [supabase.com](https://supabase.com), sign up free, and create a new project.
2. Once it's ready, go to **SQL Editor > New query**, paste in the contents of
   `supabase-schema.sql` from this repo, and run it. This creates the table
   that stores your data and locks it so only you can read or write your own row.
3. Go to **Settings > API** and copy the **Project URL** and the **anon public** key.
4. In this project folder, copy `.env.example` to `.env` and paste those two
   values in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Email/password sign-up is on by default in Supabase, so there's nothing
   else to configure to get logging in working. (Supabase will email a
   confirmation link on sign-up — you can turn that off under
   **Authentication > Providers > Email** if you want instant sign-in while testing.)

## 2. Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173). You'll land on
a sign-up/sign-in screen; once you're in, everything you do is saved to your
Supabase project automatically, tied to your account.

## Put it on GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

Then create a new empty repo on GitHub (no README/license, so it stays empty),
and push:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

`.env` is git-ignored on purpose — your Supabase keys shouldn't be committed.

## Put it online (pick one)

**Vercel (easiest)**
1. Go to vercel.com, sign in with GitHub, click "Add New Project".
2. Select this repo. Vercel auto-detects Vite — click Deploy.
3. Before or after the first deploy, go to Project Settings > Environment
   Variables and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with
   the same values from your `.env`. Redeploy if you added them after.
4. You'll get a live URL, and it redeploys automatically on every push to `main`.

**Netlify**
1. "Add new site" → "Import an existing project" → pick this repo.
2. Build command: `npm run build`, publish directory: `dist`.
3. Add the same two environment variables under Site settings > Environment variables.
4. Deploy.

**GitHub Pages**
1. In `vite.config.js`, set `base: "/<your-repo-name>/"`.
2. `npm run build` (with `.env` present locally so the keys get baked in),
   then push the contents of `dist/` to a `gh-pages` branch.
3. Turn on Pages in the repo settings, pointing at that branch.
   Note: GitHub Pages has no server-side env var support, so the Supabase
   keys end up in the built JS bundle — that's expected and fine, since the
   anon key is meant to be public (it's the Row Level Security policies in
   `supabase-schema.sql` that actually keep everyone's data private, not
   secrecy of that key).

## About your data

Once logged in, every change auto-saves to your Supabase project (no manual
export needed) — but the **Export** buttons in the Currency tab are still
there if you want a local backup (JSON, or CSV for just the transaction
list). **Import** restores from one of those files, and **Clear all data**
wipes your account's saved data back to a blank slate.

