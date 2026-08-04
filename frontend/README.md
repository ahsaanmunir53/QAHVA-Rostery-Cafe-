# QAHVA — Roastery & Café (Animated Demo Website)

A complete, fully animated coffee-shop website recreated from the reference video: public site + online ordering + admin dashboard.
React 18 + Vite + TypeScript + Tailwind frontend, Node/Express backend with a JSON-file database.

All branding, menu items, photos and reviews are original placeholders — built to be swapped for the client's real content.

---

## 1. Run it locally

Two terminals:

```bash
# Terminal 1 — backend (port 5003)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (port 5173)
npm install
npm run dev
```

Open **http://localhost:5173** · Admin panel: **http://localhost:5173/admin**

Production build: `npm run build` → static files in `dist/`.

---

## 2. The animations (matching the video)

Everything is real web animation — CSS keyframes + SVG, no video files, no heavy libraries:

- **Hero slider** — two auto-rotating moods like the video: the warm *"Celebrating the perfect cup"* slide and the gold *"Iced Luxe Collection"* slide, with clickable dots and crossfade.
- **Floating latte cup** — an SVG glass with layered coffee gradients, foam art, saucer and handle, gently bobbing; the iced version swaps foam for ice cubes.
- **Rising steam** — three blurred puffs looping above the hot cup.
- **Drifting coffee beans** — SVG beans floating and rotating across the hero, footer and order band.
- **Floating ice cubes + gold ribbons** — on the Iced Luxe slide and the gold band section.
- **Marquee announcement bar**, **shimmering headline text**, **pulsing glow on order buttons**, **count-up stats** in the story section, and **scroll-reveal** on every section.
- The whole set respects `prefers-reduced-motion` — animations switch off for users who ask for that.

A note on expectations: the reference video is an agency *motion render* (its text is AI-garbled filler), so a live website can't literally be that video — this build recreates its look and energy with genuine, performant web animation. When the client's real product photos are added (see §5), they slot straight in.

## 3. Admin panel

| | |
|---|---|
| URL | `/admin` |
| Username | `admin` |
| Password | `Qahva@Admin2026` |
| Reset key | `QV-8C31E5A9D274` (in `backend/.env`, used by "Forgot password") |

What the café can manage:

- **Dashboard** — orders today, pending / preparing / ready counts, monthly revenue, latest orders
- **Orders** — live board with the barista flow: *Accept & prepare → Mark ready → Complete* (or Cancel); filters and search
- **Menu** — add/edit/delete items, prices, tags (`new` / `bestseller`), homepage-featured toggle, and a one-click **Sold out today** switch that instantly blocks the item from being ordered
- **Gallery** — photos by URL (coffee-toned placeholder art shows until real photos exist)
- **Reviews** — add customer reviews, publish/hide
- **Messages** — contact-form inbox
- **Settings** — phone, WhatsApp, address, hours, **delivery fee**, **free-delivery threshold**, and a **pause online ordering** switch for closing time; plus change-password

Change the default password from **Settings** before handover.

## 4. Online ordering

- Cart drawer with quantity steppers, persistent across refreshes.
- **Pickup** (ready ~15 min, no fee) or **Delivery** (fee from Settings; free over the threshold; address required).
- The server recomputes every total — prices can't be tampered with from the browser.
- Sold-out items can't be ordered; quantities capped at 20; paused ordering returns a friendly notice.
- Success screen with an order reference and one-tap **WhatsApp tracking** button.
- Payment: cash at counter / cash on delivery (card note shown at checkout) — payment gateways can be added later.

## 5. Rebrand & real photos

- **`src/data/site.ts`** — café name, tagline, WhatsApp number, hero slide copy, story text, stats, footer blurb. One file rebrands the whole site.
- **Colors / fonts** — `tailwind.config.js` (espresso/cream/gold tokens) and the Google Fonts link in `index.html` (Playfair Display + Manrope).
- **Contact details, hours and delivery rules** come from admin **Settings** — the client edits them without touching code.
- **Photos** — every menu item and gallery slot has an image URL field in the admin; the moment a URL is added, the placeholder art is replaced. Broken URLs fall back to art automatically, so the site never shows a broken image.
- Replace the placeholder WhatsApp number `923000000000` (in `site.ts` and admin Settings) before showing the demo.

## 6. Data & reset

All data lives in `backend/data/*.json`, auto-seeded on first run (20 menu items across 5 categories, 6 reviews, 6 gallery slots, default settings). Delete the `data` folder to reset to factory state — the admin password re-seeds from `backend/.env`.
