# Finance Tracker

A mobile-style personal finance tracker with dual currency (THB/MMK) support,
the 50/30/20 budgeting rule, and manual daily exchange rates.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

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

## Put it online (pick one)

**Vercel (easiest)**
1. Go to vercel.com, sign in with GitHub, click "Add New Project".
2. Select this repo. Vercel auto-detects Vite — just click Deploy.
3. You'll get a live URL in about a minute, and it redeploys automatically
   every time you push to `main`.

**Netlify**
1. Go to netlify.com, "Add new site" → "Import an existing project" → pick this repo.
2. Build command: `npm run build`, publish directory: `dist`.
3. Deploy.

**GitHub Pages**
1. In `vite.config.js`, set `base: "/<your-repo-name>/"`.
2. `npm run build`, then push the contents of `dist/` to a `gh-pages` branch
   (or use the `gh-pages` npm package to automate this).
3. Turn on Pages in the repo settings, pointing at that branch.

## About your data

There's no backend, database, or login here — everything lives in the
browser tab while it's open. Use the **Export** buttons in the Currency tab
to save a backup (JSON, or CSV for just the transaction list), and
**Import** to load one back in. **Clear all data** wipes it back to a blank
slate. If you ever want accounts/login added back in, just ask.
