# QAHVA — what was broken and what changed

Ten files. Copy each one over the file at the same path in your project.
`backend/seeds.js` is new; the rest are replacements.

---

## Correction to the earlier version of this note

The first version of this fix told you to untrack `backend/data/` and claimed
the committed JSON matched the defaults in `server.js`. **That was wrong.** I
compared the item count (20 vs 20) and not the contents.

The committed files actually held:

- 20 menu items, each with its own Unsplash image URL — the code defaults had `image: ''`
- 6 gallery entries with real URLs — the code defaults had `url: ''`
- your real phone, WhatsApp and email — the code defaults had `+92 300 0000000` and `hello@qahva.pk`

Following that advice would have stripped every photograph off the site and
replaced your contact details with placeholders.

**Now fixed properly.** All of it has been moved into `backend/seeds.js`,
generated directly from the committed JSON, so it is preserved exactly and comes
back on every restart. Verified by comparing the live API response against the
original files field by field: menu, gallery, testimonials and all eight
settings match.

---

## Bug 1 — the menu never loaded

`frontend/.env` contained `VITE_API_URL=http://localhost:5003`.

Vite bakes environment variables into the bundle **at build time**, not at run
time. So the JavaScript shipped to every visitor asked *their own computer* for
the menu. Nobody has a coffee server running on their laptop, so the request
failed and the page stayed empty. On an `https://` site the browser blocks a
plain `http://` call anyway, before it even leaves the page.

**Fixed:** the API URL now defaults to empty, which means same-origin. The
backend already serves the frontend build, so `/api/menu` resolves correctly
wherever the site is hosted. `vite.config.ts` gained a dev proxy so
`npm run dev` still reaches `localhost:5003` locally.

Verified: `grep localhost:5003 dist/assets/*.js` → 0 matches.

## Bug 2 — the admin panel 401'd and bounced you out

Login tokens were stored in `backend/data/tokens.json`.

Free hosting tiers have an **ephemeral filesystem** — everything written to disk
is discarded on restart, spin-down and redeploy. And `tokens.json` was committed
to git, so on every boot it reverted to one long-dead token.

The loop this produced:

1. `Guard` checks `localStorage` → token is there → renders the dashboard
2. Dashboard calls `/api/admin/stats` → server checks the file → token gone → 401
3. Frontend redirects to `/admin`
4. `/admin` checks `localStorage` → token still there → redirects to dashboard
5. back to step 2, forever

**Fixed, both ends:**

- Server issues **stateless signed tokens** (HMAC-SHA256, payload + signature).
  Nothing is stored, so nothing can be lost. Expiry travels inside the token.
- The signing secret comes from `TOKEN_SECRET` if set, otherwise it is derived
  deterministically from the admin credentials — identical on every boot, so a
  session survives a restart either way.
- `api.ts` now calls `clearToken()` when the server returns 401, so a genuinely
  invalid token lands you on the login screen instead of the loop.

## Bug 3 — ADMIN_PASSWORD was being ignored

The seeding block was `if (!exists('admin'))`, and `backend/data/admin.json` was
committed to the repo. The file always existed, so the block never ran and the
password was whatever hash sat in git — no matter what you typed into the
hosting dashboard.

Two consequences: your env var did nothing, and a password hash plus its salt
were sitting in a public repository.

**Fixed:** the admin record now carries a fingerprint of the credentials it was
built from. On boot, if `ADMIN_USER`/`ADMIN_PASSWORD` don't match that
fingerprint, it re-seeds.

## Bug 4 — a dead server looked like a broken website

`apiGet` threw when the server was unreachable, and the calls in `Home.tsx` and
`Pages.tsx` had no `.catch()`. The rejection went unhandled and the visitor saw
a blank section with no explanation.

**Fixed:** `request()` catches network failure and returns `status: 0` instead of
throwing. The menu page now shows "The menu didn't load" with a Retry button.

## Also changed

- `app.listen(PORT, '0.0.0.0')` — container hosts can reject the default bind.
- `healthCheckPath: /api/health` added to `render.yaml`.
- `render.yaml` generates a `TOKEN_SECRET` automatically.
- Gallery and testimonial IDs are now fixed values instead of fresh random UUIDs
  on each boot, so links and admin edits stay stable across restarts.

---

## After you copy the files

```bash
git add .
git commit -m "Restore seed content; fix menu URL, admin 401 loop, ignored ADMIN_PASSWORD"
git push
```

Untracking `backend/data/` is **optional now** — the content is safe in
`seeds.js` either way. If you do want it untracked so runtime files stop
creating noisy diffs:

```bash
git rm -r --cached backend/data
```

That is safe *now*, and only now, because `seeds.js` carries the images.

Then set these in your hosting dashboard:

| Variable | Value |
|---|---|
| `ADMIN_USER` | `admin` |
| `ADMIN_PASSWORD` | something new — the old one is in your git history |
| `RESET_KEY` | something new, same reason |
| `TOKEN_SECRET` | any long random string |

## To change the site's content

Edit `backend/seeds.js`. That is now the source of truth for what the site looks
like after a restart. Changes made through the admin panel only last until the
next spin-down, because the disk is wiped.

## Two things to know

**Orders and messages do not survive a restart.** They're written to disk like
everything else, but unlike menu and settings they have no seed to come back
from. Fine for a demo, not fine for a real café. `db.js` is small enough that
swapping it for MongoDB Atlas is an afternoon's work.

**Your WhatsApp number won't open a chat.** It is stored as `03064709837`, and
the site builds `https://wa.me/03064709837`. WhatsApp needs international format
with no leading zero — `923064709837`. I left it exactly as you had it rather
than changing it without asking, but a client clicking that button today gets an
error page. One line in `seeds.js` fixes it.
