# ⚔ FURSAN COMMUNITY — Gaming & Esports Platform

Production-ready full-stack website + admin command centre for **FURSAN COMMUNITY**,
a Moroccan gaming & esports collective (EST. 2020).

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 · React Router ·
**Supabase (PostgreSQL + Realtime)** via a swappable API layer (`src/lib/backend.ts`).

---

## ✨ What's inside

### 🚪 Identity gate
The whole site sits behind a **mandatory Discord connect** (Supabase Auth, PKCE flow).
Verified identity auto-fills and locks the application's Discord fields; approvals then
assign the program role + send the configured welcome DM to that exact account.

### Public site
| Page | URL | Highlights |
|---|---|---|
| Home | `/` | Custom canvas 3D hero (wireframe icosahedron, depth particles, mouse parallax), count-up stats, 6 feature cards, live program statuses, Founding Council (JOMALI · LADROOK · MURPHY · OGAMING093 · FERDA), ticker, CTA |
| Community | `/community` | Story, mission, 4 values, Darija quote, member life cards |
| Esports | `/esports` | 4 programs (EA FC, eFootball, Valorant, CS2) with **live** recruitment status, Apply-Now modal, Apply → Trial → Integrate → Represent journey |
| Esports Application | `/apply/esports` | Full 17-field validated form, Discord ID (16–22 digits) + age (13–99) validation, rate limiting, private ref `FUR-2026-XXXXXX`, professional success screen |

### Admin command centre — `/admin`
1. **Dashboard** — totals, recent applications, staff count, recruitment overview
2. **Applications (esports only)** — search, status/program filters, sort, pagination,
   full dossier, edit Discord User ID, private internal notes, approve/reject/pending, delete with confirm
3. **Esports Management** — edit every program's title/description/status → public pages update instantly
4. **Content Manager** — edit ALL visible text + upload logo/heroes/founder portraits (PNG/JPG/WebP/GIF, size+MIME validated)
5. **Staff Management** — add/edit/delete staff with roles, departments, permissions
6. **Discord Integration** — enable automation, Guild ID, **encrypted** bot token, role IDs per program,
   Test Connection, event log, setup guide. Approve ⇒ assign role via Discord API v10 ⇒ only mark
   approved after Discord confirms; failures keep the applicant unapproved; rejection never removes roles
7. **Settings** — name, invite, stats, server-online flag, socials, footer, **change admin password**

### Live sync (required behaviour)
Every save goes through `saveSiteState()` → Supabase `site_state` row → **Realtime
`postgres_changes` broadcast** → every connected visitor's UI re-merges state instantly
(the payload is applied directly, no extra round-trip). Applications stream the same way
on the `applications` table. **Not per-browser storage.**

**Anti-stale reads:** Supabase's Data API can edge-cache identical GET URLs, which used
to make reloads show content from minutes ago. Every read now appends a unique
always-true filter (`cacheNonce()`), so reads are *never* served from cache — what you
saved is exactly what appears after a reload. A last-known-good snapshot is also kept in
`localStorage` as an offline safety net.

The sync engine is hardened in three layers:
1. **Realtime websockets** with automatic self-healing (channels reconnect on drop/timeout).
2. **Lightweight polling fallback** (checks `updated_at` every 12 s) — works even if
   websockets are blocked by a network.
3. **Honest failures** — if a save can't reach the database, the admin UI shows an error
   and reverts the change instead of pretending it published.

The admin sidebar shows the live mode: `REALTIME · LIVE FOR ALL` / `POLLING FALLBACK` / `DB OFFLINE`.

**If edits don't appear for other visitors:**
- Re-run the SQL migration above — especially the two `alter publication supabase_realtime …` lines.
- In the Supabase dashboard: **Database → Replication** must include `site_state` and `applications`.
- RLS policies from the migration must exist (they allow the anon realtime reads).

---

## 🚀 Quick start

```bash
npm install
npm run dev        # local development
npm run typecheck  # TypeScript check
npm run build      # production build → dist/
```

## 🗄 Database setup (one time, ~2 minutes)

1. Open the [Supabase dashboard](https://supabase.com/dashboard) → your project
   (`cxaigbqsptxrqbuturge`) → **SQL Editor** → **New query**.
2. Paste the migration below and press **Run**.
3. Done — the app seeds the default admin account automatically on first load.

```sql
create table if not exists public.site_state (
  id         text primary key default 'default',
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id         text primary key,
  ref        text not null,
  type       text not null check (type in ('esports','ems','lspd')),
  program    text,
  status     text not null default 'pending'
             check (status in ('pending','approved','rejected')),
  data       jsonb not null default '{}'::jsonb,
  notes      text not null default '',
  discord    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_applications_created
  on public.applications (created_at desc);

alter table public.site_state   enable row level security;
alter table public.applications enable row level security;

drop policy if exists "site_state read"     on public.site_state;
drop policy if exists "site_state write"    on public.site_state;
drop policy if exists "applications read"   on public.applications;
drop policy if exists "applications insert" on public.applications;
drop policy if exists "applications update" on public.applications;
drop policy if exists "applications delete" on public.applications;

create policy "site_state read"     on public.site_state   for select using (true);
create policy "site_state write"    on public.site_state   for all    using (true) with check (true);
create policy "applications read"   on public.applications for select using (true);
create policy "applications insert" on public.applications for insert with check (true);
create policy "applications update" on public.applications for update using (true) with check (true);
create policy "applications delete" on public.applications for delete using (true);

alter publication supabase_realtime add table public.site_state;
alter publication supabase_realtime add table public.applications;
```

## 🚪 Discord login (mandatory site gate)

Every visitor must connect Discord before entering the site (real OAuth, no passwords).
The verified Discord ID is then stamped into applications, so approvals grant the role
and welcome DM to the exact right account. One-time setup (~5 min):

1. [Discord Developer Portal](https://discord.com/developers/applications) → your app → **OAuth2**:
   - Copy the **Client ID** and **Client Secret**.
   - Add this Redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. Supabase dashboard → **Authentication → Providers → Discord** → enable, paste the Client ID/Secret.
3. Supabase → **Authentication → URL Configuration → Redirect URLs** → add your site origin
   (e.g. `https://your-fursan-site.vercel.app`).
4. Done — the gate appears automatically. Users need a Discord account with a verified email.

The same Discord app's **bot** (invited with *Manage Roles*) powers role assignment +
welcome DMs — configure it in **Admin → Discord Integration**.

## 🔐 First admin login

1. Copy `.env.example` → `.env` (defaults already point at the project above).
2. Start the app, go to **/admin**, log in with:
   - **User:** `fursan` · **Pass:** `Fursan@2026` (or your `.env` overrides)
3. Immediately go to **Settings → Change Admin Password** and rotate it.

## 🛡 Security model (and honest limits of a static build)

- Passwords: salted, iterated SHA-256 (12 000 rounds) — never stored in plain text.
- Login + application submission are **rate-limited through the database**, so limits
  apply across browsers, not just per-tab.
- Discord bot token is encrypted (keyed keystream cipher with per-token salt/IV)
  before storage; the UI only ever shows a masked hint.
- All submitted fields are sanitised (control chars / markup stripped, length caps).
- Because this is a static Vite build there is **no server process**: sessions live in
  `sessionStorage` and RLS policies are open (Supabase publishable-key model).
  For full server-grade guarantees (HttpOnly cookies, bcrypt, secret-only token
  handling) swap `src/lib/backend.ts` internals for a small API (Next.js route
  handlers work 1:1 with the exported function signatures).

## 📦 Deployment

Any static host works — the built `dist/` is self-contained:

```bash
npm run build
# Netlify / Vercel / Cloudflare Pages: build command "npm run build", output "dist"
# SPA fallback: rewrite all routes → /index.html
```

## 📁 Architecture

```
src/
├─ lib/backend.ts          # swappable API layer: Supabase, crypto, validation, rate limits, Discord
├─ state/SiteContext.tsx   # site-wide state + Realtime live sync + defaults
├─ components/
│  ├─ CanvasHero.tsx       # dependency-free 3D engine (wireframe + particles + parallax)
│  ├─ ui.tsx               # custom SVG icon set, tilt cards, scramble text, reveals, badges
│  └─ chrome.tsx           # sticky HUD header + footer
├─ pages/                  # Home, Community, Esports, Apply (pure esports pipeline)
└─ pages/admin/            # login, dashboard, applications, content, staff, discord, settings
```

**DIMA FURSAN — built for the next generation.** ⚔
