# FURSAN COMMUNITY

A complete, production-grade website for **FURSAN COMMUNITY** — a Moroccan gaming,
esports and serious FiveM roleplay organisation (EST. 2020).

Premium cinematic identity · deep black `#050607` · dark navy `#0B1116` · metallic gold
`#D5A94F` · dark red `#8F1D18` · off-white `#F3EFE5` · Bebas Neue display + Barlow body.

---

## What's inside

### Public site
| Route | Description |
| --- | --- |
| `/` | Cinematic hero (EST. 2020, tagline, server-online indicator, large transparent logo), live stats, six feature pillars, program/department previews with **live recruitment status**, the five Founding Council premium cards, CTA |
| `/community` | Story, mission, four values (Respect · Discipline · Belonging · Progress), council quote, member-life cards, CTA — **no application form** |
| `/esports` | FIFA / EA FC, eFootball, Valorant, Counter-Strike programs with live **Open / Closed / Temporarily Closed** status, Apply Now modals for open programs, Apply → Trial → Integrate → Represent journey |
| `/ems` | San Andreas EMS — Patient First · Team Response · Clinical RP, editable requirements & rank structure, live status, application |
| `/lspd` | Los Santos PD — Professional Conduct · Proportionate Action · Story-Led Policing, editable requirements & rank structure, live status, application |
| `/apply/esports`, `/apply/ems`, `/apply/lspd` | Direct application URLs (esports also accepts `?program=Valorant`) |

Applications are validated (Discord User ID **16–22 digits**, age **13–99**, minimum
detail lengths, sanitised input), rate-limited (**3 submissions / 10 min per Discord ID**),
stored with a private reference like **`FUR-2026-123456`**, and end in a professional
success screen. Passwords and payment details are **never** requested.

### Admin (`/admin` → `/admin/dashboard`)
1. **Dashboard** — totals (total / pending / approved / rejected), staff count, recruitment overview, recent applications.
2. **Applications** — search, status & type filters, newest/oldest sort, pagination, full detail drawer, edit Discord User ID, private internal notes, Approve / Reject / Pending, delete with confirmation.
3. **Esports Management** — edit every program title, description and recruitment status; public pages update instantly.
4. **Departments** — EMS & LSPD titles, intros, requirements lists, rank structures, statuses.
5. **Website Content Manager** — every visible string on the site (heroes, buttons, stats, cards, community, esports, EMS, LSPD, founders, footer) with repeater editors.
6. **Image Manager** — logo, home/community/esports/EMS/LSPD heroes, founders image. PNG / JPG / WebP / GIF with MIME + 1.5 MB validation; transparent PNGs render natively (the logo is never boxed).
7. **Staff Management** — add / edit / delete staff with role, department and granular permissions.
8. **Discord Integration** — enable automation, Guild ID, **AES-256-GCM sealed bot token** (never returned to the browser), six role IDs, Test Connection, setup guide.
9. **Settings** — community name, Discord invite, member count, server online status, five social links, footer text, admin password change.

### Discord automation (API v10)
When an admin approves an application and automation is enabled, the API:
1. reads the applicant's numeric Discord User ID,
2. selects the configured role for that program/department,
3. `PUT /guilds/{guild}/members/{user}/roles/{role}` with the decrypted bot token,
4. **only then** marks the application Approved. On failure the application stays
   unapproved and the error is displayed. Rejection never removes roles.
The bot needs **Manage Roles**, and its role must sit **above** the assigned roles.

---

## Quick start

```bash
npm install
cp .env.example .env     # optional — defaults work out of the box
npm run dev              # local development
npm run build            # production build (dist/)
npm run typecheck        # TypeScript check
```

**Default admin login:** `admin` / `fursan2020` (from `.env` — change immediately in
*Settings → Change Admin Password* after first login).

## Architecture

This repository ships as a **Vite + React + TypeScript SPA** so it runs on any static
host with zero infrastructure. All "server" behaviour (auth, validation, rate limits,
storage, Discord calls) lives in an isolated API layer — `src/lib/api.ts` — that treats
the data store exactly like a remote database:

```
src/lib/db.ts          ← data store + tables (admins, admin_sessions, applications,
                          staff, games, departments, settings, discord, images,
                          content, rate_limits) — mirrors db/schema.sql
src/lib/api.ts         ← API layer: auth, rate limits, validation, CRUD, Discord v10
src/lib/crypto.ts      ← bcrypt password hashing + AES-GCM token sealing
src/lib/validation.ts  ← shared field specs & server-style re-validation
```

Security patterns implemented: bcrypt-hashed passwords (never stored in plaintext),
session tokens with expiry, sealed (encrypted-at-rest) Discord token that never leaves
the API layer, input sanitisation + strict validation on every write, login rate
limiting (5/10 min) and application rate limiting (3/10 min), and safe error messages
that leak no internals.

### Moving to a hosted backend (Next.js + PostgreSQL)
The schema is ready: **`db/schema.sql`** contains all eight tables plus indexes
(`admins`, `admin_sessions`, `applications`, `staff`, `games`, `departments`,
`settings`, `rate_limits`). To migrate:

1. Create a Neon/Supabase PostgreSQL database and run `db/schema.sql`.
2. Add Drizzle/Prisma and point it at `DATABASE_URL`.
3. Move each function in `src/lib/api.ts` into a server route (Next.js App Router
   `route.ts` handlers map 1:1 — signatures are already async and framework-free).
4. Replace the localStorage session token with an `HttpOnly, Secure, SameSite=Strict`
   cookie and the local vault key with a server-side `TOKEN_ENC_KEY` env var.
5. Move Discord calls fully server-side (also removes browser CORS limits).

Nothing in the UI changes — pages only talk to `api.*`.

## Deployment

**Static (Vercel / Netlify / GitHub Pages):** `npm run build`, publish `dist/`.
Set optional env vars in the host dashboard (`VITE_ADMIN_DEFAULT_USERNAME`,
`VITE_ADMIN_DEFAULT_PASSWORD`, `VITE_DISCORD_API_BASE`).

**Discord relay (recommended for production):** browser CORS can block direct
`discord.com/api` calls. Deploy any tiny proxy (Cloudflare Worker / Vercel Edge
function) that forwards requests to the Discord API, then set
`VITE_DISCORD_API_BASE` to its URL. With the Next.js migration above no relay is
needed at all.

## Notes

- Secrets: never commit a real `.env`. `.env.example` documents every variable.
- The FURSAN horse emblem (`public/images/logo.png`) is treated as sacred: it is
  always rendered transparent over dark surfaces (screen blend), never cropped,
  distorted or placed inside a white box — and admins can replace it any time.
- HashRouter is used so deep links (`/#/apply/ems`, `/#/admin`) work on any static
  host; switch to `BrowserRouter` when your host provides SPA rewrites.

**BUILT FOR THE NEXT GENERATION — الفُرسان**
