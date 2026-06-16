# ALLEN Resource Hub 🧭

A clean, **trilingual (English / हिन्दी / தமிழ்)** navigation guide that puts **every official ALLEN Career Institute channel in one place** — websites, apps, YouTube channels, social media, free study material, scholarships, and helplines — so any student or parent knows exactly where to go. Defaults to English; one tap switches to हिन्दी or தமிழ். (Tamil is a primary audience — the whole interface, not just the links, is translated.)

> It is a single self-contained file. No build step, no server, no dependencies. Just open `index.html`.

## 🔗 Live now

- **Open the site:** https://yosoyun.github.io/allen-resource-hub/ — share this link with students, parents and your team.
- **Source / backup:** https://github.com/Yosoyun/allen-resource-hub

> Tip: send the link above on WhatsApp — it opens instantly on any phone, in English, हिन्दी or தமிழ்.

---

## What it does

- **One page, everything ALLEN** — official sites, apps, all YouTube channels, Instagram/Facebook/X/LinkedIn/Telegram/WhatsApp, free PYQs/sample papers/NCERT, TALLENTEX & ASAT, helplines and the centre locator.
- **English / हिन्दी / தமிழ் toggle** — a prominent, colour-coded language chooser; every label and description is translated in all three. The engine adds more languages easily (add a key to the `UI` object + `desc_<lang>`/`how_<lang>` fields).
- **"Where do I go?" helper** — a *Start Here* section + quick-path chips (JEE / NEET / Foundation / Olympiad / Parent) for people who feel lost.
- **Search + filters** — filter by audience (Student / Parent) and goal (JEE / NEET / Foundation / Olympiad / NTSE / Abroad), or just search.
- **Every link opens the real, official ALLEN page** in a new tab. Each card shows a verification badge.
- **Made to be shared** — the "Share" button copies the link; the whole thing is one file you can email or message to parents and your team.

## How to share it (3 easy ways)

1. **Send the file** — email or WhatsApp `index.html` to anyone. They open it in any browser, on any phone or laptop.
2. **Put it online for free (recommended)** — deploy to Vercel so you get a clean shareable link:
   ```bash
   npm i -g vercel        # one time
   cd "allen stuffs"
   vercel                 # follow prompts → you get a https://… link to share
   vercel --prod          # publish the production URL
   ```
   (Netlify, GitHub Pages, or any static host work the same way — just upload `index.html`.)
3. **Open locally** — double-click `index.html`. To preview with a tiny local server:
   ```bash
   cd "allen stuffs" && python3 -m http.server 8080   # then visit http://localhost:8080
   ```

## Updating the links

All content lives in the `window.CATALOG` object inside `index.html`, between the
`/* === CATALOG START === */` and `/* === CATALOG END === */` markers.

Each link is an item:
```js
{
  name:"ALLEN — Official Website",
  url:"https://www.allen.ac.in/",
  platform:"website",              // website | app | youtube | instagram | facebook | x | linkedin | telegram | whatsapp | phone | book | trophy
  desc_en:"…", desc_hi:"…", desc_ta:"…",   // shown text in each language
  how_en:"…",  how_hi:"…",         // optional "Tip: what to do there"
  audience:["student","parent"],    // who it's for
  streams:["jee","neet"],           // jee | neet | foundation | olympiad | ntse | abroad | general
  verified:true                     // green ✓ badge when confirmed live & official
}
```
Add an item to the relevant section's `items` array and it appears automatically.

## A note on ownership

This is a free, community-made navigation guide. Every link points to **ALLEN Career Institute's own official** websites and channels. "ALLEN" and related names are trademarks of ALLEN Career Institute. This page is **not** the official ALLEN website and is not affiliated with or endorsed by ALLEN — it simply helps people find ALLEN's official channels faster.

---

*Last reviewed: 2026-06-16 · Built to help students & parents.*
