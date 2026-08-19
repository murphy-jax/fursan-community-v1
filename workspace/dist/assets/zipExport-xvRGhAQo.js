import{a4 as ye,a5 as De}from"./index-DGzoVsc1.js";const Re=`# ──────────────────────────────────────────────────────────────
# FURSAN COMMUNITY — environment template
# Copy to \`.env\` and adjust. Never commit a real \`.env\` file.
# ──────────────────────────────────────────────────────────────

# First-launch admin account. The password is bcrypt-hashed before storage and
# should be changed afterwards in Admin → Settings → Change Admin Password.
VITE_ADMIN_DEFAULT_USERNAME=admin
VITE_ADMIN_DEFAULT_PASSWORD=fursan2020

# Optional: URL of a tiny server-side relay that forwards requests to the
# Discord API (browsers can block direct cross-origin bot calls via CORS).
# Example: https://fursan-discord-relay.yourdomain.com  (proxies → https://discord.com/api/v10)
# Leave empty to call https://discord.com/api/v10 directly.
VITE_DISCORD_API_BASE=

# ──────────────────────────────────────────────────────────────
# When migrating to the hosted backend (Next.js + PostgreSQL, see README):
# DATABASE_URL=postgres://user:pass@host/fursan
# SESSION_SECRET=64-random-bytes
# TOKEN_ENC_KEY=32-random-bytes      # AES-256-GCM key sealing the Discord token
# DISCORD_CLIENT_ID=
# DISCORD_BOT_TOKEN=                 # server-only, never shipped to the browser
# ──────────────────────────────────────────────────────────────
`,Le=`# FURSAN COMMUNITY

A complete, production-grade website for **FURSAN COMMUNITY** — a Moroccan gaming,
esports and serious FiveM roleplay organisation (EST. 2020).

Premium cinematic identity · deep black \`#050607\` · dark navy \`#0B1116\` · metallic gold
\`#D5A94F\` · dark red \`#8F1D18\` · off-white \`#F3EFE5\` · Bebas Neue display + Barlow body.

---

## What's inside

### Public site
| Route | Description |
| --- | --- |
| \`/\` | Cinematic hero (EST. 2020, tagline, server-online indicator, large transparent logo), live stats, six feature pillars, program/department previews with **live recruitment status**, the five Founding Council premium cards, CTA |
| \`/community\` | Story, mission, four values (Respect · Discipline · Belonging · Progress), council quote, member-life cards, CTA — **no application form** |
| \`/esports\` | FIFA / EA FC, eFootball, Valorant, Counter-Strike programs with live **Open / Closed / Temporarily Closed** status, Apply Now modals for open programs, Apply → Trial → Integrate → Represent journey |
| \`/ems\` | San Andreas EMS — Patient First · Team Response · Clinical RP, editable requirements & rank structure, live status, application |
| \`/lspd\` | Los Santos PD — Professional Conduct · Proportionate Action · Story-Led Policing, editable requirements & rank structure, live status, application |
| \`/apply/esports\`, \`/apply/ems\`, \`/apply/lspd\` | Direct application URLs (esports also accepts \`?program=Valorant\`) |

Applications are validated (Discord User ID **16–22 digits**, age **13–99**, minimum
detail lengths, sanitised input), rate-limited (**3 submissions / 10 min per Discord ID**),
stored with a private reference like **\`FUR-2026-123456\`**, and end in a professional
success screen. Passwords and payment details are **never** requested.

### Admin (\`/admin\` → \`/admin/dashboard\`)
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
3. \`PUT /guilds/{guild}/members/{user}/roles/{role}\` with the decrypted bot token,
4. **only then** marks the application Approved. On failure the application stays
   unapproved and the error is displayed. Rejection never removes roles.
The bot needs **Manage Roles**, and its role must sit **above** the assigned roles.

---

## Quick start

\`\`\`bash
npm install
cp .env.example .env     # optional — defaults work out of the box
npm run dev              # local development
npm run build            # production build (dist/)
npm run typecheck        # TypeScript check
\`\`\`

**Default admin login:** \`admin\` / \`fursan2020\` (from \`.env\` — change immediately in
*Settings → Change Admin Password* after first login).

## Architecture

This repository ships as a **Vite + React + TypeScript SPA** so it runs on any static
host with zero infrastructure. All "server" behaviour (auth, validation, rate limits,
storage, Discord calls) lives in an isolated API layer — \`src/lib/api.ts\` — that treats
the data store exactly like a remote database:

\`\`\`
src/lib/db.ts          ← data store + tables (admins, admin_sessions, applications,
                          staff, games, departments, settings, discord, images,
                          content, rate_limits) — mirrors db/schema.sql
src/lib/api.ts         ← API layer: auth, rate limits, validation, CRUD, Discord v10
src/lib/crypto.ts      ← bcrypt password hashing + AES-GCM token sealing
src/lib/validation.ts  ← shared field specs & server-style re-validation
\`\`\`

Security patterns implemented: bcrypt-hashed passwords (never stored in plaintext),
session tokens with expiry, sealed (encrypted-at-rest) Discord token that never leaves
the API layer, input sanitisation + strict validation on every write, login rate
limiting (5/10 min) and application rate limiting (3/10 min), and safe error messages
that leak no internals.

### Moving to a hosted backend (Next.js + PostgreSQL)
The schema is ready: **\`db/schema.sql\`** contains all eight tables plus indexes
(\`admins\`, \`admin_sessions\`, \`applications\`, \`staff\`, \`games\`, \`departments\`,
\`settings\`, \`rate_limits\`). To migrate:

1. Create a Neon/Supabase PostgreSQL database and run \`db/schema.sql\`.
2. Add Drizzle/Prisma and point it at \`DATABASE_URL\`.
3. Move each function in \`src/lib/api.ts\` into a server route (Next.js App Router
   \`route.ts\` handlers map 1:1 — signatures are already async and framework-free).
4. Replace the localStorage session token with an \`HttpOnly, Secure, SameSite=Strict\`
   cookie and the local vault key with a server-side \`TOKEN_ENC_KEY\` env var.
5. Move Discord calls fully server-side (also removes browser CORS limits).

Nothing in the UI changes — pages only talk to \`api.*\`.

## Deployment

**Static (Vercel / Netlify / GitHub Pages):** \`npm run build\`, publish \`dist/\`.
Set optional env vars in the host dashboard (\`VITE_ADMIN_DEFAULT_USERNAME\`,
\`VITE_ADMIN_DEFAULT_PASSWORD\`, \`VITE_DISCORD_API_BASE\`).

**Discord relay (recommended for production):** browser CORS can block direct
\`discord.com/api\` calls. Deploy any tiny proxy (Cloudflare Worker / Vercel Edge
function) that forwards requests to the Discord API, then set
\`VITE_DISCORD_API_BASE\` to its URL. With the Next.js migration above no relay is
needed at all.

## Notes

- Secrets: never commit a real \`.env\`. \`.env.example\` documents every variable.
- The FURSAN horse emblem (\`public/images/logo.png\`) is treated as sacred: it is
  always rendered transparent over dark surfaces (screen blend), never cropped,
  distorted or placed inside a white box — and admins can replace it any time.
- HashRouter is used so deep links (\`/#/apply/ems\`, \`/#/admin\`) work on any static
  host; switch to \`BrowserRouter\` when your host provides SPA rewrites.

**BUILT FOR THE NEXT GENERATION — الفُرسان**
`,Me=`-- ============================================================
-- FURSAN COMMUNITY — database schema · first migration
-- PostgreSQL 15+ (Neon / Supabase compatible)
-- Run:  psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                 -- bcrypt, cost 10
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions (expires_at);

CREATE TYPE app_type   AS ENUM ('esports', 'ems', 'lspd');
CREATE TYPE app_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE recruit    AS ENUM ('open', 'closed', 'temp');

CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         TEXT NOT NULL UNIQUE,            -- e.g. FUR-2026-123456
  type        app_type NOT NULL,
  program     TEXT,                            -- esports program title
  program_id  TEXT,                            -- maps to games.id / department id
  status      app_status NOT NULL DEFAULT 'pending',
  data        JSONB NOT NULL,                  -- sanitised applicant answers
  notes       TEXT NOT NULL DEFAULT '',        -- private staff notes
  discord_role_id   TEXT,
  discord_assigned_at TIMESTAMPTZ,
  discord_last_error  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_type   ON applications (type);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);

CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL,
  discord     TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL,
  department  TEXT NOT NULL DEFAULT 'Community',
  permissions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS games (
  id          TEXT PRIMARY KEY,                -- fifa | efootball | valorant | cs
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      recruit NOT NULL DEFAULT 'closed',
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS departments (
  id           TEXT PRIMARY KEY,               -- ems | lspd
  name         TEXT NOT NULL,
  tagline      TEXT NOT NULL DEFAULT '',
  intro        TEXT NOT NULL DEFAULT '',
  requirements JSONB NOT NULL DEFAULT '[]',    -- ["At least 16 years old", ...]
  ranks        JSONB NOT NULL DEFAULT '[]',    -- [{"title":"Recruit","desc":"..."}]
  status       recruit NOT NULL DEFAULT 'closed'
);

-- Single-row tables for global configuration (row id = 'default').
CREATE TABLE IF NOT EXISTS settings (
  id             TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'FURSAN COMMUNITY',
  discord_invite TEXT NOT NULL DEFAULT '',
  member_count   INT NOT NULL DEFAULT 0,
  server_online  BOOLEAN NOT NULL DEFAULT TRUE,
  socials        JSONB NOT NULL DEFAULT '{}',
  footer_text    TEXT NOT NULL DEFAULT '',
  discord_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  discord_guild_id TEXT,
  discord_token_enc TEXT,                      -- AES-256-GCM sealed, server-side key
  discord_roles  JSONB NOT NULL DEFAULT '{}',  -- {fifa, efootball, valorant, cs, ems, lspd}
  content        JSONB NOT NULL DEFAULT '{}',  -- all editable website copy
  images         JSONB NOT NULL DEFAULT '{}'   -- storage object paths / URLs
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT NOT NULL,                    -- e.g. login:admin, apply:esports:2451…
  ts         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key, ts)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ts ON rate_limits (ts);

-- ============================================================
-- Seed: programs & departments (password hash inserted by the
-- server bootstrap from environment variables — never hardcoded)
-- ============================================================
INSERT INTO games (id, title, status, sort_order) VALUES
  ('fifa',      'FIFA / EA FC',   'open',   1),
  ('efootball', 'eFootball',      'temp',   2),
  ('valorant',  'Valorant',       'open',   3),
  ('cs',        'Counter-Strike', 'closed', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, name, tagline, status) VALUES
  ('ems',  'San Andreas EMS',              'Patient First. Always.',            'open'),
  ('lspd', 'Los Santos Police Department', 'Serve the story. Protect the city.', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
`,Pe=`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="FURSAN COMMUNITY — Moroccan gaming, esports and serious FiveM roleplay organisation. EST. 2020." />
    <meta name="theme-color" content="#050607" />
    <link rel="icon" type="image/png" href="https://image.qwenlm.ai/generated-images/b14a9796-903b-4066-a8af-a7c49182d49d/_result.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Barlow+Condensed:wght@500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>FURSAN COMMUNITY — Moroccan Gaming, Esports & FiveM Roleplay</title>
    <style>
      html, body { margin: 0; padding: 0; background-color: #050607; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"><\/script>
  </body>
</html>
`,Oe=`{
  "name": "sandbox-workspace",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@supabase/supabase-js": "^2.98.0",
    "@types/bcryptjs": "^2.4.6",
    "bcryptjs": "^3.0.3",
    "canvas-confetti": "^1.9.3",
    "date-fns": "^2.30.0",
    "framer-motion": "^11.16.1",
    "jszip": "^3.10.1",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "recharts": "^2.10.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.7",
    "@types/canvas-confetti": "^1.6.4",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.7",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.7.0",
    "vite": "^6.3.5"
  }
}
`,Fe=`import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./components/ui";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Esports from "./pages/Esports";
import Department from "./pages/Department";
import Apply from "./pages/Apply";
import AdminLogin from "./pages/admin/AdminLogin";
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Download = lazy(() => import("./pages/Download"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-ink text-bone font-body">
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-gold">
            <span className="font-cond uppercase tracking-[0.3em] text-xs animate-pulse">Loading…</span>
          </div>
        }
      >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/esports" element={<Esports />} />
        <Route path="/ems" element={<Department slug="ems" />} />
        <Route path="/lspd" element={<Department slug="lspd" />} />
        <Route path="/apply/:kind" element={<Apply />} />
        <Route path="/download" element={<Download />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <ScrollToTop />
          <Shell />
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
`,Be=`import { useMemo, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../lib/api";
import { fieldsFor, validateApplication, type FieldSpec } from "../lib/validation";
import type { AppType } from "../lib/db";
import { Btn, Field, IconCheck, IconLock, Modal, Select, TextArea, TextInput, useToast } from "./ui";

const KIND_META: Record<AppType, { title: string; sub: string }> = {
  esports: { title: "FURSAN Esports Application", sub: "One application per program. Coaches reply within 72 hours." },
  ems: { title: "San Andreas EMS Application", sub: "Whitelist intake for the medical division. Chiefs review every file." },
  lspd: { title: "Los Santos PD Application", sub: "Whitelist intake for the metropolitan division. Command reviews every file." },
};

function FieldInput({ spec, value, error, onChange, programOptions }: {
  spec: FieldSpec;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  programOptions?: string[];
}) {
  if (spec.type === "select") {
    const options = spec.key === "program" ? programOptions ?? [] : spec.options ?? [];
    return (
      <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
        <Select value={value} error={!!error} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>
      </Field>
    );
  }
  if (spec.type === "textarea") {
    return (
      <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
        <TextArea
          rows={spec.rows ?? 4}
          placeholder={spec.placeholder}
          value={value}
          error={!!error}
          maxLength={spec.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }
  return (
    <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
      <TextInput
        type={spec.type === "number" ? "number" : "text"}
        placeholder={spec.placeholder}
        value={value}
        error={!!error}
        maxLength={spec.maxLength}
        min={spec.min}
        max={spec.max}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function ApplicationForm({ kind, presetProgram, onFinished }: {
  kind: AppType;
  presetProgram?: string;
  onFinished?: () => void;
}) {
  const { db } = useApp();
  const { push } = useToast();
  const specs = useMemo(() => fieldsFor(kind), [kind]);
  const programOptions = useMemo(() => db.games.map((g) => g.title), [db.games]);
  const openPrograms = useMemo(() => db.games.filter((g) => g.status === "open").map((g) => g.title), [db.games]);

  const [data, setData] = useState<Record<string, string>>(() => ({
    program: presetProgram && openPrograms.includes(presetProgram) ? presetProgram : "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const set = (k: string, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  if (kind === "esports" && openPrograms.length === 0 && !ref) {
    return (
      <div className="p-8 text-center">
        <p className="font-display text-2xl tracking-wide mb-2">RECRUITMENT PAUSED</p>
        <p className="text-ash">All esports programs are currently closed. Follow the Discord — openings are announced there first.</p>
      </div>
    );
  }

  if (ref) {
    return (
      <div className="p-8 sm:p-10 text-center">
        <div className="mx-auto w-16 h-16 cut-sm bg-emerald-400/15 border border-emerald-400/50 flex items-center justify-center mb-6">
          <IconCheck className="w-8 h-8 text-emerald-300" />
        </div>
        <p className="font-cond uppercase tracking-[0.3em] text-xs text-emerald-300 mb-3">Application Received</p>
        <h3 className="font-display text-4xl tracking-wide mb-2">SAVE YOUR REFERENCE</h3>
        <p className="font-display text-3xl metal-text tracking-[0.14em] my-5 py-3 border-y border-gold/25 select-all">{ref}</p>
        <p className="text-ash leading-relaxed max-w-md mx-auto">
          Your application is in the review queue with <span className="text-bone">Pending</span> status. The review team
          will contact you on Discord — keep an eye on your message requests.
        </p>
        <p className="mt-6 text-xs text-ash/70 flex items-center justify-center gap-2">
          <IconLock className="w-3.5 h-3.5 text-gold" />
          FURSAN will never ask for your password or payment details.
        </p>
        {onFinished && (
          <Btn variant="outline" className="mt-8" onClick={onFinished}>Close</Btn>
        )}
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const check = validateApplication(kind, data, programOptions);
    if (!check.ok) {
      setErrors(check.errors);
      const firstKey = Object.keys(check.errors)[0];
      document.querySelector(\`[data-field="\${firstKey}"]\`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    try {
      const res = await api.submitApplication(kind, data);
      setRef(res.ref);
      push("success", \`Application \${res.ref} submitted successfully.\`);
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-7">
        <p className="font-cond uppercase tracking-[0.3em] text-[11px] text-gold/90 mb-2">{KIND_META[kind].sub}</p>
        <h3 className="font-display text-3xl sm:text-4xl tracking-wide">{KIND_META[kind].title}</h3>
      </div>

      {banner && (
        <div className="cut-sm mb-6 px-4 py-3 border border-red-500/50 bg-red-950/40 text-red-200 text-sm">
          {banner}
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="grid sm:grid-cols-2 gap-5">
          {specs.map((spec) => (
            <div key={spec.key} data-field={spec.key} className={spec.type === "textarea" ? "sm:col-span-2" : ""}>
              <FieldInput
                spec={spec}
                value={data[spec.key] ?? ""}
                error={errors[spec.key]}
                onChange={(v) => set(spec.key, v)}
                programOptions={kind === "esports" ? openPrograms : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-ash/80 flex items-center gap-2 max-w-xs">
            <IconLock className="w-4 h-4 text-gold shrink-0" />
            No passwords, no payments. Only the fields above are stored.
          </p>
          <Btn type="submit" busy={busy} className="w-full sm:w-auto min-w-[220px]">
            {busy ? "Submitting…" : "Submit Application"}
          </Btn>
        </div>
      </form>
    </div>
  );
}

export function ApplicationModal({ open, onClose, kind, presetProgram }: {
  open: boolean;
  onClose: () => void;
  kind: AppType;
  presetProgram?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} wide>
      <ApplicationForm key={\`\${kind}-\${presetProgram ?? ""}-\${open}\`} kind={kind} presetProgram={presetProgram} onFinished={onClose} />
    </Modal>
  );
}
`,Ue=`import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { IconDiscord } from "./ui";

const SOCIAL_META: { key: "youtube" | "instagram" | "x" | "tiktok" | "twitch"; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X (Twitter)" },
  { key: "tiktok", label: "TikTok" },
  { key: "twitch", label: "Twitch" },
];

export default function Footer() {
  const { db } = useApp();
  const c = db.content.footer;
  const s = db.settings;

  return (
    <footer className="relative border-t border-gold/15 bg-navy mt-0">
      <div className="absolute inset-0 glow-red opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src={db.images.logo} alt="FURSAN logo" className="h-14 w-14 object-contain mix-blend-screen" />
            <div>
              <p className="font-display text-2xl tracking-[0.12em]">{s.communityName}</p>
              <p className="font-cond uppercase tracking-[0.3em] text-[10px] text-gold/80">EST. 2020 · Morocco</p>
            </div>
          </div>
          <p className="text-ash max-w-md leading-relaxed">{c.description}</p>
          <p className="mt-6 font-cond uppercase tracking-[0.3em] text-xs metal-text">{c.builtLine}</p>
        </div>

        <div>
          <p className="font-cond uppercase tracking-[0.25em] text-xs text-gold/90 mb-5">Navigate</p>
          <ul className="space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/community", label: "Community" },
              { to: "/esports", label: "Esports" },
              { to: "/ems", label: "EMS" },
              { to: "/lspd", label: "LSPD" },
              { to: "/admin", label: "Admin Login" },
              { to: "/download", label: "Download Source (ZIP)" },
            ].map((l) => (
              <li key={l.to + l.label}>
                <Link to={l.to} className="text-ash hover:text-goldsoft transition-colors inline-flex items-center gap-2 group">
                  <span className="h-px w-4 bg-gold/40 group-hover:w-6 group-hover:bg-gold transition-all" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-cond uppercase tracking-[0.25em] text-xs text-gold/90 mb-5">Connect</p>
          <a
            href={s.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="cut-sm inline-flex items-center gap-2.5 px-5 py-3 border border-gold/40 text-gold hover:bg-gold/10 font-cond uppercase tracking-[0.18em] text-xs transition-all mb-6"
          >
            <IconDiscord className="w-4 h-4" />
            Discord Server
          </a>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_META.filter((x) => s.socials[x.key]).map((x) => (
              <a
                key={x.key}
                href={s.socials[x.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="cut-sm px-3.5 py-2 border border-bone/15 text-ash hover:text-gold hover:border-gold/50 font-cond uppercase tracking-[0.16em] text-[11px] transition-all"
              >
                {x.label}
              </a>
            ))}
          </div>
          {s.footerText && <p className="mt-6 text-xs text-ash/70 leading-relaxed max-w-sm">{s.footerText}</p>}
        </div>
      </div>

      <div className="relative border-t border-bone/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-cond uppercase tracking-[0.2em] text-[11px] text-ash/80">
            © {new Date().getFullYear()} {c.copyright}
          </p>
          <p className="font-cond uppercase tracking-[0.2em] text-[11px] text-gold/70">
            {s.memberCount.toLocaleString()}+ members strong
          </p>
        </div>
      </div>
    </footer>
  );
}
`,ze=`import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { IconDiscord, IconLock, IconMenu, IconX } from "./ui";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/community", label: "Community" },
  { to: "/esports", label: "Esports" },
  { to: "/ems", label: "EMS" },
  { to: "/lspd", label: "LSPD" },
];

export default function Header() {
  const { db, session } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), []);

  const discord = db.settings.discordInvite;

  return (
    <header
      className={\`fixed top-0 inset-x-0 z-[80] transition-all duration-500 border-b \${
        scrolled ? "bg-ink/92 backdrop-blur-md border-gold/15 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.9)]" : "bg-transparent border-transparent"
      }\`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-3 group" aria-label="FURSAN Community home">
          <img
            src={db.images.logo}
            alt="FURSAN logo"
            className="h-11 w-11 object-contain mix-blend-screen transition-transform duration-500 group-hover:scale-110"
          />
          <span className="leading-none">
            <span className="block font-display text-xl tracking-[0.12em] text-bone group-hover:text-goldsoft transition-colors">
              {db.settings.communityName.split(" ")[0]}
            </span>
            <span className="block font-cond uppercase tracking-[0.34em] text-[10px] text-gold/80">Community</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                \`relative px-4 py-2 font-cond uppercase tracking-[0.2em] text-[13px] transition-colors after:absolute after:left-4 after:right-4 after:-bottom-0.5 after:h-[2px] after:origin-left after:transition-transform after:duration-300 \${
                  isActive
                    ? "text-goldsoft after:scale-x-100 after:bg-gold"
                    : "text-bone/70 hover:text-bone after:scale-x-0 after:bg-gold/60 hover:after:scale-x-100"
                }\`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to={session ? "/admin/dashboard" : "/admin"}
            className="cut-sm inline-flex items-center gap-2 px-4 py-2.5 border border-bone/15 text-bone/80 hover:border-gold/60 hover:text-gold font-cond uppercase tracking-[0.18em] text-[12px] transition-all"
          >
            <IconLock className="w-3.5 h-3.5" />
            {session ? "Dashboard" : "Admin Login"}
          </Link>
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            className="cut-sm inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold font-cond uppercase tracking-[0.18em] text-[12px] hover:brightness-110 transition-all shadow-[0_8px_25px_-8px_rgba(213,169,79,0.6)]"
          >
            <IconDiscord className="w-4 h-4" />
            Join Discord
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-bone hover:text-gold transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* mobile panel */}
      <div
        className={\`lg:hidden overflow-hidden transition-all duration-400 \${open ? "max-h-[480px]" : "max-h-0"}\`}
      >
        <nav className="bg-ink/97 backdrop-blur-md border-t border-gold/10 px-6 py-5 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                \`px-3 py-3 font-display text-2xl tracking-[0.1em] border-l-2 transition-colors \${
                  isActive ? "text-goldsoft border-gold" : "text-bone/75 border-transparent hover:text-bone"
                }\`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <div className="flex gap-3 mt-4">
            <Link
              to={session ? "/admin/dashboard" : "/admin"}
              className="cut-sm flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-bone/20 text-bone font-cond uppercase tracking-[0.18em] text-[12px]"
            >
              <IconLock className="w-4 h-4" />
              {session ? "Dashboard" : "Admin Login"}
            </Link>
            <a
              href={discord}
              target="_blank"
              rel="noopener noreferrer"
              className="cut-sm flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold font-cond uppercase tracking-[0.18em] text-[12px]"
            >
              <IconDiscord className="w-4 h-4" />
              Discord
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
`,je=`import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

/* ================= custom icon set (hand-drawn strokes) ================= */

type IconProps = { className?: string };
const base = (className?: string) => ({
  className: className ?? "w-5 h-5",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export const IconTrophy = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /><path d="M12 13v3M8 20h8M10 16h4v4h-4z" /></svg>
);
export const IconSwords = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 4l7 7M4 4v3M4 4h3" /><path d="M20 4l-7 7M20 4v3M20 4h-3" /><path d="M6.5 17.5 4 20M17.5 17.5 20 20" /><path d="M9 13l2 2M15 13l-2 2" /><path d="M5 15l4 4M19 15l-4 4" /></svg>
);
export const IconCrosshair = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="7" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconMask = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 5c2.5 1 5.5 1 8 0 2.5 1 5.5 1 8 0v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V5Z" /><path d="M8.5 10.5c.8-.6 2.2-.6 3 0M12.5 10.5c.8-.6 2.2-.6 3 0" /><path d="M9 15c2 1.4 4 1.4 6 0" /></svg>
);
export const IconCalendar = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="4" y="6" width="16" height="14" /><path d="M4 10h16M8 3v5M16 3v5" /><path d="M8 14h2M14 14h2M8 17h2" /></svg>
);
export const IconShield = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4.5" /></svg>
);
export const IconChat = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6Z" /><path d="M8 9h8M8 12h5" /></svg>
);
export const IconGamepad = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 7h10a5 5 0 0 1 5 5.5L21.5 16a2.5 2.5 0 0 1-4.4 1.4L15.5 16h-7l-1.6 1.4A2.5 2.5 0 0 1 2.5 16L2 12.5A5 5 0 0 1 7 7Z" /><path d="M8 10v3M6.5 11.5h3M15.5 10.5h.01M17.5 12.5h.01" /></svg>
);
export const IconMedical = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 12h4l2-4 3 8 2-4h7" /><path d="M12 3v2M8 5h8" opacity="0" /><rect x="3" y="3" width="18" height="18" opacity="0" /></svg>
);
export const IconSiren = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 18v-6a5 5 0 0 1 10 0v6" /><path d="M5 18h14v3H5z" /><path d="M12 3v2M5 6l1.5 1.5M19 6l-1.5 1.5" /></svg>
);
export const IconBadge = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l2.2 2H18v4l2 2-2 2v4h-3.8L12 21l-2.2-4H6v-4l-2-2 2-2V5h3.8L12 3Z" /><circle cx="12" cy="11.5" r="2.5" /></svg>
);
export const IconUsers = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5" /><circle cx="16.5" cy="9" r="2.3" /><path d="M15.5 13.7c2.6.2 4.5 2 5 5.3" /></svg>
);
export const IconArrow = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconCheck = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 12.5 9.5 18 20 6.5" /></svg>
);
export const IconX = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const IconMenu = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const IconSearch = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>
);
export const IconLock = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="5" y="10" width="14" height="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5" /></svg>
);
export const IconUpload = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></svg>
);
export const IconTrash = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 7h14M10 7V5h4v2M8 7l1 13h6l1-13" /><path d="M10.5 11v5M13.5 11v5" /></svg>
);
export const IconEdit = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M14 5l5 5L8 21H3v-5L14 5Z" /><path d="M12 7l5 5" /></svg>
);
export const IconSignal = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 18v-4M9 18v-8M14 18V6M19 18V3" /></svg>
);
export const IconHeartline = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 12h5l2-4 3 8 2-4h6" /></svg>
);
export const IconScales = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 4v16M8 20h8" /><path d="M5 7l7-2 7 2" /><path d="M5 7l-2.5 5a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 5a3 3 0 0 0 5 0L19 7Z" /></svg>
);
export const IconGauge = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 17a8.5 8.5 0 1 1 16 0" /><path d="M12 17l4-6" /><circle cx="12" cy="17" r="1.4" /></svg>
);
export const IconBook = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /><path d="M9 7h6" /></svg>
);
export const IconDiscord = ({ className }: IconProps) => (
  <svg className={className ?? "w-5 h-5"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.3 5.5A16.8 16.8 0 0 0 15.1 4l-.5 1a15.6 15.6 0 0 0-5.2 0L8.9 4a16.8 16.8 0 0 0-4.2 1.5C2 9.6 1.3 13.6 1.6 17.5A17 17 0 0 0 6.8 20l1.1-1.8c-.6-.2-1.2-.5-1.8-.9l.4-.3a12 12 0 0 0 10.9 0l.5.3c-.6.4-1.2.7-1.9.9L17.2 20a17 17 0 0 0 5.2-2.5c.4-4.5-.7-8.4-3.1-12ZM8.7 15.1c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-1-1.9-2.1s.9-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Z" />
  </svg>
);
export const IconHorse = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M6 20c0-4 1-7 3-9l-1-4 3 2 2-3 1 4c3 1 5 4 5 10" /><path d="M14 8l3-1" /><circle cx="13.5" cy="9.5" r="0.4" fill="currentColor" /></svg>
);
export const IconChevronDown = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 9l7 7 7-7" /></svg>
);
export const IconPlus = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconGlobe = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c-5 5-5 12 0 17 5-5 5-12 0-17Z" /></svg>
);
export const IconKey = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="8" cy="15" r="4.5" /><path d="M11.5 11.5 20 3M17 6l3 3M14 9l2 2" /></svg>
);
export const IconNote = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 4h11l3 3v13H5z" /><path d="M16 4v3h3M9 11h6M9 15h4" /></svg>
);

export function Spinner({ className }: IconProps) {
  return (
    <svg className={\`animate-spin \${className ?? "w-4 h-4"}\`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ================= scroll reveal ================= */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={\`reveal \${className}\`} style={{ transitionDelay: \`\${delay}ms\` }}>
      {children}
    </div>
  );
}

/* ================= buttons ================= */

type BtnVariant = "gold" | "outline" | "red" | "ghost" | "dark";

export function Btn({
  variant = "gold", className = "", children, busy, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; busy?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    gold: "bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(213,169,79,0.5)]",
    outline: "border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold",
    red: "bg-gradient-to-b from-bloodbright to-blood text-bone font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(143,29,24,0.6)]",
    ghost: "text-ash hover:text-bone",
    dark: "bg-steel border border-bone/10 text-bone hover:border-gold/50",
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || busy}
      className={\`cut-sm inline-flex items-center justify-center gap-2 px-6 py-3 font-cond uppercase tracking-[0.14em] text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] \${styles[variant]} \${className}\`}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function LinkBtn({ href, variant = "gold", className = "", children, external }: { href: string; variant?: BtnVariant; className?: string; children: ReactNode; external?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    gold: "bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(213,169,79,0.5)]",
    outline: "border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold",
    red: "bg-gradient-to-b from-bloodbright to-blood text-bone font-bold hover:brightness-110",
    ghost: "text-ash hover:text-bone",
    dark: "bg-steel border border-bone/10 text-bone hover:border-gold/50",
  };
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={\`cut-sm inline-flex items-center justify-center gap-2 px-6 py-3 font-cond uppercase tracking-[0.14em] text-sm transition-all duration-300 active:scale-[0.98] \${styles[variant]} \${className}\`}
    >
      {children}
    </a>
  );
}

/* ================= section heading ================= */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-gold/90 font-cond uppercase tracking-[0.3em] text-xs mb-4">
      <span className="h-px w-10 bg-gradient-to-r from-gold to-transparent" />
      {children}
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      <div className={center ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className={\`font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-wide \${center ? "mx-auto" : ""}\`}>
        {title}
      </h2>
      {sub && <p className={\`mt-4 text-ash max-w-2xl text-lg \${center ? "mx-auto" : ""}\`}>{sub}</p>}
    </Reveal>
  );
}

/* ================= status pill ================= */

export function StatusPill({ status }: { status: "open" | "closed" | "temp" }) {
  const map = {
    open: { label: "Recruitment Open", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10", dot: "bg-emerald-400 pulse-dot" },
    closed: { label: "Recruitment Closed", cls: "text-red-300 border-red-400/40 bg-red-500/10", dot: "bg-red-500" },
    temp: { label: "Temporarily Closed", cls: "text-amber-300 border-amber-400/40 bg-amber-400/10", dot: "bg-amber-400 pulse-dot-red" },
  }[status];
  return (
    <span className={\`cut-sm inline-flex items-center gap-2 px-3 py-1.5 border font-cond uppercase tracking-[0.18em] text-[11px] \${map.cls}\`}>
      <span className={\`w-1.5 h-1.5 rounded-full \${map.dot}\`} />
      {map.label}
    </span>
  );
}

export function AppStatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "text-amber-300 border-amber-400/40 bg-amber-400/10",
    approved: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
    rejected: "text-red-300 border-red-400/40 bg-red-500/10",
  }[status];
  return (
    <span className={\`cut-sm inline-flex px-2.5 py-1 border font-cond uppercase tracking-[0.16em] text-[11px] \${map}\`}>
      {status}
    </span>
  );
}

/* ================= modal ================= */

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-ink/85 backdrop-blur-sm" onClick={onClose} />
      <div className={\`relative w-full \${wide ? "max-w-3xl" : "max-w-xl"} my-4 modal-in\`}>
        <div className="gold-frame cut p-0">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3 right-3 z-10 p-2 text-ash hover:text-gold transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ================= toasts ================= */

interface Toast { id: number; kind: "success" | "error" | "info"; text: string }
const ToastContext = createContext<{ push: (kind: Toast["kind"], text: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={\`toast-in cut-sm px-4 py-3 text-sm border backdrop-blur-md flex items-start gap-2.5 \${
              t.kind === "success"
                ? "bg-emerald-950/90 border-emerald-400/40 text-emerald-100"
                : t.kind === "error"
                ? "bg-[#2a0d0b]/95 border-red-500/50 text-red-100"
                : "bg-steel/95 border-gold/40 text-bone"
            }\`}
          >
            {t.kind === "success" ? <IconCheck className="w-4 h-4 mt-0.5 shrink-0" /> : t.kind === "error" ? <IconX className="w-4 h-4 mt-0.5 shrink-0" /> : <IconNote className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/* ================= form primitives ================= */

const fieldWrap = "w-full";
const inputCls =
  "w-full bg-ink/80 border border-bone/15 px-4 py-3 text-bone placeholder:text-ash/50 outline-none transition-colors focus:border-gold/70 focus:shadow-[0_0_0_3px_rgba(213,169,79,0.12)]";

export function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className={\`block \${fieldWrap}\`}>
      <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block mt-1.5 text-xs text-ash/80">{hint}</span>}
      {error && <span className="block mt-1.5 text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function TextInput({ error, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input {...rest} className={\`\${inputCls} \${error ? "border-red-500/60" : ""} \${className ?? ""}\`} />;
}

export function TextArea({ error, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea {...rest} className={\`\${inputCls} resize-y min-h-[90px] \${error ? "border-red-500/60" : ""} \${className ?? ""}\`} />;
}

export function Select({ error, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select {...rest} className={\`\${inputCls} appearance-none cursor-pointer \${error ? "border-red-500/60" : ""} \${className ?? ""}\`}>
      {children}
    </select>
  );
}

/* ================= misc ================= */

export function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export function parseStat(value: string): { num: number; suffix: string } {
  const m = value.match(/^([\\d,\\.]+)(.*)$/);
  if (!m) return { num: 0, suffix: value };
  return { num: parseInt(m[1].replace(/[,.]/g, ""), 10) || 0, suffix: m[2] ?? "" };
}
`,He=`import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { getDB, getVersion, subscribe, type DB } from "../lib/db";
import * as api from "../lib/api";

interface SessionInfo {
  username: string;
}

interface AppContextValue {
  db: DB;
  session: SessionInfo | null;
  sessionChecked: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const version = useSyncExternalStore(subscribe, getVersion);
  void version;
  const db = getDB();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const refreshSession = useCallback(async () => {
    const s = await api.getSession();
    setSession(s);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);

  return (
    <AppContext.Provider value={{ db, session, sessionChecked, refreshSession, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
`,qe=`@import "tailwindcss";

@theme {
  --color-ink: #050607;
  --color-navy: #0b1116;
  --color-steel: #121b22;
  --color-gold: #d5a94f;
  --color-goldsoft: #e6c069;
  --color-golddark: #9a742c;
  --color-blood: #8f1d18;
  --color-bloodbright: #c0392f;
  --color-bone: #f3efe5;
  --color-ash: #9aa5ad;
  --font-display: "Bebas Neue", "Barlow Condensed", sans-serif;
  --font-cond: "Barlow Condensed", sans-serif;
  --font-body: "Barlow", sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background: var(--color-ink);
  color: var(--color-bone);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::selection {
  background: rgba(213, 169, 79, 0.85);
  color: #0b1116;
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: #050607; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #2a343c, #141c22);
  border: 2px solid #050607;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover { background: #9a742c; }

/* ---------- signature shapes ---------- */
.cut {
  clip-path: polygon(
    14px 0, 100% 0, 100% calc(100% - 14px),
    calc(100% - 14px) 100%, 0 100%, 0 14px
  );
}
.cut-sm {
  clip-path: polygon(
    9px 0, 100% 0, 100% calc(100% - 9px),
    calc(100% - 9px) 100%, 0 100%, 0 9px
  );
}

/* ---------- panels & metallic frames ---------- */
.panel {
  background: linear-gradient(175deg, rgba(23, 31, 38, 0.92), rgba(11, 17, 22, 0.97));
  border: 1px solid rgba(213, 169, 79, 0.16);
}
.panel-hover {
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1), border-color 0.35s, box-shadow 0.35s;
}
.panel-hover:hover {
  transform: translateY(-4px);
  border-color: rgba(213, 169, 79, 0.5);
  box-shadow:
    0 0 0 1px rgba(213, 169, 79, 0.12),
    0 24px 70px -24px rgba(143, 29, 24, 0.55);
}

.gold-frame {
  position: relative;
  background:
    linear-gradient(#0b1116, #0b1116) padding-box,
    linear-gradient(160deg, rgba(230, 192, 105, 0.75), rgba(213, 169, 79, 0.15) 40%, rgba(143, 29, 24, 0.5)) border-box;
  border: 1px solid transparent;
}

/* HUD corner ticks */
.hud { position: relative; }
.hud::before, .hud::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  pointer-events: none;
  transition: width 0.3s, height 0.3s;
}
.hud::before {
  top: -1px; left: -1px;
  border-top: 2px solid rgba(213, 169, 79, 0.85);
  border-left: 2px solid rgba(213, 169, 79, 0.85);
}
.hud::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid rgba(143, 29, 24, 0.95);
  border-right: 2px solid rgba(143, 29, 24, 0.95);
}
.hud:hover::before, .hud:hover::after { width: 26px; height: 26px; }

/* ---------- textures ---------- */
.texture-grid {
  background-image:
    linear-gradient(rgba(243, 239, 229, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(243, 239, 229, 0.045) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 30%, black 40%, transparent 100%);
}
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.glow-red {
  background: radial-gradient(ellipse at center, rgba(143, 29, 24, 0.32), transparent 65%);
}
.glow-gold {
  background: radial-gradient(ellipse at center, rgba(213, 169, 79, 0.14), transparent 65%);
}

.text-outline {
  -webkit-text-stroke: 1px rgba(213, 169, 79, 0.4);
  color: transparent;
}

.metal-text {
  background: linear-gradient(175deg, #f0d793 0%, #d5a94f 38%, #8a6524 62%, #e6c069 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ---------- motion ---------- */
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}
.animate-floaty { animation: floaty 7s ease-in-out infinite; }

@keyframes spin-slow { to { transform: rotate(360deg); } }
.animate-spin-slow { animation: spin-slow 40s linear infinite; }

@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker-scroll 30s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
  70% { box-shadow: 0 0 0 9px rgba(74, 222, 128, 0); }
}
.pulse-dot { animation: pulse-dot 1.8s infinite; }

@keyframes pulse-dot-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 47, 0.7); }
  70% { box-shadow: 0 0 0 9px rgba(192, 57, 47, 0); }
}
.pulse-dot-red { animation: pulse-dot-red 1.8s infinite; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.8s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(110deg, rgba(213,169,79,0) 35%, rgba(213,169,79,0.22) 50%, rgba(213,169,79,0) 65%);
  background-size: 200% 100%;
  animation: shimmer 2.6s linear infinite;
}

@keyframes scanline {
  0% { top: -10%; }
  100% { top: 110%; }
}
.scanline::after {
  content: "";
  position: absolute;
  left: 0; right: 0;
  height: 90px;
  top: -10%;
  background: linear-gradient(180deg, transparent, rgba(213, 169, 79, 0.05), transparent);
  animation: scanline 6s linear infinite;
  pointer-events: none;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(26px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-in { animation: modal-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

@keyframes drawer-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.drawer-in { animation: drawer-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.toast-in { animation: toast-in 0.3s ease both; }

@keyframes marquee-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
`,Ge=`/**
 * FURSAN API layer.
 *
 * Every public function behaves like a server endpoint: async, rate-limited,
 * authenticated where required, and it re-validates all input before touching
 * the data store. Secrets (password hashes, the sealed Discord token, session
 * internals) never leave this module.
 */
import {
  getDB, mutate, getSessionToken, setSessionToken,
  DEFAULT_CONTENT, DEFAULT_IMAGES,
  type Application, type AppStatus, type AppType, type DB, type Department,
  type Game, type RecruitmentStatus, type SiteImages, type SiteSettings, type StaffMember,
} from "./db";
import { encryptText, decryptText, hashPassword, randomToken, verifyPassword } from "./crypto";
import { DISCORD_ID_RE, sanitize, sanitizeMultiline, validateApplication } from "./validation";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/* ---------------- rate limiting ---------------- */

function hitRateLimit(d: DB, key: string, max: number, windowMs: number): number {
  const now = Date.now();
  d.rate_limits = d.rate_limits.filter((e) => now - e.ts < windowMs);
  const hits = d.rate_limits.filter((e) => e.key === key);
  if (hits.length >= max) {
    const oldest = Math.min(...hits.map((h) => h.ts));
    return Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
  }
  d.rate_limits.push({ key, ts: now });
  return 0;
}

/* ---------------- auth ---------------- */

const SESSION_HOURS = 12;

export async function login(username: string, password: string): Promise<{ username: string }> {
  await delay(450);
  const uname = sanitize(username, 60);
  if (!uname || !password) throw new ApiError("Username and password are required.", 400);

  const d = getDB();
  const wait = hitRateLimit(d, \`login:\${uname.toLowerCase()}\`, 5, 10 * 60 * 1000);
  if (wait > 0) throw new ApiError(\`Too many failed attempts. Try again in \${wait}s.\`, 429);
  mutate(() => {});

  const admin = d.admins.find((a) => a.username.toLowerCase() === uname.toLowerCase());
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    throw new ApiError("Invalid credentials.", 401);
  }
  const token = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_HOURS * 3600 * 1000);
  mutate((db) => {
    db.admin_sessions = db.admin_sessions.filter((s) => new Date(s.expiresAt).getTime() > Date.now());
    db.admin_sessions.push({ token, createdAt: now.toISOString(), expiresAt: expires.toISOString() });
  });
  setSessionToken(token);
  return { username: admin.username };
}

export async function getSession(): Promise<{ username: string } | null> {
  const token = getSessionToken();
  if (!token) return null;
  const d = getDB();
  const session = d.admin_sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    setSessionToken(null);
    return null;
  }
  return { username: d.admins.find((a) => a.id)?.username ?? "admin" };
}

export async function logout(): Promise<void> {
  const token = getSessionToken();
  if (token) mutate((db) => { db.admin_sessions = db.admin_sessions.filter((s) => s.token !== token); });
  setSessionToken(null);
}

function requireAuth(): void {
  const token = getSessionToken();
  const d = getDB();
  const session = d.admin_sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    setSessionToken(null);
    throw new ApiError("Authentication required.", 401);
  }
}

export async function changePassword(current: string, next: string): Promise<void> {
  requireAuth();
  await delay(350);
  const d = getDB();
  const admin = d.admins[0];
  if (!admin || !verifyPassword(current, admin.passwordHash)) throw new ApiError("Current password is incorrect.", 401);
  if (!next || next.length < 8) throw new ApiError("New password must be at least 8 characters.", 400);
  mutate((db) => { db.admins[0].passwordHash = hashPassword(next); });
}

/* ---------------- applications ---------------- */

function makeRef(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return \`FUR-\${new Date().getFullYear()}-\${n}\`;
}

export async function submitApplication(
  type: AppType,
  raw: Record<string, string>
): Promise<{ ref: string }> {
  await delay(700);
  const d = getDB();
  const games = d.games;
  const allowedPrograms = games.map((g) => g.title);
  const result = validateApplication(type, raw, allowedPrograms);
  if (!result.ok) throw new ApiError("VALIDATION", 422);

  const rlKey = \`apply:\${type}:\${result.data.discordId}\`;
  const wait = mutate((db) => hitRateLimit(db, rlKey, 3, 10 * 60 * 1000));
  if (wait > 0) throw new ApiError(\`Rate limit: you can submit again in \${wait}s.\`, 429);

  const game = type === "esports" ? games.find((g) => g.title === result.data.program) : undefined;
  if (type === "esports" && game && game.status !== "open") {
    throw new ApiError(\`\${game.title} recruitment is not open right now.\`, 409);
  }

  const now = new Date().toISOString();
  const app: Application = {
    id: randomToken(),
    ref: makeRef(),
    type,
    program: type === "esports" ? result.data.program : undefined,
    status: "pending",
    data: { ...result.data, programId: game?.id ?? type },
    notes: "",
    discord: {},
    createdAt: now,
    updatedAt: now,
  };
  mutate((db) => { db.applications.unshift(app); });
  return { ref: app.ref };
}

export interface AppQuery {
  search?: string;
  status?: AppStatus | "all";
  type?: AppType | "all";
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}

export async function listApplications(q: AppQuery): Promise<{ items: Application[]; total: number; pages: number }> {
  requireAuth();
  await delay(200);
  const d = getDB();
  const search = (q.search ?? "").trim().toLowerCase();
  let items = d.applications.filter((a) => {
    if (q.status && q.status !== "all" && a.status !== q.status) return false;
    if (q.type && q.type !== "all" && a.type !== q.type) return false;
    if (search) {
      const hay = \`\${a.ref} \${a.data.fullName} \${a.data.discordUsername} \${a.data.discordId} \${a.program ?? ""}\`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  items = [...items].sort((a, b) =>
    q.sort === "oldest"
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
  );
  const pageSize = q.pageSize ?? 8;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, q.page ?? 1), pages);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total, pages };
}

export async function getApplication(id: string): Promise<Application> {
  requireAuth();
  const app = getDB().applications.find((a) => a.id === id);
  if (!app) throw new ApiError("Application not found.", 404);
  return app;
}

export async function updateApplicationNotes(id: string, notes: string): Promise<void> {
  requireAuth();
  mutate((db) => {
    const app = db.applications.find((a) => a.id === id);
    if (!app) throw new ApiError("Application not found.", 404);
    app.notes = sanitizeMultiline(notes, 3000);
    app.updatedAt = new Date().toISOString();
  });
}

export async function updateApplicationDiscordId(id: string, discordId: string): Promise<void> {
  requireAuth();
  const clean = sanitize(discordId, 22);
  if (!DISCORD_ID_RE.test(clean)) throw new ApiError("Discord User ID must be 16–22 digits.", 422);
  mutate((db) => {
    const app = db.applications.find((a) => a.id === id);
    if (!app) throw new ApiError("Application not found.", 404);
    app.data.discordId = clean;
    app.discord = { ...app.discord, lastError: undefined };
    app.updatedAt = new Date().toISOString();
  });
}

/**
 * Approving attempts the Discord role grant first (when automation is on)
 * and only then marks the application approved — exactly as specced.
 * Rejecting never removes roles.
 */
export async function setApplicationStatus(id: string, status: AppStatus): Promise<{ discord?: string }> {
  requireAuth();
  const d = getDB();
  const app = d.applications.find((a) => a.id === id);
  if (!app) throw new ApiError("Application not found.", 404);

  if (status === "approved") {
    const discord = d.discord;
    if (discord.enabled) {
      const roleKey = app.data.programId || app.type;
      const roleId = discord.roles[roleKey];
      if (!discord.guildId || !discord.tokenEnc) {
        throw new ApiError("Discord automation is enabled but Guild ID or bot token is missing. Configure it in Discord Integration.", 409);
      }
      if (!roleId) {
        throw new ApiError(\`No Discord role is configured for “\${app.program ?? app.type.toUpperCase()}”. Configure it in Discord Integration.\`, 409);
      }
      if (!DISCORD_ID_RE.test(app.data.discordId)) {
        throw new ApiError("The applicant's Discord User ID is invalid (16–22 digits). Fix it before approving.", 422);
      }
      const res = await discordAssignRole(discord.guildId, app.data.discordId, roleId);
      if (!res.ok) {
        mutate((db) => {
          const a = db.applications.find((x) => x.id === id);
          if (a) { a.discord.lastError = res.message; a.updatedAt = new Date().toISOString(); }
        });
        throw new ApiError(\`Discord role assignment failed — application kept unapproved. \${res.message}\`, 502);
      }
      mutate((db) => {
        const a = db.applications.find((x) => x.id === id);
        if (a) {
          a.status = "approved";
          a.discord = { roleId, assignedAt: new Date().toISOString(), lastError: undefined };
          a.updatedAt = new Date().toISOString();
        }
      });
      return { discord: \`Role \${roleId} assigned via Discord API v10.\` };
    }
  }

  mutate((db) => {
    const a = db.applications.find((x) => x.id === id);
    if (a) { a.status = status; a.updatedAt = new Date().toISOString(); }
  });
  return {};
}

export async function deleteApplication(id: string): Promise<void> {
  requireAuth();
  mutate((db) => { db.applications = db.applications.filter((a) => a.id !== id); });
}

/* ---------------- games & departments ---------------- */

export async function updateGame(id: string, patch: { title?: string; description?: string; status?: RecruitmentStatus }): Promise<void> {
  requireAuth();
  mutate((db) => {
    const g = db.games.find((x) => x.id === id);
    if (!g) throw new ApiError("Program not found.", 404);
    if (patch.title !== undefined) g.title = sanitize(patch.title, 60) || g.title;
    if (patch.description !== undefined) g.description = sanitizeMultiline(patch.description, 2000);
    if (patch.status) g.status = patch.status;
  });
}

export async function updateDepartment(id: "ems" | "lspd", patch: Partial<Omit<Department, "id">>): Promise<void> {
  requireAuth();
  mutate((db) => {
    const dep = db.departments.find((x) => x.id === id);
    if (!dep) throw new ApiError("Department not found.", 404);
    if (patch.name !== undefined) dep.name = sanitize(patch.name, 80) || dep.name;
    if (patch.tagline !== undefined) dep.tagline = sanitize(patch.tagline, 120);
    if (patch.intro !== undefined) dep.intro = sanitizeMultiline(patch.intro, 3000);
    if (patch.status) dep.status = patch.status;
    if (patch.requirements) dep.requirements = patch.requirements.map((r) => sanitize(r, 160)).filter(Boolean).slice(0, 20);
    if (patch.ranks) dep.ranks = patch.ranks
      .map((r) => ({ title: sanitize(r.title, 60), desc: sanitize(r.desc, 200) }))
      .filter((r) => r.title).slice(0, 20);
  });
}

/* ---------------- content & images ---------------- */

export async function updateContentSection<K extends keyof DB["content"]>(section: K, value: DB["content"][K]): Promise<void> {
  requireAuth();
  const clean = sanitizeDeep(value) as DB["content"][K];
  mutate((db) => { db.content[section] = clean; });
}

function sanitizeDeep(v: unknown): unknown {
  if (typeof v === "string") return sanitizeMultiline(v, 4000);
  if (Array.isArray(v)) return v.map(sanitizeDeep);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = sanitizeDeep(val);
    return out;
  }
  return v;
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const IMAGE_MAX = 1.5 * 1024 * 1024;

export async function setImage(key: keyof SiteImages, file: File): Promise<string> {
  requireAuth();
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new ApiError("Only PNG, JPG, WebP or GIF files are allowed.", 415);
  }
  if (file.size > IMAGE_MAX) {
    throw new ApiError("File is too large — maximum 1.5 MB.", 413);
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ApiError("Could not read the file.", 400));
    reader.readAsDataURL(file);
  });
  mutate((db) => { db.images[key] = dataUrl; });
  return dataUrl;
}

export async function resetImage(key: keyof SiteImages): Promise<void> {
  requireAuth();
  mutate((db) => { db.images[key] = DEFAULT_IMAGES[key]; });
}

export async function resetContent(): Promise<void> {
  requireAuth();
  mutate((db) => { db.content = structuredClone(DEFAULT_CONTENT); });
}

/* ---------------- staff ---------------- */

export async function saveStaff(member: Omit<StaffMember, "id"> & { id?: string }): Promise<void> {
  requireAuth();
  const username = sanitize(member.username, 60);
  const discord = sanitize(member.discord, 60);
  const role = sanitize(member.role, 80);
  const department = sanitize(member.department, 60);
  if (!username || !role) throw new ApiError("Username and role are required.", 422);
  mutate((db) => {
    if (member.id) {
      const m = db.staff.find((s) => s.id === member.id);
      if (!m) throw new ApiError("Staff member not found.", 404);
      Object.assign(m, { username, discord, role, department, permissions: member.permissions });
    } else {
      db.staff.push({ id: randomToken(), username, discord, role, department, permissions: member.permissions });
    }
  });
}

export async function deleteStaff(id: string): Promise<void> {
  requireAuth();
  mutate((db) => { db.staff = db.staff.filter((s) => s.id !== id); });
}

/* ---------------- settings ---------------- */

export async function updateSettings(patch: Partial<SiteSettings>): Promise<void> {
  requireAuth();
  mutate((db) => {
    if (patch.communityName !== undefined) db.settings.communityName = sanitize(patch.communityName, 80) || "FURSAN COMMUNITY";
    if (patch.discordInvite !== undefined) db.settings.discordInvite = sanitize(patch.discordInvite, 200);
    if (patch.memberCount !== undefined) db.settings.memberCount = Math.max(0, Math.min(10_000_000, Math.floor(patch.memberCount || 0)));
    if (patch.serverOnline !== undefined) db.settings.serverOnline = !!patch.serverOnline;
    if (patch.footerText !== undefined) db.settings.footerText = sanitizeMultiline(patch.footerText, 600);
    if (patch.socials) {
      (Object.keys(patch.socials) as (keyof SiteSettings["socials"])[]).forEach((k) => {
        db.settings.socials[k] = sanitize(patch.socials![k], 200);
      });
    }
  });
}

/* ---------------- Discord integration ---------------- */

const DISCORD_API = (import.meta.env.VITE_DISCORD_API_BASE ?? "https://discord.com/api/v10").replace(/\\/$/, "");

function mapDiscordFailure(status: number): string {
  switch (status) {
    case 401: return "Invalid bot token (401).";
    case 403: return "Forbidden (403). The bot needs the Manage Roles permission and its role must sit above the role being assigned.";
    case 404: return "Not found (404). Check the Guild ID, member's User ID and Role ID.";
    case 429: return "Discord rate limit hit (429). Try again shortly.";
    default: return \`Discord API error (HTTP \${status}).\`;
  }
}

async function discordRequest(method: string, path: string, token: string): Promise<{ ok: boolean; status: number; body?: unknown }> {
  const res = await fetch(\`\${DISCORD_API}\${path}\`, {
    method,
    headers: { Authorization: \`Bot \${token}\`, "Content-Type": "application/json" },
  });
  let body: unknown = undefined;
  try { body = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, body };
}

async function networkGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network failure";
    throw new ApiError(
      \`Could not reach the Discord API (\${msg}). Browsers may block cross-origin bot requests — set VITE_DISCORD_API_BASE to a server-side relay, or deploy the API layer server-side (see README).\`,
      0
    );
  }
}

export interface DiscordSafeSettings {
  enabled: boolean;
  guildId: string;
  hasToken: boolean;
  roles: Record<string, string>;
  lastTest: { ok: boolean; message: string; at: string } | null;
}

export async function getDiscordSettings(): Promise<DiscordSafeSettings> {
  requireAuth();
  const d = getDB().discord;
  return { enabled: d.enabled, guildId: d.guildId, hasToken: !!d.tokenEnc, roles: { ...d.roles }, lastTest: d.lastTest };
}

export async function saveDiscordSettings(input: {
  enabled: boolean;
  guildId: string;
  token?: string;
  roles: Record<string, string>;
}): Promise<void> {
  requireAuth();
  const guildId = sanitize(input.guildId, 30);
  if (guildId && !/^\\d{15,22}$/.test(guildId)) throw new ApiError("Guild ID must be 15–22 digits.", 422);
  const roles: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.roles)) roles[sanitize(k, 30)] = sanitize(v, 30);

  if (input.token && input.token.trim()) {
    const cleanToken = input.token.trim();
    if (!/^[\\w-]{20,}\\.[\\w-]{4,}\\.[\\w-]{20,}$/.test(cleanToken)) {
      throw new ApiError("That does not look like a Discord bot token.", 422);
    }
    const sealed = await encryptText(cleanToken);
    mutate((db) => { db.discord = { ...db.discord, enabled: input.enabled, guildId, tokenEnc: sealed, roles }; });
  } else {
    mutate((db) => { db.discord = { ...db.discord, enabled: input.enabled, guildId, roles }; });
  }
}

export async function testDiscordConnection(): Promise<{ ok: boolean; message: string }> {
  requireAuth();
  const d = getDB().discord;
  if (!d.tokenEnc) throw new ApiError("Save a bot token before testing.", 409);
  const token = await decryptText(d.tokenEnc);
  const result = await networkGuard(async () => {
    const res = await discordRequest("GET", d.guildId ? \`/guilds/\${d.guildId}\` : "/users/@me", token);
    if (res.ok) {
      const name = (res.body as { name?: string; username?: string })?.name ?? (res.body as { username?: string })?.username ?? "connected";
      return { ok: true, message: d.guildId ? \`Connected — guild “\${name}” reachable.\` : \`Connected — bot authenticated as “\${name}”.\` };
    }
    return { ok: false, message: mapDiscordFailure(res.status) };
  });
  mutate((db) => { db.discord.lastTest = { ...result, at: new Date().toISOString() }; });
  return result;
}

async function discordAssignRole(guildId: string, userId: string, roleId: string): Promise<{ ok: boolean; message: string }> {
  const d = getDB().discord;
  if (!d.tokenEnc) return { ok: false, message: "No bot token stored." };
  const token = await decryptText(d.tokenEnc);
  return networkGuard(async () => {
    const res = await discordRequest("PUT", \`/guilds/\${guildId}/members/\${userId}/roles/\${roleId}\`, token);
    return res.ok
      ? { ok: true, message: "Role assigned." }
      : { ok: false, message: mapDiscordFailure(res.status) };
  });
}

/* ---------------- public aggregates ---------------- */

export interface PublicState {
  db: DB;
}

export function getPublicState(): DB {
  return getDB();
}

export type { Application, AppStatus, AppType, Game, Department, StaffMember, SiteSettings };
`,We=`/**
 * Client-side crypto utilities.
 * - Passwords are hashed with bcrypt (cost 10). Plaintext passwords are never stored.
 * - The Discord bot token is sealed with AES-256-GCM under a locally generated vault key.
 *   In a hosted deployment this logic moves to the server, where the vault key lives in
 *   environment variables and cookies become HttpOnly/SameSite — see README.
 */
import { hashSync, compareSync } from "bcryptjs";

export function hashPassword(plain: string): string {
  return hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return compareSync(plain, hash);
  } catch {
    return false;
  }
}

const VAULT_KEY = "fursan_vault_key_v1";

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getVaultKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(VAULT_KEY);
  if (stored) {
    try {
      return await crypto.subtle.importKey("jwk", JSON.parse(stored), { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
      ]);
    } catch {
      /* regenerate below */
    }
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const jwk = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem(VAULT_KEY, JSON.stringify(jwk));
  return key;
}

/** Returns base64(iv).base64(ciphertext) */
export async function encryptText(plain: string): Promise<string> {
  const key = await getVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain)
  );
  return \`\${bufToB64(iv)}.\${bufToB64(ct)}\`;
}

export async function decryptText(payload: string): Promise<string> {
  const key = await getVaultKey();
  const [ivB64, ctB64] = payload.split(".");
  if (!ivB64 || !ctB64) throw new Error("Malformed sealed value");
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBuf(ivB64) as BufferSource },
    key,
    b64ToBuf(ctB64) as BufferSource
  );
  return new TextDecoder().decode(pt);
}

export function randomToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return \`\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2, 12)}\`;
}
`,Ye=`/**
 * FURSAN data layer.
 *
 * Mirrors the SQL schema in /db/schema.sql (admins, admin_sessions, applications,
 * staff, games, departments, settings, rate_limits). In this static deployment the
 * tables persist in a structured browser store so every feature works end-to-end;
 * the api.ts layer treats it exactly like a remote database — every write is
 * validated, rate-limited and authenticated — so swapping in PostgreSQL/Drizzle
 * later only changes this file. See README → "Moving to a hosted backend".
 */
import { hashPassword } from "./crypto";

export type AppType = "esports" | "ems" | "lspd";
export type AppStatus = "pending" | "approved" | "rejected";
export type RecruitmentStatus = "open" | "closed" | "temp";

export interface Application {
  id: string;
  ref: string;
  type: AppType;
  program?: string;
  status: AppStatus;
  data: Record<string, string>;
  notes: string;
  discord: { roleId?: string; assignedAt?: string; lastError?: string };
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  username: string;
  discord: string;
  role: string;
  department: string;
  permissions: string[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  status: RecruitmentStatus;
}

export interface Rank {
  title: string;
  desc: string;
}

export interface Department {
  id: "ems" | "lspd";
  name: string;
  tagline: string;
  intro: string;
  requirements: string[];
  ranks: Rank[];
  status: RecruitmentStatus;
}

export interface AdminRecord {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface RateEntry {
  key: string;
  ts: number;
}

export interface DiscordSettings {
  enabled: boolean;
  guildId: string;
  /** AES-GCM sealed token — never returned to the UI layer. */
  tokenEnc: string | null;
  roles: Record<string, string>;
  lastTest: { ok: boolean; message: string; at: string } | null;
}

export interface SiteSettings {
  communityName: string;
  discordInvite: string;
  memberCount: number;
  serverOnline: boolean;
  socials: { youtube: string; instagram: string; x: string; tiktok: string; twitch: string };
  footerText: string;
}

export interface SiteImages {
  logo: string;
  homeHero: string;
  founders: string;
  communityHero: string;
  esportsHero: string;
  emsHero: string;
  lspdHero: string;
}

/* ------------------------------------------------------------------ */
/* Default content — every visible string on the site lives here.      */
/* ------------------------------------------------------------------ */

export const DEFAULT_CONTENT = {
  home: {
    eyebrow: "EST. 2020 · KINGDOM OF MOROCCO",
    title: "FURSAN COMMUNITY",
    tagline: "THE NEXT GENERATION OF GAMING & ROLEPLAY",
    description:
      "FURSAN is a Moroccan-born competitive gaming and serious roleplay organisation. From EA FC ladders and Valorant scrims to the emergency corridors of Los Santos, we build disciplined players, trusted crews and stories worth telling — one standard, one family.",
    ctaExplore: "Explore Community",
    ctaDiscord: "Join Discord",
    serverLabel: "FURSAN RP Server — Online",
    ticker: ["FIFA / EA FC", "eFootball", "Valorant", "Counter-Strike", "San Andreas EMS", "Los Santos PD", "Community Events", "EST. 2020"],
    stats: [
      { value: "2400+", label: "Community Members" },
      { value: "380+", label: "Active Players" },
      { value: "12", label: "Esports Teams" },
      { value: "2", label: "RP Departments" },
    ],
    featuresTitle: "BUILT LIKE AN ORG, RUN LIKE A FAMILY",
    featuresSub: "Six pillars hold the FURSAN standard. Every member, every squad, every shift.",
    features: [
      { title: "Competitive Gaming", description: "Structured scrims, VOD review and ranked grind across EA FC, eFootball, Valorant and Counter-Strike." },
      { title: "Esports Teams", description: "Rostered FURSAN squads with coaches and managers — and a clear road from trialist to starter." },
      { title: "FiveM Roleplay", description: "A serious whitelisted RP world with a living economy, factions and consequences that matter." },
      { title: "Community Events", description: "Weekly tournaments, charity streams, Moroccan IRL meetups and cross-community leagues." },
      { title: "Professional Staff", description: "Trained staff teams, clear chains of command, transparent decisions and round-the-clock coverage." },
      { title: "Active Discord", description: "The heartbeat of FURSAN — announcements, scrims, support tickets and late-night lobbies." },
    ],
    previewsTitle: "CHOOSE YOUR BATTLEGROUND",
    previewsSub: "Four competitive programs. Two roleplay departments. One crest.",
    previews: [
      { title: "FIFA / EA FC", tag: "1V1 & PRO CLUBS", description: "Internal weekly league, coaching on build-up and set pieces, and slots in regional online cups." },
      { title: "eFootball", tag: "CONSOLE & MOBILE", description: "A division built around the eFootball league calendar — patient possession, ice-cold finishing." },
      { title: "Valorant", tag: "5V5 TACTICAL", description: "A five-stack project with IGL structure, disciplined defaults and twice-weekly VOD review." },
      { title: "Counter-Strike", tag: "PREMIER & FACEIT", description: "The CS project rebuilds with Premier and FACEIT squads — announcements land on Discord first." },
      { title: "Emergency Medical Services", tag: "SAN ANDREAS EMS", description: "Whitelisted medics running hospital RP, field triage and the finest ambulance livery in the city." },
      { title: "Los Santos Police Department", tag: "METROPOLITAN DIVISION", description: "Story-led policing with academies, pursuits and investigations that respect every player's time." },
    ],
    foundersTitle: "THE FOUNDING COUNCIL",
    foundersSub: "Five names carried the idea from a late-night voice channel in 2020 to an organisation. The council still reviews every major decision.",
    founders: [
      { name: "JOMALI", description: "Vision & strategy. Set the FURSAN standard in 2020 and still guards it." },
      { name: "LADROOK", description: "Competitive director. Built the first rosters and the trial system." },
      { name: "MURPHY", description: "Roleplay architect. Designed the server economy, laws and factions." },
      { name: "OGAMING093", description: "Community engine. Events, creators and the Discord that never sleeps." },
      { name: "FERDA", description: "Operations & integrity. Recruitment, staff training and fair play." },
    ],
    ctaTitle: "READY TO RIDE WITH FURSAN?",
    ctaSub: "The door is open. Programs recruit from the Esports, EMS and LSPD pages — everything else starts on Discord.",
    ctaButton: "Enter the Community",
  },
  community: {
    heroEyebrow: "THE COMMUNITY",
    heroTitle: "MORE THAN A DISCORD SERVER",
    heroDescription: "A Moroccan organisation built on competition, serious roleplay and the kind of brotherhood that survives patch notes.",
    storyTitle: "OUR STORY",
    storyBody:
      "FURSAN started in 2020 as five friends grinding FIFA ladders from Casablanca to Oujda. The name means “knights” — and the idea was simple: play like one unit, win or lose.\\n\\nWhat began as scrims became rosters. Rosters became tournaments. Then came the FiveM server, where the same discipline found a new stage — medics who treat every call seriously, officers who police with a story in mind, and citizens who keep the city alive.\\n\\nToday FURSAN is a full organisation: four competitive programs, two roleplay departments, an events team and a staff structure that treats community work like a craft.",
    missionTitle: "OUR MISSION",
    missionBody:
      "Give ambitious Moroccan and MENA players a home where the ambition is taken seriously — real coaching, real structure, real consequences, and zero tolerance for toxicity wearing a FURSAN tag.",
    valuesTitle: "THE FOUR PILLARS",
    valuesSub: "Written in 2020. Still the law of the land.",
    values: [
      { title: "Respect", description: "Opponents, teammates, staff and civilians — everyone gets the baseline. Disrespect is the only unforgivable stat." },
      { title: "Discipline", description: "Punctual scrims, clean comms, finished applications. Discipline is the bridge between talent and results." },
      { title: "Belonging", description: "New members are not recruits — they are FURSAN from day one. The crest is earned by showing up, not by seniority." },
      { title: "Progress", description: "VODs reviewed, ranks climbed, academies passed. If nothing improved this month, we did something wrong." },
    ],
    quote: "Talent wins matches. Standards build dynasties.",
    quoteAuthor: "The Founding Council, 2020",
    featuresTitle: "LIFE INSIDE FURSAN",
    features: [
      { title: "Weekly Tournaments", description: "Internal cups with real brackets, real casting and real bragging rights." },
      { title: "Creator Program", description: "Editors, casters and streamers get resources, thumbnails slots and event coverage." },
      { title: "IRL Meetups", description: "From Casablanca bootcamps to tournament viewings — the Discord becomes real." },
      { title: "Support Desk", description: "Tickets answered by trained staff, with decisions explained in writing." },
    ],
    ctaTitle: "THE CITY IS WAITING",
    ctaDescription: "Introduce yourself, read the handbook, and find your division. FURSAN moves together.",
    ctaButton: "Join the Discord",
  },
  esports: {
    heroEyebrow: "FURSAN ESPORTS",
    heroTitle: "COMPETE UNDER THE CREST",
    heroDescription: "Four programs, one standard. Trials are earned, rosters are fought for, and every FURSAN jersey is backed by a real support staff.",
    introTitle: "THE PROGRAMS",
    introBody: "Each program runs its own calendar, coaching and recruitment. Statuses below are live — when a program opens, the application button goes live on this page.",
    journeyTitle: "FROM APPLICATION TO ARENA",
    journeySub: "Every FURSAN competitor walks the same road.",
    journey: [
      { title: "Apply", description: "Submit your application — a program lead reads every single one and replies within 72 hours." },
      { title: "Trial", description: "Two weeks of scrims and review. Attitude and comms count as much as mechanics." },
      { title: "Integrate", description: "Meet the squad, receive your roles, schedule and kit. You are inside the structure." },
      { title: "Represent", description: "Wear the horse. Leagues, cups and the FURSAN name on your back in every lobby." },
    ],
    applyNote: "Applications only open for programs with OPEN status. One application per program — quality over quantity.",
  },
  ems: {
    heroEyebrow: "SAN ANDREAS EMS",
    heroTitle: "PATIENT FIRST. ALWAYS.",
    heroDescription: "The medical division of FURSAN Roleplay. Whitelisted medics who answer every code with protocol, calm and genuine care for the story.",
    introTitle: "THE DEPARTMENT",
    introBody:
      "San Andreas EMS keeps the city breathing. Our medics run realistic triage, hospital intake and inter-facility transport inside a serious RP framework. Every member passes the EMS Academy — medical knowledge, radio discipline and scene safety — before their first shift.\\n\\nWe do not chase call volume. We chase the moment a player says “that was the best medical RP I've had on this server.”",
    principlesTitle: "THE THREE DOCTRINES",
    principles: [
      { title: "Patient First", description: "The scene is only safe when the patient is cared for. Triage, treatment and transport — without shortcuts, without ego." },
      { title: "Team Response", description: "Codes are answered as a unit. Clear comms, assigned roles, calm corridors. Nobody improvises alone." },
      { title: "Clinical RP", description: "Realistic medicine inside RP logic — no fake cures, no magic, no negligence. The chart is part of the story." },
    ],
    requirementsTitle: "RECRUITMENT REQUIREMENTS",
    ranksTitle: "RANK STRUCTURE",
    applyCta: "Apply for EMS",
  },
  lspd: {
    heroEyebrow: "LOS SANTOS POLICE DEPARTMENT",
    heroTitle: "SERVE THE STORY. PROTECT THE CITY.",
    heroDescription: "The police division of FURSAN Roleplay. Professional officers who understand that every stop, pursuit and standoff is somebody's story too.",
    introTitle: "THE DEPARTMENT",
    introBody:
      "The LSPD is the backbone of serious roleplay on the FURSAN server. Our officers train through a full academy — penal code basics, pursuit discipline, firearms safety and de-escalation — before pinning the badge.\\n\\nWe measure ourselves by the calls people remember: the traffic stop that ended in laughter, the pursuit that ended fairly, the standoff that ended with a story, not a respawn.",
    principlesTitle: "THE THREE DOCTRINES",
    principles: [
      { title: "Professional Conduct", description: "Clean comms, neutral attitude, zero power-tripping. The badge is borrowed, and it can be returned." },
      { title: "Proportionate Action", description: "Force escalates only as the situation demands. De-escalation is a skill we grade, not a suggestion." },
      { title: "Story-Led Policing", description: "Every interaction is a scene. We police to create moments citizens will retell — not to end their night." },
    ],
    requirementsTitle: "RECRUITMENT REQUIREMENTS",
    ranksTitle: "RANK STRUCTURE",
    applyCta: "Apply for LSPD",
  },
  footer: {
    description: "A Moroccan competitive gaming and serious FiveM roleplay organisation. Built in 2020 by five friends — now home to hundreds.",
    builtLine: "BUILT FOR THE NEXT GENERATION",
    copyright: "FURSAN COMMUNITY. All rights reserved.",
  },
};

export type Content = typeof DEFAULT_CONTENT;

/* ------------------------------------------------------------------ */
/* Seed tables                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_GAMES: Game[] = [
  { id: "fifa", title: "FIFA / EA FC", status: "open", description: "The flagship program. 1v1 competitive ladder, Pro Clubs project and an internal weekly league with coaching on build-up, defending and set pieces. Selected players represent FURSAN in regional online cups." },
  { id: "efootball", title: "eFootball", status: "temp", description: "Console and mobile division focused on the eFootball league calendar. We look for patient possession players with elite finishing and the temperament for long tournament days." },
  { id: "valorant", title: "Valorant", status: "open", description: "A five-stack project with IGL structure, disciplined defaults, anti-eco protocols and twice-weekly VOD review. Trialists scrimmage with the academy squad before roster decisions." },
  { id: "cs", title: "Counter-Strike", status: "closed", description: "Premier and FACEIT squads in a rebuilding phase. The project relaunches with a full staff announcement on Discord — wishlist your spot through the community hub." },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "ems",
    name: "San Andreas EMS",
    tagline: "Patient First. Always.",
    status: "open",
    intro: "The medical division answers every code with protocol and heart.",
    requirements: [
      "At least 16 years old",
      "100+ hours of serious RP experience",
      "Working microphone and stable connection",
      "Pass the EMS Academy (triage, radio discipline, scene safety)",
      "Clean disciplinary record across FURSAN services",
      "Minimum 2 shifts per week once on duty roster",
    ],
    ranks: [
      { title: "Recruit", desc: "Academy phase — classroom, ride-alongs and supervised calls." },
      { title: "EMT", desc: "Full basic-life-support certification, solo response allowed." },
      { title: "Paramedic", desc: "Advanced care, field triage lead on multi-casualty scenes." },
      { title: "Senior Paramedic", desc: "Trains recruits and owns unit readiness." },
      { title: "Lieutenant", desc: "Shift supervisor — scene command and hospital flow." },
      { title: "Captain", desc: "Runs training cycles and inter-department protocols." },
      { title: "Chief of EMS", desc: "Department command, appointed by the Founding Council." },
    ],
  },
  {
    id: "lspd",
    name: "Los Santos Police Department",
    tagline: "Serve the story. Protect the city.",
    status: "open",
    intro: "The metropolitan division polices with discipline and narrative intent.",
    requirements: [
      "At least 16 years old",
      "150+ hours of serious RP experience",
      "Working microphone and stable connection",
      "Pass the LSPD Academy (penal code, driving, firearms, de-escalation)",
      "Clean disciplinary record across FURSAN services",
      "Minimum 2 patrols per week once on duty roster",
    ],
    ranks: [
      { title: "Cadet", desc: "Academy phase — written exams, driving course, range qualification." },
      { title: "Officer I", desc: "Patrol certified, supervised shifts in any district." },
      { title: "Officer II", desc: "Independent patrol, eligible for specialty tryouts." },
      { title: "Senior Officer", desc: "Field training officer — certifies new cadets." },
      { title: "Sergeant", desc: "Watch supervisor — pursuit command and scene control." },
      { title: "Lieutenant", desc: "Division leads: detective bureau, traffic, SWAT liaison." },
      { title: "Captain", desc: "Bureau command and department policy." },
      { title: "Chief of Police", desc: "Department command, appointed by the Founding Council." },
    ],
  },
];

const DEFAULT_STAFF: StaffMember[] = [
  { id: "stf-1", username: "JOMALI", discord: "jomali", role: "Founder · President", department: "Command", permissions: ["applications", "esports", "departments", "content", "staff", "discord", "settings"] },
  { id: "stf-2", username: "LADROOK", discord: "ladrook", role: "Founder · Esports Director", department: "Esports", permissions: ["applications", "esports", "content"] },
  { id: "stf-3", username: "MURPHY", discord: "murphy", role: "Founder · RP Director", department: "EMS / LSPD", permissions: ["applications", "departments", "content"] },
  { id: "stf-4", username: "OGAMING093", discord: "ogaming093", role: "Founder · Community Lead", department: "Community", permissions: ["applications", "content"] },
  { id: "stf-5", username: "FERDA", discord: "ferda", role: "Founder · Operations", department: "Command", permissions: ["applications", "staff", "settings"] },
];

const DEFAULT_SETTINGS: SiteSettings = {
  communityName: "FURSAN COMMUNITY",
  discordInvite: "https://discord.gg/fursan",
  memberCount: 2400,
  serverOnline: true,
  socials: {
    youtube: "https://youtube.com/@fursancommunity",
    instagram: "https://instagram.com/fursancommunity",
    x: "https://x.com/fursan_gg",
    tiktok: "https://tiktok.com/@fursancommunity",
    twitch: "https://twitch.tv/fursancommunity",
  },
  footerText: "FURSAN COMMUNITY is an independent organisation. Not affiliated with EA Sports, Konami, Riot Games, Valve, Rockstar Games or Take-Two Interactive.",
};

const DEFAULT_DISCORD: DiscordSettings = {
  enabled: false,
  guildId: "",
  tokenEnc: null,
  roles: { fifa: "", efootball: "", valorant: "", cs: "", ems: "", lspd: "" },
  lastTest: null,
};

export const DEFAULT_IMAGES: SiteImages = {
  logo: "https://image.qwenlm.ai/generated-images/b14a9796-903b-4066-a8af-a7c49182d49d/_result.png",
  homeHero: "https://image.qwenlm.ai/generated-images/af95b017-184d-458a-ae82-5a6fff449e72/_result.png",
  founders: "https://image.qwenlm.ai/generated-images/92ba89d8-732b-4453-a5ff-854bac4b364d/_result.png",
  communityHero: "https://image.qwenlm.ai/generated-images/19d214b1-d1f2-43b6-aa28-440c383ded18/_result.png",
  esportsHero: "https://image.qwenlm.ai/generated-images/9ed70146-0070-4c23-80e3-9fd519ce698a/_result.png",
  emsHero: "https://image.qwenlm.ai/generated-images/260511b8-950d-4e51-b95a-edb81f75afa1/_result.png",
  lspdHero: "https://image.qwenlm.ai/generated-images/e332127c-2e30-4106-85e5-ddcf05799b3e/_result.png",
};

export const IMAGE_META: { key: keyof SiteImages; label: string }[] = [
  { key: "logo", label: "Main Logo (transparent PNG recommended)" },
  { key: "homeHero", label: "Home Hero Image" },
  { key: "founders", label: "Founders Image" },
  { key: "communityHero", label: "Community Hero Image" },
  { key: "esportsHero", label: "Esports Hero Image" },
  { key: "emsHero", label: "EMS Hero Image" },
  { key: "lspdHero", label: "LSPD Hero Image" },
];

export const ROLE_META = [
  { key: "fifa", label: "FIFA / EA FC Role ID" },
  { key: "efootball", label: "eFootball Role ID" },
  { key: "valorant", label: "Valorant Role ID" },
  { key: "cs", label: "Counter-Strike Role ID" },
  { key: "ems", label: "EMS Role ID" },
  { key: "lspd", label: "LSPD Role ID" },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export interface DB {
  admins: AdminRecord[];
  admin_sessions: SessionRecord[];
  applications: Application[];
  staff: StaffMember[];
  games: Game[];
  departments: Department[];
  settings: SiteSettings;
  discord: DiscordSettings;
  images: SiteImages;
  content: Content;
  rate_limits: RateEntry[];
  seededAt: string;
}

const DB_KEY = "fursan_db_v1";
const SESSION_KEY = "fursan_session_token";

let db: DB | null = null;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function freshDB(): DB {
  const adminUser = (import.meta.env.VITE_ADMIN_DEFAULT_USERNAME ?? "admin").trim() || "admin";
  const adminPass = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD ?? "fursan2020";
  return {
    admins: [
      {
        id: "adm-root",
        username: adminUser,
        passwordHash: hashPassword(adminPass),
        createdAt: new Date().toISOString(),
      },
    ],
    admin_sessions: [],
    applications: [],
    staff: DEFAULT_STAFF,
    games: DEFAULT_GAMES,
    departments: DEFAULT_DEPARTMENTS,
    settings: DEFAULT_SETTINGS,
    discord: DEFAULT_DISCORD,
    images: DEFAULT_IMAGES,
    content: structuredClone(DEFAULT_CONTENT),
    rate_limits: [],
    seededAt: new Date().toISOString(),
  };
}

function load(): DB {
  if (db) return db;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && parsed.admins && parsed.content && parsed.settings) {
        // Backfill any structures added in newer versions without re-seeding.
        parsed.rate_limits = parsed.rate_limits ?? [];
        parsed.admin_sessions = parsed.admin_sessions ?? [];
        parsed.images = { ...DEFAULT_IMAGES, ...parsed.images };
        parsed.discord = { ...DEFAULT_DISCORD, ...parsed.discord };
        parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        parsed.content = { ...structuredClone(DEFAULT_CONTENT), ...parsed.content };
        db = parsed;
        return db;
      }
    }
  } catch {
    /* corrupted store — reseed below */
  }
  db = freshDB();
  persist();
  return db;
}

function persist() {
  if (!db) return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage full — keep in-memory copy */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === DB_KEY) {
      db = null;
      version++;
      emit();
    }
  });
}

export function getDB(): DB {
  return load();
}

export function mutate<T>(fn: (d: DB) => T): T {
  const d = load();
  const result = fn(d);
  persist();
  version++;
  emit();
  return result;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getVersion(): number {
  load();
  return version;
}

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token: string | null) {
  if (token) localStorage.setItem(SESSION_KEY, token);
  else localStorage.removeItem(SESSION_KEY);
}
`,Ze=`/**
 * Shared field specs + validation used by BOTH the public forms and the
 * API layer (which re-validates every write, server-style).
 */
import type { AppType } from "./db";

export interface FieldSpec {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export const COMMON_FIELDS: FieldSpec[] = [
  { key: "fullName", label: "Full Name", type: "text", required: true, placeholder: "e.g. Yassine El Amrani", maxLength: 80 },
  { key: "discordUsername", label: "Discord Username", type: "text", required: true, placeholder: "e.g. fursan_rider", maxLength: 60, hint: "Your current Discord username (not the old #tag)." },
  { key: "discordId", label: "Discord User ID", type: "text", required: true, placeholder: "e.g. 245183659430576128", maxLength: 22, hint: "Numeric ID, 16–22 digits. Enable Developer Mode in Discord → right-click your profile → Copy User ID." },
  { key: "age", label: "Age", type: "number", required: true, placeholder: "e.g. 19", min: 13, max: 99 },
  { key: "country", label: "Country / Timezone", type: "text", required: true, placeholder: "e.g. Morocco — GMT+1", maxLength: 60 },
];

export const ESPORTS_FIELDS: FieldSpec[] = [
  { key: "program", label: "Program", type: "select", required: true, options: [] },
  { key: "platform", label: "Platform", type: "select", required: true, options: ["PC", "PlayStation", "Xbox", "Mobile", "Cross-platform"] },
  { key: "gameId", label: "Player / Game ID", type: "text", required: true, placeholder: "In-game name, EA ID, Riot ID or Steam profile", maxLength: 120 },
  { key: "currentRank", label: "Current Rank", type: "text", required: true, placeholder: "e.g. Division Rivals Elite / Immortal 2 / Premier 18k", maxLength: 80 },
  { key: "peakRank", label: "Peak Rank (when relevant)", type: "text", placeholder: "e.g. Radiant peak — Act 3", maxLength: 80 },
  { key: "mainRole", label: "Main Role / Agents", type: "text", required: true, placeholder: "e.g. IGL / Duelist — Jett, Raze", maxLength: 120 },
  { key: "prevTeams", label: "Previous Teams", type: "textarea", rows: 3, placeholder: "Team names, rosters and time periods. Write “None” if this is your first org.", maxLength: 600 },
  { key: "compExperience", label: "Competitive Experience", type: "textarea", required: true, rows: 4, placeholder: "Leagues, ladders, scrims, ranked seasons — anything that shows your level.", maxLength: 1200 },
  { key: "tournamentExperience", label: "Tournament Experience", type: "textarea", rows: 3, placeholder: "Notable placements, cups and LANs.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 5 days/week, evenings GMT+1, weekends full", maxLength: 200 },
  { key: "whyFursan", label: "Why do you want to join FURSAN?", type: "textarea", required: true, rows: 5, placeholder: "Be honest — we read every word.", maxLength: 1500 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, placeholder: "VOD links, clips, references…", maxLength: 800 },
];

export const EMS_FIELDS: FieldSpec[] = [
  { key: "fivemName", label: "FiveM Name", type: "text", required: true, placeholder: "e.g. Amine Bouzid", maxLength: 80, hint: "Your full roleplay character name." },
  { key: "rpHours", label: "RP Hours", type: "text", required: true, placeholder: "e.g. 450+ hours on whitelist servers", maxLength: 120 },
  { key: "prevEms", label: "Previous EMS Experience", type: "textarea", rows: 3, placeholder: "Any medical department experience in FiveM or other RP frameworks. Write “None” if new.", maxLength: 800 },
  { key: "prevDepartments", label: "Previous Departments & Servers", type: "textarea", rows: 3, placeholder: "Servers, departments and ranks held.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 4 shifts/week, evenings GMT+1", maxLength: 200 },
  { key: "motivation", label: "Motivation", type: "textarea", required: true, rows: 5, placeholder: "Why San Andreas EMS? Why now?", maxLength: 1500 },
  { key: "medicalScenario", label: "Medical Roleplay Scenario", type: "textarea", required: true, rows: 5, placeholder: "A player is down after a 2-story fall with heavy bleeding. Walk us through your response step by step.", maxLength: 1800 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, maxLength: 800 },
];

export const LSPD_FIELDS: FieldSpec[] = [
  { key: "fivemName", label: "FiveM Name", type: "text", required: true, placeholder: "e.g. Karim Haddad", maxLength: 80, hint: "Your full roleplay character name." },
  { key: "rpHours", label: "RP Hours", type: "text", required: true, placeholder: "e.g. 600+ hours on serious RP servers", maxLength: 120 },
  { key: "prevPolice", label: "Previous Police Experience", type: "textarea", rows: 3, placeholder: "Any police department experience in FiveM or other RP frameworks. Write “None” if new.", maxLength: 800 },
  { key: "prevDepartments", label: "Previous Departments & Servers", type: "textarea", rows: 3, placeholder: "Servers, departments and ranks held.", maxLength: 800 },
  { key: "availability", label: "Availability", type: "text", required: true, placeholder: "e.g. 4 patrols/week, nights GMT+1", maxLength: 200 },
  { key: "trafficStop", label: "Scenario — Traffic Stop", type: "textarea", required: true, rows: 4, placeholder: "You pull over a vehicle that ran a red light. The driver becomes hostile. How do you handle it?", maxLength: 1800 },
  { key: "pursuit", label: "Scenario — High-Speed Pursuit", type: "textarea", required: true, rows: 4, placeholder: "A stolen Sultan RS refuses to stop in a busy downtown. Describe your pursuit discipline.", maxLength: 1800 },
  { key: "armedSuspect", label: "Scenario — Armed Suspect", type: "textarea", required: true, rows: 4, placeholder: "An armed suspect is cornered in an alley with civilians nearby. Walk us through your decisions.", maxLength: 1800 },
  { key: "professionalRp", label: "What Professional Roleplay Means To You", type: "textarea", required: true, rows: 4, maxLength: 1500 },
  { key: "additional", label: "Additional Information", type: "textarea", rows: 3, maxLength: 800 },
];

export function fieldsFor(type: AppType): FieldSpec[] {
  if (type === "esports") return [...COMMON_FIELDS, ...ESPORTS_FIELDS];
  if (type === "ems") return [...COMMON_FIELDS, ...EMS_FIELDS];
  return [...COMMON_FIELDS, ...LSPD_FIELDS];
}

export function sanitize(value: string, maxLength = 2000): string {
  return value
    .replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultiline(value: string, maxLength = 2000): string {
  return value
    .replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export const DISCORD_ID_RE = /^\\d{16,22}$/;

export function validateDiscordId(id: string): boolean {
  return DISCORD_ID_RE.test(id.trim());
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  data: Record<string, string>;
}

export function validateApplication(
  type: AppType,
  raw: Record<string, string>,
  allowedPrograms: string[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const data: Record<string, string> = {};
  const specs = fieldsFor(type);

  for (const spec of specs) {
    const value = (raw[spec.key] ?? "").toString();
    const clean =
      spec.type === "textarea"
        ? sanitizeMultiline(value, spec.maxLength ?? 2000)
        : sanitize(value, spec.maxLength ?? 400);
    data[spec.key] = clean;

    if (spec.required && clean.length === 0) {
      errors[spec.key] = \`\${spec.label} is required.\`;
      continue;
    }
    if (clean.length === 0) continue;

    if (spec.type === "number") {
      const n = Number(clean);
      if (!Number.isInteger(n)) errors[spec.key] = \`\${spec.label} must be a whole number.\`;
      else if (spec.min != null && n < spec.min) errors[spec.key] = \`\${spec.label} must be at least \${spec.min}.\`;
      else if (spec.max != null && n > spec.max) errors[spec.key] = \`\${spec.label} must be at most \${spec.max}.\`;
    }
    if (spec.key === "discordId" && !DISCORD_ID_RE.test(clean)) {
      errors[spec.key] = "Discord User ID must be 16–22 digits.";
    }
    if (spec.key === "age") {
      const n = Number(clean);
      if (Number.isInteger(n) && (n < 13 || n > 99)) errors[spec.key] = "Age must be between 13 and 99.";
    }
    if (spec.type === "select" && spec.key === "platform" && !spec.options!.includes(clean)) {
      errors[spec.key] = "Select a valid platform.";
    }
  }

  if (type === "esports") {
    if (!data.program || !allowedPrograms.includes(data.program)) {
      errors.program = "Select a valid program.";
    }
    for (const k of ["compExperience", "whyFursan"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }
  if (type === "ems") {
    for (const k of ["motivation", "medicalScenario"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }
  if (type === "lspd") {
    for (const k of ["trafficStop", "pursuit", "armedSuspect", "professionalRp"]) {
      if (!errors[k] && data[k] && data[k].length < 30) errors[k] = "Give us a little more detail (30+ characters).";
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, data };
}
`,$e=`import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
`,Ve=`import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ApplicationForm } from "../components/ApplicationForm";
import { IconArrow, Reveal } from "../components/ui";
import type { AppType } from "../lib/db";

const TITLES: Record<AppType, { eyebrow: string; title: string; back: string; backTo: string }> = {
  esports: { eyebrow: "FURSAN Esports · Direct Application", title: "JOIN THE ROSTERS", back: "Back to Esports", backTo: "/esports" },
  ems: { eyebrow: "San Andreas EMS · Direct Application", title: "ENLIST AS A MEDIC", back: "Back to EMS", backTo: "/ems" },
  lspd: { eyebrow: "Los Santos PD · Direct Application", title: "ENLIST AS AN OFFICER", back: "Back to LSPD", backTo: "/lspd" },
};

export default function Apply() {
  const { kind } = useParams<{ kind: string }>();
  const [params] = useSearchParams();
  if (!kind || !["esports", "ems", "lspd"].includes(kind)) return <Navigate to="/" replace />;
  const k = kind as AppType;
  const meta = TITLES[k];
  const program = params.get("program") ?? undefined;

  return (
    <div className="pt-[72px]">
      <section className="relative py-16 overflow-hidden border-b border-gold/10">
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] glow-red" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <Link to={meta.backTo} className="inline-flex items-center gap-2 font-cond uppercase tracking-[0.2em] text-xs text-gold hover:text-goldsoft transition-colors mb-6">
              <IconArrow className="w-4 h-4 rotate-180" /> {meta.back}
            </Link>
            <p className="font-cond uppercase tracking-[0.3em] text-gold text-xs mb-3">{meta.eyebrow}</p>
            <h1 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.9]">
              {meta.title.split(" ").slice(0, -1).join(" ")} <span className="metal-text">{meta.title.split(" ").slice(-1)}</span>
            </h1>
            <p className="mt-4 text-ash max-w-2xl">
              This is the official direct URL for {k === "esports" ? "esports" : k.toUpperCase()} applications.
              Every field is validated and stored securely — you will receive a private reference code.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="gold-frame cut">
              <ApplicationForm key={\`\${k}-\${program ?? ""}\`} kind={k} presetProgram={program} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
`,Ke=`import { useApp } from "../context/AppContext";
import { IconDiscord, LinkBtn, Reveal, SectionHead } from "../components/ui";

const ROMAN = ["I", "II", "III", "IV"];

export default function Community() {
  const { db } = useApp();
  const c = db.content.community;
  const s = db.settings;

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.communityHero} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute top-10 right-0 w-[560px] h-[560px] glow-red" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> {c.heroEyebrow}
            </p>
            <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.88] tracking-wide">
              {c.heroTitle.split(" ").slice(0, -2).join(" ")} <span className="metal-text">{c.heroTitle.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{c.heroDescription}</p>
          </Reveal>
        </div>
      </section>

      {/* STORY + MISSION */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-start">
          <Reveal>
            <SectionHead eyebrow="Since 2020" title={c.storyTitle} />
            <div className="mt-8 space-y-5">
              {c.storyBody.split("\\n\\n").map((p, i) => (
                <p key={i} className={\`leading-relaxed text-lg \${i === 0 ? "text-bone first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8] first-letter:text-gold" : "text-ash"}\`}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="gold-frame cut p-8 lg:sticky lg:top-28">
              <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold mb-4">{c.missionTitle}</p>
              <p className="font-display text-3xl leading-[1.05] tracking-wide text-bone">{c.missionBody}</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={db.images.logo} alt="" className="w-12 h-12 object-contain mix-blend-screen" />
                <span className="font-cond uppercase tracking-[0.24em] text-[11px] text-ash">FURSAN · الفُرسان</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute -top-20 left-0 w-[500px] h-[500px] glow-gold" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="The Code" title={c.valuesTitle} sub={c.valuesSub} />
          <div className="mt-14 grid md:grid-cols-2 gap-x-16 gap-y-12">
            {c.values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 120} className={i % 2 === 1 ? "md:translate-y-10" : ""}>
                <div className="flex gap-6 group">
                  <span className="font-display text-7xl leading-none text-outline group-hover:text-gold/30 transition-colors select-none">
                    {ROMAN[i]}
                  </span>
                  <div className="border-l-2 border-gold/30 group-hover:border-gold transition-colors pl-6">
                    <h3 className="font-display text-3xl tracking-wide group-hover:text-goldsoft transition-colors">{v.title}</h3>
                    <p className="mt-2.5 text-ash leading-relaxed">{v.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-50" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="font-display text-[9rem] leading-[0.4] metal-text block mb-8 select-none" aria-hidden="true">“</span>
          <blockquote className="font-display text-4xl sm:text-6xl leading-[1.02] tracking-wide">
            {c.quote}
          </blockquote>
          <p className="mt-8 font-cond uppercase tracking-[0.3em] text-sm text-gold">— {c.quoteAuthor}</p>
        </Reveal>
      </section>

      {/* FEATURE CARDS */}
      <section className="relative py-24 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Member Life" title={c.featuresTitle} />
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {c.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 100}>
                <article className="panel panel-hover hud cut p-8 flex gap-6 items-start h-full">
                  <span className="font-display text-5xl metal-text leading-none">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl tracking-wide mb-2">{f.title}</h3>
                    <p className="text-ash leading-relaxed">{f.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-navy border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] glow-red" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">{c.ctaTitle}</h2>
          <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">{c.ctaDescription}</p>
          <LinkBtn href={s.discordInvite} external className="mt-9 min-w-[230px]">
            <IconDiscord className="w-4 h-4" /> {c.ctaButton}
          </LinkBtn>
        </Reveal>
      </section>
    </div>
  );
}
`,Xe=`import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApplicationModal } from "../components/ApplicationForm";
import {
  Btn, IconArrow, IconBadge, IconBook, IconGauge, IconHeartline, IconMedical, IconScales,
  IconUsers, Reveal, SectionHead, StatusPill,
} from "../components/ui";

const ICONS: Record<string, Record<number, (p: { className?: string }) => JSX.Element>> = {
  ems: { 0: IconHeartline, 1: IconUsers, 2: IconMedical },
  lspd: { 0: IconScales, 1: IconGauge, 2: IconBook },
};

export default function Department({ slug }: { slug: "ems" | "lspd" }) {
  const { db } = useApp();
  const c = db.content[slug];
  const dep = db.departments.find((d) => d.id === slug)!;
  const heroImg = slug === "ems" ? db.images.emsHero : db.images.lspdHero;
  const CrestIcon = slug === "ems" ? IconMedical : IconBadge;
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />
          <div className={\`absolute inset-0 bg-gradient-to-r \${slug === "ems" ? "from-ink/85" : "from-ink/85"} to-transparent\`} />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className={\`absolute top-10 right-0 w-[600px] h-[600px] \${slug === "ems" ? "glow-gold" : "glow-red"}\`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> {c.heroEyebrow}
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-wide max-w-4xl">
              {c.heroTitle}
            </h1>
            <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{c.heroDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StatusPill status={dep.status} />
              {dep.status === "open" ? (
                <Btn onClick={() => setApplyOpen(true)} className="min-w-[210px]">{c.applyCta}</Btn>
              ) : (
                <span className="font-cond uppercase tracking-[0.18em] text-xs text-ash">
                  Intake paused — openings announced on Discord
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <Reveal>
            <SectionHead eyebrow="Department Briefing" title={c.introTitle} />
            <div className="mt-8 space-y-5">
              {c.introBody.split("\\n\\n").map((p, i) => (
                <p key={i} className="text-ash text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="gold-frame cut p-8 lg:sticky lg:top-28">
              <span className="cut-sm w-14 h-14 p-3 flex items-center justify-center border border-gold/40 text-gold bg-gold/8 mb-6">
                <CrestIcon className="w-8 h-8" />
              </span>
              <p className="font-display text-4xl tracking-wide leading-none">{dep.name}</p>
              <p className="mt-2 font-cond uppercase tracking-[0.24em] text-xs text-gold/90">{dep.tagline}</p>
              <div className="mt-6 pt-6 border-t border-bone/10 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ash">Chain of ranks</span><span className="text-bone font-semibold">{dep.ranks.length}</span></div>
                <div className="flex justify-between"><span className="text-ash">Entry requirements</span><span className="text-bone font-semibold">{dep.requirements.length}</span></div>
                <div className="flex justify-between"><span className="text-ash">Intake</span><span className={\`font-semibold \${dep.status === "open" ? "text-emerald-300" : "text-red-300"}\`}>{dep.status === "open" ? "Open" : dep.status === "temp" ? "Paused" : "Closed"}</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] glow-red opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Doctrine" title={c.principlesTitle} />
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {c.principles.map((p, i) => {
              const Icon = ICONS[slug][i] ?? IconScales;
              return (
                <Reveal key={p.title} delay={i * 120}>
                  <article className="panel panel-hover hud cut p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className={\`cut-sm w-13 h-13 p-3 flex items-center justify-center border \${slug === "ems" ? "border-gold/40 text-gold bg-gold/8" : "border-blood/50 text-bloodbright bg-blood/10"}\`}>
                        <Icon className="w-7 h-7" />
                      </span>
                      <span className="font-display text-5xl text-outline">0{i + 1}</span>
                    </div>
                    <h3 className="font-display text-3xl tracking-wide mb-3">{p.title}</h3>
                    <p className="text-ash leading-relaxed">{p.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS + RANKS */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14">
          <Reveal>
            <SectionHead eyebrow="Before You Apply" title={c.requirementsTitle} />
            <ul className="mt-9 space-y-4">
              {dep.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <span className="cut-sm shrink-0 w-7 h-7 mt-0.5 flex items-center justify-center border border-gold/40 text-gold bg-gold/8 group-hover:bg-gold group-hover:text-ink transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 12.5 9.5 18 20 6.5" /></svg>
                  </span>
                  <span className="text-bone/90 leading-relaxed pt-0.5">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <SectionHead eyebrow="Career Path" title={c.ranksTitle} />
            <ol className="mt-9 relative border-l border-gold/25 ml-3 space-y-7">
              {dep.ranks.map((r, i) => (
                <li key={r.title} className="relative pl-8 group">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 cut-sm bg-ink border border-gold/60 group-hover:bg-gold transition-colors" />
                  <p className="font-display text-2xl tracking-wide group-hover:text-goldsoft transition-colors">
                    <span className="text-gold/60 text-base mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {r.title}
                  </p>
                  <p className="mt-1 text-ash text-[15px] leading-relaxed">{r.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-navy border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-40" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">
            {slug === "ems" ? "THE CITY NEEDS ITS MEDICS" : "THE CITY NEEDS ITS FINEST"}
          </h2>
          <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">
            Applications go straight to {dep.name} command. Bring discipline — the academy handles the rest.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {dep.status === "open" ? (
              <Btn onClick={() => setApplyOpen(true)} className="min-w-[230px]">
                {c.applyCta} <IconArrow className="w-4 h-4" />
              </Btn>
            ) : (
              <span className="font-cond uppercase tracking-[0.2em] text-sm text-ash border border-bone/15 px-6 py-3 cut-sm">
                Recruitment {dep.status === "temp" ? "temporarily " : ""}closed
              </span>
            )}
          </div>
        </Reveal>
      </section>

      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} kind={slug} />
    </div>
  );
}
`,Je=`import { useMemo, useState } from "react";
import { downloadProjectZip, formatBytes, getExportEntries } from "../lib/zipExport";
import { useApp } from "../context/AppContext";
import { Btn, IconCheck, IconUpload, Reveal, Spinner } from "../components/ui";

export default function Download() {
  const { db } = useApp();
  const entries = useMemo(() => getExportEntries(), []);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ files: number; name: string } | null>(null);

  const total = entries.reduce((s, e) => s + e.size, 0);
  const groups = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const top = e.path.includes("/") ? e.path.split("/")[0] : "(root)";
      if (!map.has(top)) map.set(top, []);
      map.get(top)!.push(e);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [entries]);

  return (
    <div className="pt-[72px]">
      <section className="relative py-16 border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-24 right-0 w-[520px] h-[520px] glow-red" />
        <div className="absolute -bottom-40 left-0 w-[520px] h-[520px] glow-gold" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.3em] text-gold text-xs mb-3 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> Project Source · Build-time snapshot
            </p>
            <h1 className="font-display text-6xl sm:text-8xl leading-[0.88] tracking-wide">
              EXPORT <span className="metal-text">EVERYTHING</span>
            </h1>
            <p className="mt-5 text-ash text-lg max-w-2xl leading-relaxed">
              The complete {db.settings.communityName} codebase — every component, the API layer, the
              database schema, deployment docs and environment template — packaged into a single ZIP,
              generated live from the files running this site.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="cut-sm px-4 py-2 border border-gold/35 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-gold/90">
                {entries.length + 1} files
              </span>
              <span className="cut-sm px-4 py-2 border border-gold/35 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-gold/90">
                {formatBytes(total)} source
              </span>
              <span className="cut-sm px-4 py-2 border border-bone/15 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-ash">
                fursan-community-source.zip
              </span>
            </div>

            <div className="mt-9">
              {done ? (
                <div className="cut-sm inline-flex items-center gap-3 px-6 py-4 border border-emerald-400/50 bg-emerald-950/50 text-emerald-200">
                  <IconCheck className="w-5 h-5" />
                  <span>
                    <strong>{done.name}</strong> saved — {done.files} files inside. Run{" "}
                    <code className="font-mono text-emerald-300">npm install</code> then{" "}
                    <code className="font-mono text-emerald-300">npm run dev</code>.
                  </span>
                </div>
              ) : (
                <Btn
                  busy={busy}
                  className="min-w-[280px] !py-4 !text-base"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const res = await downloadProjectZip();
                      setDone(res);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Compressing…" : (<><IconUpload className="w-5 h-5 rotate-180" /> Download Source ZIP</>)}
                </Btn>
              )}
            </div>
            {busy && <p className="mt-3 text-xs text-ash flex items-center gap-2"><Spinner className="w-3.5 h-3.5" /> Deflating archive at level 9…</p>}
          </Reveal>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl tracking-wide mb-2">ARCHIVE MANIFEST</h2>
            <p className="text-ash text-sm mb-8">
              Exactly what lands on your disk. <span className="text-ash/70">package-lock.json and node_modules are excluded — regenerate with npm install. Brand imagery is referenced by URL and swappable from the admin Image Manager.</span>
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {groups.map(([group, files], gi) => (
              <Reveal key={group} delay={gi * 60}>
                <div className="panel cut p-5 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-cond uppercase tracking-[0.2em] text-xs text-gold">{group}/</p>
                    <p className="font-mono text-[11px] text-ash">{files.length} files · {formatBytes(files.reduce((s, e) => s + e.size, 0))}</p>
                  </div>
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
                    {files.map((f) => (
                      <li key={f.path} className="flex items-center justify-between gap-3 text-[13px] border-b border-bone/5 pb-1.5">
                        <span className="font-mono text-bone/85 truncate">{f.path}</span>
                        <span className="font-mono text-[11px] text-ash shrink-0">{formatBytes(f.size)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
`,Qe=`import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApplicationModal } from "../components/ApplicationForm";
import { Btn, IconCrosshair, IconGamepad, IconSwords, IconTrophy, Reveal, SectionHead, StatusPill } from "../components/ui";

const GAME_ICONS: Record<string, (p: { className?: string }) => JSX.Element> = {
  fifa: IconTrophy,
  efootball: IconGamepad,
  valorant: IconCrosshair,
  cs: IconSwords,
};

export default function Esports() {
  const { db } = useApp();
  const c = db.content.esports;
  const [applyFor, setApplyFor] = useState<string | null>(null);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[74vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.esportsHero} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute top-0 right-1/4 w-[560px] h-[560px] glow-red" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> {c.heroEyebrow}
            </p>
            <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.88] tracking-wide">
              {c.heroTitle.split(" ").slice(0, -2).join(" ")} <span className="metal-text">{c.heroTitle.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{c.heroDescription}</p>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Live Status" title={c.introTitle} sub={c.introBody} />
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {db.games.map((g, i) => {
              const Icon = GAME_ICONS[g.id] ?? IconTrophy;
              return (
                <Reveal key={g.id} delay={(i % 2) * 110}>
                  <article className="panel panel-hover hud cut p-8 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-[0.06] group-hover:opacity-10">
                      <Icon className="w-44 h-44" />
                    </div>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <span className="cut-sm w-14 h-14 p-3 flex items-center justify-center border border-gold/40 text-gold bg-gold/8">
                        <Icon className="w-8 h-8" />
                      </span>
                      <StatusPill status={g.status} />
                    </div>
                    <h3 className="font-display text-4xl tracking-wide mb-3">{g.title}</h3>
                    <p className="text-ash leading-relaxed flex-1">{g.description}</p>
                    <div className="mt-7 pt-6 border-t border-bone/8 flex items-center justify-between gap-4">
                      <span className="font-cond uppercase tracking-[0.22em] text-[10px] text-gold/60">
                        Program 0{i + 1} · FURSAN Esports
                      </span>
                      {g.status === "open" ? (
                        <Btn onClick={() => setApplyFor(g.title)} className="!px-5 !py-2.5">Apply Now</Btn>
                      ) : (
                        <span className="font-cond uppercase tracking-[0.18em] text-[11px] text-ash/70">
                          {g.status === "temp" ? "Opens soon — stay tuned" : "Roster locked"}
                        </span>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <p className="mt-8 text-sm text-ash/80 border-l-2 border-gold/50 pl-4 max-w-3xl">{c.applyNote}</p>
          </Reveal>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] glow-red opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="The Road" title={c.journeyTitle} sub={c.journeySub} center />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-[26px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            {c.journey.map((j, i) => (
              <Reveal key={j.title} delay={i * 130}>
                <div className="relative text-center group">
                  <div className="relative z-10 mx-auto w-[52px] h-[52px] cut-sm bg-ink border border-gold/50 flex items-center justify-center font-display text-xl text-gold group-hover:bg-gold group-hover:text-ink transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_rgba(213,169,79,0.7)]">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 font-display text-3xl tracking-[0.08em]">{j.title}</h3>
                  <p className="mt-3 text-ash text-[15px] leading-relaxed max-w-[280px] mx-auto">{j.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ApplicationModal
        open={applyFor !== null}
        onClose={() => setApplyFor(null)}
        kind="esports"
        presetProgram={applyFor ?? undefined}
      />
    </div>
  );
}
`,et=`import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Btn, CountUp, IconArrow, IconCalendar, IconChat, IconCrosshair, IconDiscord, IconGamepad,
  IconMask, IconMedical, IconBadge, IconShield, IconSignal, IconSwords, IconTrophy, LinkBtn,
  parseStat, Reveal, SectionHead, StatusPill,
} from "../components/ui";

const FEATURE_ICONS = [IconSwords, IconTrophy, IconMask, IconCalendar, IconShield, IconChat];

export default function Home() {
  const { db } = useApp();
  const c = db.content.home;
  const s = db.settings;

  const previewMeta = [
    { icon: IconTrophy, to: "/esports", status: db.games.find((g) => g.id === "fifa")?.status ?? "closed" },
    { icon: IconGamepad, to: "/esports", status: db.games.find((g) => g.id === "efootball")?.status ?? "closed" },
    { icon: IconCrosshair, to: "/esports", status: db.games.find((g) => g.id === "valorant")?.status ?? "closed" },
    { icon: IconSwords, to: "/esports", status: db.games.find((g) => g.id === "cs")?.status ?? "closed" },
    { icon: IconMedical, to: "/ems", status: db.departments.find((d) => d.id === "ems")?.status ?? "closed" },
    { icon: IconBadge, to: "/lspd", status: db.departments.find((d) => d.id === "lspd")?.status ?? "closed" },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.homeHero} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-40 right-[-10%] w-[700px] h-[700px] glow-red" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] glow-gold" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center w-full">
          <div>
            <Reveal>
              <img
                src={db.images.logo}
                alt="FURSAN crest"
                className="lg:hidden w-36 h-36 object-contain mix-blend-screen animate-floaty mb-4 -ml-2"
              />
              <div className="flex flex-wrap items-center gap-4 mb-7">
                <span className="cut-sm inline-flex items-center gap-2.5 px-4 py-2 border border-gold/40 bg-ink/60 backdrop-blur-sm">
                  {s.serverOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                      <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-emerald-300">{c.serverLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-red-300">Server Maintenance</span>
                    </>
                  )}
                  <span className="text-bone/30">|</span>
                  <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-ash">{s.memberCount.toLocaleString()}+ members</span>
                </span>
              </div>
              <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
                <span className="h-px w-12 bg-gold/70" />
                {c.eyebrow}
              </p>
              <h1 className="font-display leading-[0.88] tracking-wide text-[17vw] sm:text-7xl lg:text-8xl xl:text-[7.2rem]">
                {c.title.split(" ")[0]}
                <br />
                <span className="metal-text">{c.title.split(" ").slice(1).join(" ") || "COMMUNITY"}</span>
              </h1>
              <p className="mt-5 font-cond uppercase tracking-[0.22em] text-base sm:text-lg text-bloodbright font-semibold">
                {c.tagline}
              </p>
              <p className="mt-6 text-ash text-lg leading-relaxed max-w-xl">{c.description}</p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/community">
                  <Btn className="min-w-[200px]">{c.ctaExplore} <IconArrow className="w-4 h-4" /></Btn>
                </Link>
                <LinkBtn href={s.discordInvite} external variant="outline">
                  <IconDiscord className="w-4 h-4" /> {c.ctaDiscord}
                </LinkBtn>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="hidden lg:block relative">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[480px] h-[480px] glow-red rounded-full blur-2xl" />
              <div className="absolute w-[430px] h-[430px] rounded-full border border-gold/20 animate-spin-slow" style={{ borderStyle: "dashed" }} />
              <div className="absolute w-[360px] h-[360px] rounded-full border border-blood/40" />
              <img
                src={db.images.logo}
                alt="FURSAN crest"
                className="relative w-[400px] h-[400px] object-contain mix-blend-screen animate-floaty drop-shadow-[0_30px_60px_rgba(143,29,24,0.5)]"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gold/70">
                <IconSignal className="w-4 h-4" />
                <span className="font-cond uppercase tracking-[0.3em] text-[10px]">The Knights of Moroccan Gaming</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/50 animate-bounce" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 9l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="relative border-y border-gold/15 bg-navy/80 overflow-hidden py-4">
        <div className="ticker-track">
          {[...c.ticker, ...c.ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-display text-2xl tracking-[0.14em] text-bone/60">
              {t}
              <span className="text-gold/70 text-base">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ STATS ============ */}
      <section className="relative border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4">
          {c.stats.map((st, i) => {
            const { num, suffix } = parseStat(st.value);
            return (
              <Reveal key={st.label} delay={i * 90} className={\`px-6 py-10 \${i > 0 ? "border-l border-bone/8" : ""} \${i >= 2 ? "border-t lg:border-t-0 border-bone/8" : ""}\`}>
                <p className="font-display text-5xl sm:text-6xl metal-text leading-none">
                  <CountUp target={num} suffix={suffix} />
                </p>
                <p className="mt-3 font-cond uppercase tracking-[0.24em] text-[11px] text-ash">{st.label}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="What We Do" title={c.featuresTitle} sub={c.featuresSub} />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal key={f.title} delay={(i % 3) * 110}>
                  <article className="panel panel-hover hud cut p-7 h-full group">
                    <div className={\`cut-sm w-13 h-13 p-3 flex items-center justify-center mb-6 border \${i % 2 === 0 ? "border-gold/40 text-gold bg-gold/8" : "border-blood/50 text-bloodbright bg-blood/10"}\`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-2xl tracking-wide mb-2.5 group-hover:text-goldsoft transition-colors">{f.title}</h3>
                    <p className="text-ash leading-relaxed text-[15px]">{f.description}</p>
                    <span className="mt-5 block font-cond uppercase tracking-[0.24em] text-[10px] text-gold/50">
                      0{i + 1} / FURSAN STANDARD
                    </span>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PREVIEWS ============ */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-red opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Programs & Departments" title={c.previewsTitle} sub={c.previewsSub} />
          <div className="mt-12 divide-y divide-bone/8 border-y border-bone/8">
            {c.previews.map((p, i) => {
              const meta = previewMeta[i];
              const Icon = meta.icon;
              return (
                <Reveal key={p.title} delay={i * 60}>
                  <Link
                    to={meta.to}
                    className="group grid sm:grid-cols-[64px_1.1fr_1.6fr_auto] items-center gap-5 py-6 px-3 transition-all duration-300 hover:bg-gold/[0.04] hover:pl-6"
                  >
                    <span className="cut-sm w-14 h-14 flex items-center justify-center border border-gold/30 text-gold bg-ink group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                      <Icon className="w-7 h-7" />
                    </span>
                    <span>
                      <span className="block font-display text-2xl tracking-wide group-hover:text-goldsoft transition-colors leading-tight">{p.title}</span>
                      <span className="font-cond uppercase tracking-[0.26em] text-[10px] text-gold/70">{p.tag}</span>
                    </span>
                    <span className="text-ash text-[15px] leading-relaxed hidden sm:block">{p.description}</span>
                    <span className="flex items-center gap-4">
                      <StatusPill status={meta.status} />
                      <IconArrow className="w-5 h-5 text-gold/50 group-hover:text-gold group-hover:translate-x-1.5 transition-all" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FOUNDERS ============ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={db.images.founders} alt="" className="w-full h-full object-cover opacity-[0.16]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-red" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="EST. 2020" title={c.foundersTitle} sub={c.foundersSub} center />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {c.founders.map((f, i) => {
              const initials = f.name.slice(0, 2);
              return (
                <Reveal key={f.name + i} delay={i * 100}>
                  <article className="gold-frame cut p-6 h-full flex flex-col items-center text-center group panel-hover relative overflow-hidden">
                    <span className="absolute top-3 left-4 font-display text-4xl text-outline opacity-70">0{i + 1}</span>
                    <div className="mt-8 w-20 h-20 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gradient-to-b from-steel to-ink group-hover:border-gold transition-all duration-500 group-hover:shadow-[0_0_35px_-5px_rgba(213,169,79,0.55)]">
                      <span className="font-display text-3xl metal-text tracking-wider">{initials}</span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl tracking-[0.1em]">{f.name}</h3>
                    <p className="font-cond uppercase tracking-[0.18em] text-[10px] text-gold/80 mt-1">
                      Founder · {s.communityName}
                    </p>
                    <span className="my-4 h-px w-10 bg-gold/40 group-hover:w-16 transition-all duration-500" />
                    <p className="text-ash text-[13px] leading-relaxed">{f.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold mb-4">The Gate Is Open</p>
            <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">
              {c.ctaTitle.split(" ").slice(0, -1).join(" ")} <span className="metal-text">{c.ctaTitle.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">{c.ctaSub}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/community"><Btn className="min-w-[210px]">{c.ctaButton}</Btn></Link>
              <LinkBtn href={s.discordInvite} external variant="outline"><IconDiscord className="w-4 h-4" /> {c.ctaDiscord}</LinkBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
`,tt=`import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import type { Application, AppStatus, AppType } from "../../lib/db";
import { fieldsFor, validateDiscordId } from "../../lib/validation";
import {
  AppStatusBadge, Btn, Field, IconArrow, IconBadge, IconCalendar, IconChat, IconCheck, IconCrosshair,
  IconDiscord, IconEdit, IconGamepad, IconGlobe, IconKey, IconLock, IconMedical, IconNote, IconSearch,
  IconShield, IconSignal, IconSwords, IconTrash, IconTrophy, IconUsers, IconX, Modal, Select, Spinner,
  StatusPill, TextArea, TextInput, useToast,
} from "../../components/ui";
import { EsportsSection, DepartmentsSection, StaffSection, DiscordSection, SettingsSection } from "./AdminSections";
import { ContentSection, ImagesSection } from "./ContentManager";

export type AdminTab = "overview" | "applications" | "esports" | "departments" | "content" | "images" | "staff" | "discord" | "settings";

const NAV: { id: AdminTab; label: string; icon: (p: { className?: string }) => JSX.Element }[] = [
  { id: "overview", label: "Dashboard", icon: IconSignal },
  { id: "applications", label: "Applications", icon: IconNote },
  { id: "esports", label: "Esports Management", icon: IconTrophy },
  { id: "departments", label: "Departments", icon: IconBadge },
  { id: "content", label: "Website Content", icon: IconEdit },
  { id: "images", label: "Image Manager", icon: IconGlobe },
  { id: "staff", label: "Staff Management", icon: IconUsers },
  { id: "discord", label: "Discord Integration", icon: IconDiscord },
  { id: "settings", label: "Settings", icon: IconKey },
];

const TYPE_LABEL: Record<AppType, string> = { esports: "Esports", ems: "EMS", lspd: "LSPD" };

export default function AdminDashboard() {
  const { db, session, sessionChecked, logout } = useApp();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileNav, setMobileNav] = useState(false);

  if (sessionChecked && !session) return <Navigate to="/admin" replace />;
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink pt-[72px] flex">
      {/* sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-gold/12 bg-navy/70 min-h-[calc(100vh-72px)] sticky top-[72px] self-start max-h-[calc(100vh-72px)] overflow-y-auto">
        <div className="p-5 border-b border-bone/8">
          <p className="font-display text-xl tracking-[0.12em]">COMMAND CENTER</p>
          <p className="font-cond uppercase tracking-[0.22em] text-[10px] text-gold/70 mt-0.5">{db.settings.communityName}</p>
        </div>
        <nav className="p-3 flex-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={\`w-full flex items-center gap-3 px-3.5 py-2.5 mb-1 font-cond uppercase tracking-[0.16em] text-[12px] transition-all border-l-2 \${
                tab === n.id
                  ? "text-goldsoft border-gold bg-gold/8"
                  : "text-ash border-transparent hover:text-bone hover:bg-bone/[0.03]"
              }\`}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-bone/8 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-ash hover:text-gold transition-colors font-cond uppercase tracking-[0.16em]">
            <IconArrow className="w-4 h-4 rotate-180" /> View Website
          </Link>
          <button onClick={() => logout()} className="flex items-center gap-2 text-xs text-red-300/90 hover:text-red-300 transition-colors font-cond uppercase tracking-[0.16em]">
            <IconLock className="w-4 h-4" /> Logout — {session?.username}
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden border-b border-gold/12 bg-navy/80 px-4 py-3 flex items-center justify-between gap-3">
          <Select value={tab} onChange={(e) => setTab(e.target.value as AdminTab)} className="!py-2.5">
            {NAV.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </Select>
          <button onClick={() => logout()} className="shrink-0 cut-sm px-3 py-2 border border-red-500/40 text-red-300 text-xs font-cond uppercase tracking-[0.14em]">
            Logout
          </button>
        </div>
        <main className="p-4 sm:p-8 max-w-6xl">
          {tab === "overview" && <OverviewSection goto={setTab} />}
          {tab === "applications" && <ApplicationsSection />}
          {tab === "esports" && <EsportsSection />}
          {tab === "departments" && <DepartmentsSection />}
          {tab === "content" && <ContentSection />}
          {tab === "images" && <ImagesSection />}
          {tab === "staff" && <StaffSection />}
          {tab === "discord" && <DiscordSection />}
          {tab === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

function PanelTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-4xl tracking-wide">{title}</h2>
      {sub && <p className="text-ash mt-1.5">{sub}</p>}
    </div>
  );
}

/* ================= OVERVIEW ================= */

function OverviewSection({ goto }: { goto: (t: AdminTab) => void }) {
  const { db } = useApp();
  const apps = db.applications;
  const counts = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
  const recent = [...apps].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const cards = [
    { label: "Total Applications", value: counts.total, icon: IconNote, tone: "text-gold border-gold/40" },
    { label: "Pending Review", value: counts.pending, icon: IconCalendar, tone: "text-amber-300 border-amber-400/40" },
    { label: "Approved", value: counts.approved, icon: IconCheck, tone: "text-emerald-300 border-emerald-400/40" },
    { label: "Rejected", value: counts.rejected, icon: IconX, tone: "text-red-300 border-red-400/40" },
    { label: "Staff Members", value: db.staff.length, icon: IconUsers, tone: "text-bone border-bone/30" },
  ];

  return (
    <div>
      <PanelTitle title="Dashboard" sub={\`Operational overview · \${db.settings.communityName} · \${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}\`} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="panel cut p-5">
            <c.icon className={\`w-6 h-6 \${c.tone.split(" ")[0]} mb-4\`} />
            <p className="font-display text-5xl leading-none">{c.value}</p>
            <p className="mt-2 font-cond uppercase tracking-[0.16em] text-[10px] text-ash">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="panel cut p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl tracking-wide">Recent Applications</h3>
            <button onClick={() => goto("applications")} className="font-cond uppercase tracking-[0.16em] text-[11px] text-gold hover:text-goldsoft transition-colors">
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-ash text-sm py-8 text-center">No applications yet. They will land here the moment someone applies.</p>
          ) : (
            <div className="divide-y divide-bone/8">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{a.data.fullName}</p>
                    <p className="text-xs text-ash font-mono">{a.ref} · {TYPE_LABEL[a.type]}{a.program ? \` · \${a.program}\` : ""}</p>
                  </div>
                  <AppStatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel cut p-6">
          <h3 className="font-display text-2xl tracking-wide mb-5">Recruitment Overview</h3>
          <div className="space-y-3">
            {db.games.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-bone/90">{g.title}</span>
                <StatusPill status={g.status} />
              </div>
            ))}
            <div className="h-px bg-bone/10 my-2" />
            {db.departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-bone/90">{d.name}</span>
                <StatusPill status={d.status} />
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-ash/70 leading-relaxed">
            Status changes made in Esports Management or Departments go live on the public site immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= APPLICATIONS ================= */

function ApplicationsSection() {
  const { db } = useApp();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AppStatus>("all");
  const [type, setType] = useState<"all" | AppType>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: Application[]; total: number; pages: number }>({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [acting, setActing] = useState<AppStatus | "delete" | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [discordDraft, setDiscordDraft] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.listApplications({ search, status, type, sort, page, pageSize: 8 });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, sort, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, type, sort]);

  const selected = selectedId ? db.applications.find((a) => a.id === selectedId) ?? null : null;

  useEffect(() => {
    if (selected) {
      setNoteDraft(selected.notes);
      setDiscordDraft(selected.data.discordId);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn: () => Promise<void>, kind: AppStatus | "delete", successMsg: string) => {
    if (!selected) return;
    setActing(kind);
    try {
      await fn();
      push("success", successMsg);
      if (kind === "delete") setSelectedId(null);
      await load();
    } catch (err) {
      push("error", err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActing(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div>
      <PanelTitle title="Applications" sub={\`\${result.total} record\${result.total === 1 ? "" : "s"} · search, filter, review and decide\`} />

      {/* toolbar */}
      <div className="panel cut p-4 grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-3 mb-5">
        <div className="relative">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, Discord, reference…" className="!pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as "all" | AppStatus)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value as "all" | AppType)}>
          <option value="all">All types</option>
          <option value="esports">Esports</option>
          <option value="ems">EMS</option>
          <option value="lspd">LSPD</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      {/* table */}
      <div className="panel cut overflow-x-auto">
        {loading ? (
          <div className="py-16 flex justify-center"><Spinner className="w-7 h-7 text-gold" /></div>
        ) : result.items.length === 0 ? (
          <div className="py-16 text-center text-ash">
            <IconNote className="w-10 h-10 mx-auto mb-3 text-gold/50" />
            No applications match these filters.
          </div>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left border-b border-gold/15">
                {["Reference", "Applicant", "Type", "Discord", "Status", "Submitted", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 font-cond uppercase tracking-[0.16em] text-[11px] text-gold/80 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/6">
              {result.items.map((a) => (
                <tr key={a.id} onClick={() => setSelectedId(a.id)} className="cursor-pointer hover:bg-gold/[0.05] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-gold/90">{a.ref}</td>
                  <td className="px-4 py-3.5 font-semibold">{a.data.fullName}<span className="block text-xs text-ash font-normal">{a.data.age} yrs · {a.data.country}</span></td>
                  <td className="px-4 py-3.5">{TYPE_LABEL[a.type]}{a.program ? <span className="block text-xs text-ash">{a.program}</span> : null}</td>
                  <td className="px-4 py-3.5 text-ash">{a.data.discordUsername}</td>
                  <td className="px-4 py-3.5"><AppStatusBadge status={a.status} /></td>
                  <td className="px-4 py-3.5 text-ash text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5"><IconArrow className="w-4 h-4 text-gold/60" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-ash">Page {page} of {result.pages}</p>
        <div className="flex gap-2">
          <Btn variant="dark" className="!px-4 !py-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Btn>
          <Btn variant="dark" className="!px-4 !py-2" disabled={page >= result.pages} onClick={() => setPage((p) => p + 1)}>Next →</Btn>
        </div>
      </div>

      {/* drawer */}
      {selected && (
        <div className="fixed inset-0 z-[85]">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="drawer-in absolute right-0 top-0 h-full w-full max-w-xl bg-navy border-l border-gold/20 overflow-y-auto">
            <div className="sticky top-0 bg-navy/95 backdrop-blur border-b border-gold/15 p-5 flex items-start justify-between gap-3 z-10">
              <div>
                <p className="font-mono text-xs text-gold">{selected.ref}</p>
                <h3 className="font-display text-3xl tracking-wide mt-1">{selected.data.fullName}</h3>
                <div className="flex items-center gap-2.5 mt-2">
                  <AppStatusBadge status={selected.status} />
                  <span className="text-xs text-ash">{TYPE_LABEL[selected.type]}{selected.program ? \` · \${selected.program}\` : ""}</span>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 text-ash hover:text-gold transition-colors" aria-label="Close details">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-7">
              {selected.discord.lastError && (
                <div className="cut-sm px-4 py-3 border border-red-500/50 bg-red-950/40 text-red-200 text-sm">
                  <p className="font-semibold mb-1">Last Discord attempt failed</p>
                  {selected.discord.lastError}
                </div>
              )}
              {selected.discord.assignedAt && (
                <div className="cut-sm px-4 py-3 border border-emerald-400/40 bg-emerald-950/40 text-emerald-200 text-sm">
                  Discord role <span className="font-mono">{selected.discord.roleId}</span> assigned on {new Date(selected.discord.assignedAt).toLocaleString()}.
                </div>
              )}

              {/* all answers */}
              <div>
                <h4 className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-3">Application Answers</h4>
                <div className="space-y-4">
                  {fieldsFor(selected.type).map((f) => (
                    <div key={f.key} className="border-l-2 border-gold/25 pl-4">
                      <p className="font-cond uppercase tracking-[0.14em] text-[11px] text-ash">{f.label}</p>
                      <p className="text-bone/95 mt-1 whitespace-pre-wrap leading-relaxed text-[15px]">{selected.data[f.key] || <span className="text-ash/60 italic">Not provided</span>}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* discord id edit */}
              <div>
                <h4 className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-3">Discord User ID</h4>
                <div className="flex gap-2">
                  <TextInput value={discordDraft} onChange={(e) => setDiscordDraft(e.target.value)} placeholder="16–22 digit numeric ID" />
                  <Btn
                    variant="dark"
                    disabled={discordDraft === selected.data.discordId}
                    onClick={async () => {
                      if (!validateDiscordId(discordDraft)) { push("error", "Discord User ID must be 16–22 digits."); return; }
                      try {
                        await api.updateApplicationDiscordId(selected.id, discordDraft);
                        push("success", "Discord User ID updated.");
                      } catch (err) { push("error", err instanceof Error ? err.message : "Update failed."); }
                    }}
                  >
                    Save
                  </Btn>
                </div>
                <p className="text-[11px] text-ash/70 mt-1.5">Used by the Discord automation when approving. @{selected.data.discordUsername}</p>
              </div>

              {/* notes */}
              <div>
                <h4 className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-3">Internal Notes (private)</h4>
                <TextArea rows={4} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Visible to staff only…" />
                <Btn
                  variant="dark"
                  className="mt-2 !py-2"
                  disabled={noteDraft === selected.notes}
                  onClick={async () => {
                    try {
                      await api.updateApplicationNotes(selected.id, noteDraft);
                      push("success", "Notes saved.");
                    } catch (err) { push("error", err instanceof Error ? err.message : "Save failed."); }
                  }}
                >
                  Save Notes
                </Btn>
              </div>

              {/* actions */}
              <div className="border-t border-bone/10 pt-6">
                <h4 className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-4">Decision</h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <Btn
                    busy={acting === "approved"}
                    onClick={() => act(
                      () => api.setApplicationStatus(selected.id, "approved").then((r) => { if (r.discord) push("info", r.discord); }),
                      "approved",
                      "Application approved." + (db.discord.enabled ? " Discord role assigned." : "")
                    )}
                    className="!px-2"
                  >
                    Approve
                  </Btn>
                  <Btn
                    variant="red"
                    busy={acting === "rejected"}
                    onClick={() => act(() => api.setApplicationStatus(selected.id, "rejected").then(() => undefined), "rejected", "Application rejected. No Discord roles are removed.")}
                    className="!px-2"
                  >
                    Reject
                  </Btn>
                  <Btn
                    variant="dark"
                    busy={acting === "pending"}
                    onClick={() => act(() => api.setApplicationStatus(selected.id, "pending").then(() => undefined), "pending", "Returned to pending.")}
                    className="!px-2"
                  >
                    Pending
                  </Btn>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="mt-4 inline-flex items-center gap-2 text-red-300/90 hover:text-red-300 text-sm transition-colors"
                >
                  <IconTrash className="w-4 h-4" /> Delete application permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div className="p-8">
          <h3 className="font-display text-3xl tracking-wide mb-3">DELETE APPLICATION?</h3>
          <p className="text-ash mb-7">
            <span className="font-mono text-gold">{selected?.ref}</span> from {selected?.data.fullName} will be permanently removed. This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Btn variant="dark" onClick={() => setConfirmDelete(false)}>Cancel</Btn>
            <Btn
              variant="red"
              busy={acting === "delete"}
              onClick={() => selected && act(() => api.deleteApplication(selected.id), "delete", "Application deleted.")}
            >
              <IconTrash className="w-4 h-4" /> Delete Forever
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
`,nt=`import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import { Btn, Field, IconArrow, IconLock, IconShield, TextInput } from "../../components/ui";

export default function AdminLogin() {
  const { db, session, sessionChecked, refreshSession } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (sessionChecked && session) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.login(username, password);
      await refreshSession();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={db.images.homeHero} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/90 to-ink" />
      </div>
      <div className="absolute inset-0 texture-grid" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] glow-red opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src={db.images.logo} alt="FURSAN logo" className="h-24 w-24 object-contain mx-auto mix-blend-screen" />
          <h1 className="font-display text-4xl tracking-[0.1em] mt-2">COMMAND CENTER</h1>
          <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold/80 mt-1">Restricted · Staff Only</p>
        </div>

        <div className="gold-frame cut scanline relative overflow-hidden p-8">
          {error && (
            <div className="cut-sm mb-6 px-4 py-3 border border-red-500/50 bg-red-950/40 text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <Field label="Username" required>
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
              />
            </Field>
            <Field label="Password" required>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••"
              />
            </Field>
            <Btn type="submit" busy={busy} className="w-full">
              <IconLock className="w-4 h-4" /> Authenticate
            </Btn>
          </form>

          <div className="mt-6 pt-6 border-t border-bone/10 flex items-center justify-between text-xs text-ash">
            <span className="flex items-center gap-2">
              <IconShield className="w-4 h-4 text-gold" />
              Protected route · rate-limited · bcrypt-hashed
            </span>
          </div>
        </div>

        <Link to="/" className="mt-6 inline-flex items-center gap-2 font-cond uppercase tracking-[0.2em] text-xs text-ash hover:text-gold transition-colors">
          <IconArrow className="w-4 h-4 rotate-180" /> Back to website
        </Link>
        <p className="mt-3 text-[11px] text-ash/60">
          First launch uses the credentials from <code className="text-gold/70">.env</code> (see README). Change the password in Settings after login.
        </p>
      </div>
    </div>
  );
}
`,at=`import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import { downloadProjectZip, getExportEntries } from "../../lib/zipExport";
import { ROLE_META, type Department, type Game, type RecruitmentStatus, type StaffMember } from "../../lib/db";
import {
  Btn, Field, IconCheck, IconDiscord, IconPlus, IconShield, IconTrash, IconUpload, IconX, Modal, Select,
  StatusPill, TextArea, TextInput, useToast,
} from "../../components/ui";

function PanelTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-4xl tracking-wide">{title}</h2>
      {sub && <p className="text-ash mt-1.5">{sub}</p>}
    </div>
  );
}

/* ================= ESPORTS MANAGEMENT ================= */

function GameCard({ game }: { game: Game }) {
  const { push } = useToast();
  const [title, setTitle] = useState(game.title);
  const [description, setDescription] = useState(game.description);
  const [status, setStatus] = useState<RecruitmentStatus>(game.status);
  const [busy, setBusy] = useState(false);
  const dirty = title !== game.title || description !== game.description || status !== game.status;

  return (
    <div className="panel cut p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="font-mono text-xs text-gold/70">#{game.id}</p>
        <StatusPill status={status} />
      </div>
      <div className="space-y-4">
        <Field label="Program Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description (public)">
          <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Recruitment Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as RecruitmentStatus)}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="temp">Temporarily Closed</option>
          </Select>
        </Field>
      </div>
      <Btn
        className="mt-5 w-full"
        disabled={!dirty}
        busy={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api.updateGame(game.id, { title, description, status });
            push("success", \`\${title} saved — the public Esports page is already updated.\`);
          } catch (err) {
            push("error", err instanceof Error ? err.message : "Save failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Publish Changes
      </Btn>
    </div>
  );
}

export function EsportsSection() {
  const { db } = useApp();
  return (
    <div>
      <PanelTitle title="Esports Management" sub="Edit program titles, descriptions and recruitment status — changes go live instantly." />
      <div className="grid md:grid-cols-2 gap-6">
        {db.games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  );
}

/* ================= DEPARTMENTS ================= */

function DepartmentEditor({ dep }: { dep: Department }) {
  const { push } = useToast();
  const [name, setName] = useState(dep.name);
  const [tagline, setTagline] = useState(dep.tagline);
  const [intro, setIntro] = useState(dep.intro);
  const [status, setStatus] = useState<RecruitmentStatus>(dep.status);
  const [requirements, setRequirements] = useState<string[]>([...dep.requirements]);
  const [ranks, setRanks] = useState<{ title: string; desc: string }[]>(dep.ranks.map((r) => ({ ...r })));
  const [busy, setBusy] = useState(false);

  return (
    <div className="panel cut p-6 mb-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="font-display text-3xl tracking-wide">{dep.id.toUpperCase()} DEPARTMENT</h3>
        <StatusPill status={status} />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Field label="Department Title"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Tagline"><TextInput value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
      </div>
      <Field label="Short Introduction (department card)"><TextArea rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} /></Field>

      <div className="mt-6">
        <p className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-3">Requirements ({requirements.length})</p>
        <div className="space-y-2">
          {requirements.map((r, i) => (
            <div key={i} className="flex gap-2">
              <TextInput value={r} onChange={(e) => setRequirements((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} />
              <button onClick={() => setRequirements((arr) => arr.filter((_, j) => j !== i))} className="shrink-0 px-3 border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors" aria-label="Remove requirement">
                <IconX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Btn variant="dark" className="mt-3 !py-2" onClick={() => setRequirements((arr) => [...arr, ""])}><IconPlus className="w-4 h-4" /> Add Requirement</Btn>
      </div>

      <div className="mt-6">
        <p className="font-cond uppercase tracking-[0.2em] text-xs text-gold mb-3">Rank Structure ({ranks.length})</p>
        <div className="space-y-3">
          {ranks.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-display text-xl text-gold/60 mt-2.5 w-8">{i + 1}</span>
              <div className="flex-1 grid sm:grid-cols-[1fr_1.6fr] gap-2">
                <TextInput value={r.title} placeholder="Rank title" onChange={(e) => setRanks((arr) => arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <TextInput value={r.desc} placeholder="Rank description" onChange={(e) => setRanks((arr) => arr.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))} />
              </div>
              <button onClick={() => setRanks((arr) => arr.filter((_, j) => j !== i))} className="shrink-0 px-3 py-3 border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors" aria-label="Remove rank">
                <IconX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Btn variant="dark" className="mt-3 !py-2" onClick={() => setRanks((arr) => [...arr, { title: "", desc: "" }])}><IconPlus className="w-4 h-4" /> Add Rank</Btn>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Recruitment Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as RecruitmentStatus)}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="temp">Temporarily Closed</option>
          </Select>
        </Field>
      </div>
      <Btn
        className="mt-6"
        busy={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api.updateDepartment(dep.id, { name, tagline, intro, status, requirements, ranks });
            push("success", \`\${name} saved — the public \${dep.id.toUpperCase()} page is already updated.\`);
          } catch (err) {
            push("error", err instanceof Error ? err.message : "Save failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Publish Department
      </Btn>
    </div>
  );
}

export function DepartmentsSection() {
  const { db } = useApp();
  return (
    <div>
      <PanelTitle title="Department Management" sub="EMS and LSPD — titles, requirements, ranks and recruitment status." />
      {db.departments.map((d) => <DepartmentEditor key={d.id} dep={d} />)}
    </div>
  );
}

/* ================= STAFF ================= */

const PERMISSIONS = [
  { key: "applications", label: "Review Applications" },
  { key: "esports", label: "Manage Esports" },
  { key: "departments", label: "Manage Departments" },
  { key: "content", label: "Edit Website Content" },
  { key: "staff", label: "Manage Staff" },
  { key: "discord", label: "Discord Integration" },
  { key: "settings", label: "Site Settings" },
];

const emptyStaff = { username: "", discord: "", role: "", department: "Community", permissions: ["applications"] as string[] };

export function StaffSection() {
  const { db } = useApp();
  const { push } = useToast();
  const [editing, setEditing] = useState<(Omit<StaffMember, "id"> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<StaffMember | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <PanelTitle title="Staff Management" sub={\`\${db.staff.length} staff members on record\`} />
      <div className="flex justify-end mb-4">
        <Btn onClick={() => setEditing({ ...emptyStaff })}><IconPlus className="w-4 h-4" /> Add Staff</Btn>
      </div>
      <div className="panel cut overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left border-b border-gold/15">
              {["Username", "Discord", "Role", "Department", "Permissions", ""].map((h) => (
                <th key={h} className="px-4 py-3.5 font-cond uppercase tracking-[0.16em] text-[11px] text-gold/80">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/6">
            {db.staff.map((m) => (
              <tr key={m.id} className="hover:bg-gold/[0.04] transition-colors">
                <td className="px-4 py-3.5 font-semibold">{m.username}</td>
                <td className="px-4 py-3.5 text-ash">@{m.discord || "—"}</td>
                <td className="px-4 py-3.5">{m.role}</td>
                <td className="px-4 py-3.5 text-ash">{m.department}</td>
                <td className="px-4 py-3.5 text-xs text-ash">{m.permissions.length} granted</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing({ ...m })} className="px-2.5 py-1.5 border border-gold/40 text-gold hover:bg-gold/10 transition-colors text-xs font-cond uppercase tracking-[0.12em]">Edit</button>
                    <button onClick={() => setDeleting(m)} className="px-2.5 py-1.5 border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors text-xs font-cond uppercase tracking-[0.12em]">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && (
          <div className="p-8">
            <h3 className="font-display text-3xl tracking-wide mb-6">{editing.id ? "EDIT STAFF" : "ADD STAFF"}</h3>
            <div className="space-y-4">
              <Field label="Username" required><TextInput value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} /></Field>
              <Field label="Discord Username"><TextInput value={editing.discord} onChange={(e) => setEditing({ ...editing, discord: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Role" required><TextInput value={editing.role} placeholder="e.g. Head Coach" onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></Field>
                <Field label="Department">
                  <Select value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                    {["Command", "Esports", "EMS", "LSPD", "EMS / LSPD", "Community"].map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
              </div>
              <div>
                <p className="font-cond uppercase tracking-[0.18em] text-xs text-bone/70 mb-2">Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((p) => {
                    const on = editing.permissions.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setEditing({ ...editing, permissions: on ? editing.permissions.filter((x) => x !== p.key) : [...editing.permissions, p.key] })}
                        className={\`flex items-center gap-2 px-3 py-2.5 border text-left text-sm transition-colors \${on ? "border-gold/60 bg-gold/10 text-goldsoft" : "border-bone/15 text-ash hover:border-bone/30"}\`}
                      >
                        {on ? <IconCheck className="w-4 h-4" /> : <IconX className="w-4 h-4 opacity-40" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <Btn variant="dark" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn
                busy={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api.saveStaff(editing);
                    push("success", "Staff record saved.");
                    setEditing(null);
                  } catch (err) {
                    push("error", err instanceof Error ? err.message : "Save failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Save Staff
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)}>
        <div className="p-8">
          <h3 className="font-display text-3xl tracking-wide mb-3">REMOVE STAFF?</h3>
          <p className="text-ash mb-7"><span className="text-bone font-semibold">{deleting?.username}</span> ({deleting?.role}) will lose all recorded permissions.</p>
          <div className="flex justify-end gap-3">
            <Btn variant="dark" onClick={() => setDeleting(null)}>Cancel</Btn>
            <Btn
              variant="red"
              onClick={async () => {
                if (!deleting) return;
                try {
                  await api.deleteStaff(deleting.id);
                  push("success", "Staff removed.");
                  setDeleting(null);
                } catch (err) {
                  push("error", err instanceof Error ? err.message : "Delete failed.");
                }
              }}
            >
              <IconTrash className="w-4 h-4" /> Remove
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= DISCORD INTEGRATION ================= */

export function DiscordSection() {
  const { push } = useToast();
  const [draft, setDraft] = useState<api.DiscordSafeSettings | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api.getDiscordSettings().then(setDraft).catch(() => setDraft(null));
  }, []);

  if (!draft) return <PanelTitle title="Discord Integration" sub="Loading…" />;

  return (
    <div>
      <PanelTitle title="Discord Integration" sub="Automated role assignment via Discord API v10 when applications are approved." />

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="panel cut p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Automation</p>
              <p className="text-xs text-ash">Assign the matching role automatically on approval.</p>
            </div>
            <button
              onClick={() => setDraft({ ...draft, enabled: !draft.enabled })}
              className={\`relative w-14 h-7 cut-sm border transition-colors \${draft.enabled ? "bg-gold/30 border-gold" : "bg-ink border-bone/20"}\`}
              aria-label="Toggle automation"
            >
              <span
                className={\`absolute top-[3px] transition-all duration-300 \${draft.enabled ? "left-[30px] bg-gold" : "left-[3px] bg-ash"}\`}
                style={{ width: 22, height: 22 }}
              />
            </button>
          </div>

          <Field label="Discord Server / Guild ID" hint="Enable Developer Mode → right-click your server icon → Copy Server ID.">
            <TextInput value={draft.guildId} placeholder="e.g. 819273645091827345" onChange={(e) => setDraft({ ...draft, guildId: e.target.value })} />
          </Field>

          <Field
            label="Bot Token (stored encrypted)"
            hint={draft.hasToken ? "A token is stored. Leave blank to keep it — entering a new one replaces it." : "No token stored yet. Paste it once; it is sealed with AES-256-GCM and never shown again."}
          >
            <TextInput type="password" value={token} placeholder={draft.hasToken ? "••••••••••••••••" : "Paste bot token"} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
          </Field>

          <div>
            <p className="font-cond uppercase tracking-[0.18em] text-xs text-bone/70 mb-3">Role IDs (assigned on approval)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {ROLE_META.map((r) => (
                <Field key={r.key} label={r.label}>
                  <TextInput value={draft.roles[r.key] ?? ""} placeholder="Role ID" onChange={(e) => setDraft({ ...draft, roles: { ...draft.roles, [r.key]: e.target.value } })} />
                </Field>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Btn
              busy={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.saveDiscordSettings({ enabled: draft.enabled, guildId: draft.guildId, token: token || undefined, roles: draft.roles });
                  setToken("");
                  push("success", "Discord configuration saved. Token sealed.");
                  const fresh = await api.getDiscordSettings();
                  setDraft(fresh);
                } catch (err) {
                  push("error", err instanceof Error ? err.message : "Save failed.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save Configuration
            </Btn>
            <Btn
              variant="outline"
              busy={testing}
              onClick={async () => {
                setTesting(true);
                try {
                  const r = await api.testDiscordConnection();
                  push(r.ok ? "success" : "error", r.message);
                  const fresh = await api.getDiscordSettings();
                  setDraft(fresh);
                } catch (err) {
                  push("error", err instanceof Error ? err.message : "Test failed.");
                } finally {
                  setTesting(false);
                }
              }}
            >
              <IconDiscord className="w-4 h-4" /> Test Connection
            </Btn>
          </div>

          {draft.lastTest && (
            <div className={\`cut-sm px-4 py-3 border text-sm \${draft.lastTest.ok ? "border-emerald-400/40 bg-emerald-950/40 text-emerald-200" : "border-red-500/50 bg-red-950/40 text-red-200"}\`}>
              Last test ({new Date(draft.lastTest.at).toLocaleString()}): {draft.lastTest.message}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="panel cut p-6">
            <h3 className="font-display text-2xl tracking-wide mb-4 flex items-center gap-2"><IconShield className="w-5 h-5 text-gold" /> How Approval Works</h3>
            <ol className="space-y-3 text-sm text-ash list-decimal list-inside leading-relaxed">
              <li>You press <span className="text-bone">Approve</span> on an application.</li>
              <li>The API reads the applicant's <span className="text-bone">Discord User ID</span>.</li>
              <li>The matching configured role is selected for the program/department.</li>
              <li><span className="text-bone">Discord API v10</span> assigns the role to the member.</li>
              <li>Only after Discord confirms success is the application marked <span className="text-emerald-300">Approved</span>.</li>
            </ol>
            <p className="mt-4 text-xs text-amber-300/90 border-l-2 border-amber-400/50 pl-3">
              If Discord fails, the application stays unapproved and the error is shown. Rejection never removes roles automatically.
            </p>
          </div>

          <div className="panel cut p-6">
            <h3 className="font-display text-2xl tracking-wide mb-4">Setup Instructions</h3>
            <ol className="space-y-2.5 text-sm text-ash list-decimal list-inside leading-relaxed">
              <li>Go to the <span className="text-bone">Discord Developer Portal</span> and create an Application.</li>
              <li>Under <span className="text-bone">Bot</span>, reset the token and copy it (shown once).</li>
              <li>Enable the <span className="text-bone">Manage Roles</span> permission (Server Members Intent not required).</li>
              <li>Invite the bot with scopes <span className="font-mono text-xs text-gold">bot</span> + <span className="font-mono text-xs text-gold">applications.commands</span>.</li>
              <li>In Server Settings → Roles, drag the <span className="text-bone">bot's role above</span> every role it should assign.</li>
              <li>Paste Guild ID, role IDs and the token here, save, then run <span className="text-bone">Test Connection</span>.</li>
            </ol>
            <p className="mt-4 text-xs text-ash/80 border-l-2 border-gold/40 pl-3">
              Browser security may block direct Discord API calls from this static demo. Set <span className="font-mono text-gold">VITE_DISCORD_API_BASE</span> to a tiny server-side relay (see README) for production use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */

export function SettingsSection() {
  const { db } = useApp();
  const { push } = useToast();
  const s = db.settings;
  const [draft, setDraft] = useState(() => ({ ...s, socials: { ...s.socials } }));
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const fileCount = useMemo(() => getExportEntries().length + 1, []);

  return (
    <div>
      <PanelTitle title="Settings" sub="Global site configuration — reflected everywhere immediately." />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel cut p-6 space-y-4">
          <Field label="Community Name"><TextInput value={draft.communityName} onChange={(e) => setDraft({ ...draft, communityName: e.target.value })} /></Field>
          <Field label="Discord Invitation Link"><TextInput value={draft.discordInvite} onChange={(e) => setDraft({ ...draft, discordInvite: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Member Count"><TextInput type="number" value={String(draft.memberCount)} onChange={(e) => setDraft({ ...draft, memberCount: Number(e.target.value) })} /></Field>
            <div>
              <p className="font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">Server Online Status</p>
              <button
                onClick={() => setDraft({ ...draft, serverOnline: !draft.serverOnline })}
                className={\`cut-sm w-full px-4 py-3 border font-cond uppercase tracking-[0.16em] text-xs transition-colors \${draft.serverOnline ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-red-500/50 bg-red-500/10 text-red-300"}\`}
              >
                {draft.serverOnline ? "● Online" : "○ Offline / Maintenance"}
              </button>
            </div>
          </div>
          <Field label="Footer Legal Text"><TextArea rows={3} value={draft.footerText} onChange={(e) => setDraft({ ...draft, footerText: e.target.value })} /></Field>
          <Btn
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.updateSettings(draft);
                push("success", "Settings saved.");
              } catch (err) {
                push("error", err instanceof Error ? err.message : "Save failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Save Settings
          </Btn>
        </div>

        <div className="space-y-6">
          <div className="panel cut p-6">
            <h3 className="font-display text-2xl tracking-wide mb-4">Social Links</h3>
            <div className="space-y-3">
              {(Object.keys(draft.socials) as (keyof typeof draft.socials)[]).map((k) => (
                <Field key={k} label={k === "x" ? "X (Twitter)" : k.charAt(0).toUpperCase() + k.slice(1)}>
                  <TextInput value={draft.socials[k]} onChange={(e) => setDraft({ ...draft, socials: { ...draft.socials, [k]: e.target.value } })} placeholder={\`https://\${k}.com/fursan\`} />
                </Field>
              ))}
            </div>
          </div>

          <div className="panel cut p-6">
            <h3 className="font-display text-2xl tracking-wide mb-4">Change Admin Password</h3>
            <div className="space-y-3">
              <Field label="Current Password"><TextInput type="password" value={pw.current} autoComplete="current-password" onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
              <Field label="New Password (min 8 chars)"><TextInput type="password" value={pw.next} autoComplete="new-password" onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
              <Field label="Confirm New Password"><TextInput type="password" value={pw.confirm} autoComplete="new-password" onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            </div>
            <Btn
              variant="outline"
              className="mt-4"
              busy={pwBusy}
              onClick={async () => {
                if (pw.next !== pw.confirm) { push("error", "New passwords do not match."); return; }
                setPwBusy(true);
                try {
                  await api.changePassword(pw.current, pw.next);
                  push("success", "Password changed. Use it on next login.");
                  setPw({ current: "", next: "", confirm: "" });
                } catch (err) {
                  push("error", err instanceof Error ? err.message : "Change failed.");
                } finally {
                  setPwBusy(false);
                }
              }}
            >
              Update Password
            </Btn>
          </div>

          <div className="gold-frame cut p-6">
            <h3 className="font-display text-2xl tracking-wide mb-2">Project Source Export</h3>
            <p className="text-ash text-sm leading-relaxed mb-4">
              Download the complete codebase — {fileCount} files including every page, the API layer,
              database schema (<span className="font-mono text-gold/80">db/schema.sql</span>), README and
              environment template — packaged as <span className="font-mono text-gold/80">fursan-community-source.zip</span>.
              Also available publicly at <span className="font-mono text-gold/80">#/download</span>.
            </p>
            <Btn
              variant="outline"
              busy={zipBusy}
              onClick={async () => {
                setZipBusy(true);
                try {
                  const res = await downloadProjectZip();
                  push("success", \`\${res.name} saved — \${res.files} files.\`);
                } catch (err) {
                  push("error", err instanceof Error ? err.message : "Export failed.");
                } finally {
                  setZipBusy(false);
                }
              }}
            >
              <IconUpload className="w-4 h-4" /> Download Full Source (ZIP)
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
`,st=`import { useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import { DEFAULT_CONTENT, DEFAULT_IMAGES, IMAGE_META, type Content } from "../../lib/db";
import { Btn, IconTrash, IconUpload, IconX, IconPlus, Spinner, TextInput, TextArea, useToast } from "../../components/ui";

/* ---------------- schema ---------------- */

type ItemField = { key: string; label: string; kind: "text" | "textarea" };
type EditorField =
  | { key: string; label: string; kind: "text" | "textarea" | "lines" }
  | { key: string; label: string; kind: "list"; fields: ItemField[] };

const SCHEMA: { id: keyof Content; label: string; fields: EditorField[] }[] = [
  {
    id: "home",
    label: "Home Page",
    fields: [
      { key: "eyebrow", label: "Hero Eyebrow (EST. line)", kind: "text" },
      { key: "title", label: "Hero Main Title", kind: "text" },
      { key: "tagline", label: "Hero Tagline", kind: "text" },
      { key: "description", label: "Hero Description", kind: "textarea" },
      { key: "ctaExplore", label: "Explore Button Text", kind: "text" },
      { key: "ctaDiscord", label: "Discord Button Text", kind: "text" },
      { key: "serverLabel", label: "Server Online Indicator Text", kind: "text" },
      { key: "ticker", label: "Ticker Items (one per line)", kind: "lines" },
      { key: "stats", label: "Statistics", kind: "list", fields: [{ key: "value", label: "Value", kind: "text" }, { key: "label", label: "Label", kind: "text" }] },
      { key: "featuresTitle", label: "Features Section Title", kind: "text" },
      { key: "featuresSub", label: "Features Section Subtitle", kind: "textarea" },
      { key: "features", label: "Feature Cards (6)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "previewsTitle", label: "Previews Title", kind: "text" },
      { key: "previewsSub", label: "Previews Subtitle", kind: "textarea" },
      { key: "previews", label: "Program Previews (6)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "tag", label: "Tag", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "foundersTitle", label: "Founders Title", kind: "text" },
      { key: "foundersSub", label: "Founders Subtitle", kind: "textarea" },
      { key: "founders", label: "Founders (5)", kind: "list", fields: [{ key: "name", label: "Name", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "ctaTitle", label: "CTA Title", kind: "text" },
      { key: "ctaSub", label: "CTA Subtitle", kind: "textarea" },
      { key: "ctaButton", label: "CTA Button", kind: "text" },
    ],
  },
  {
    id: "community",
    label: "Community Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "storyTitle", label: "Story Title", kind: "text" },
      { key: "storyBody", label: "Community Story (blank line = new paragraph)", kind: "textarea" },
      { key: "missionTitle", label: "Mission Title", kind: "text" },
      { key: "missionBody", label: "Mission Text", kind: "textarea" },
      { key: "valuesTitle", label: "Values Title", kind: "text" },
      { key: "valuesSub", label: "Values Subtitle", kind: "text" },
      { key: "values", label: "Values (4)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "quote", label: "Featured Quote", kind: "textarea" },
      { key: "quoteAuthor", label: "Quote Author", kind: "text" },
      { key: "featuresTitle", label: "Member Life Title", kind: "text" },
      { key: "features", label: "Member Life Cards (4)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "ctaTitle", label: "CTA Title", kind: "text" },
      { key: "ctaDescription", label: "CTA Description", kind: "textarea" },
      { key: "ctaButton", label: "CTA Button", kind: "text" },
    ],
  },
  {
    id: "esports",
    label: "Esports Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Programs Section Title", kind: "text" },
      { key: "introBody", label: "Programs Section Body", kind: "textarea" },
      { key: "journeyTitle", label: "Journey Title", kind: "text" },
      { key: "journeySub", label: "Journey Subtitle", kind: "text" },
      { key: "journey", label: "Application Journey (4 steps)", kind: "list", fields: [{ key: "title", label: "Step", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "applyNote", label: "Application Note", kind: "textarea" },
    ],
  },
  {
    id: "ems",
    label: "EMS Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Intro Title", kind: "text" },
      { key: "introBody", label: "Department Introduction (blank line = new paragraph)", kind: "textarea" },
      { key: "principlesTitle", label: "Principles Title", kind: "text" },
      { key: "principles", label: "Principles (3)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "requirementsTitle", label: "Requirements Title", kind: "text" },
      { key: "ranksTitle", label: "Ranks Title", kind: "text" },
      { key: "applyCta", label: "Apply Button Text", kind: "text" },
    ],
  },
  {
    id: "lspd",
    label: "LSPD Page",
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
      { key: "heroTitle", label: "Hero Title", kind: "text" },
      { key: "heroDescription", label: "Hero Description", kind: "textarea" },
      { key: "introTitle", label: "Intro Title", kind: "text" },
      { key: "introBody", label: "Department Introduction (blank line = new paragraph)", kind: "textarea" },
      { key: "principlesTitle", label: "Principles Title", kind: "text" },
      { key: "principles", label: "Principles (3)", kind: "list", fields: [{ key: "title", label: "Title", kind: "text" }, { key: "description", label: "Description", kind: "textarea" }] },
      { key: "requirementsTitle", label: "Requirements Title", kind: "text" },
      { key: "ranksTitle", label: "Ranks Title", kind: "text" },
      { key: "applyCta", label: "Apply Button Text", kind: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "description", label: "Footer Description", kind: "textarea" },
      { key: "builtLine", label: "“Built For” Line", kind: "text" },
      { key: "copyright", label: "Copyright Text", kind: "text" },
    ],
  },
];

/* ---------------- content editor ---------------- */

function SectionEditor<K extends keyof Content>({ sectionKey, fields }: { sectionKey: K; fields: EditorField[] }) {
  const { db } = useApp();
  const { push } = useToast();
  const [draft, setDraft] = useState<Content[K]>(() => structuredClone(db.content[sectionKey]));
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(db.content[sectionKey]), [draft, db.content, sectionKey]);

  const setField = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }) as Content[K]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-ash">Every field below drives the live public page. Nothing changes until you publish.</p>
        <div className="flex gap-2">
          <Btn
            variant="dark"
            className="!py-2.5"
            onClick={() => { setDraft(structuredClone(DEFAULT_CONTENT[sectionKey])); push("info", "Draft reset to defaults — press Publish to apply."); }}
          >
            Reset Draft
          </Btn>
          <Btn
            busy={busy}
            disabled={!dirty}
            className="!py-2.5"
            onClick={async () => {
              setBusy(true);
              try {
                await api.updateContentSection(sectionKey, draft);
                push("success", "Content published — the website is already updated.");
              } catch (err) {
                push("error", err instanceof Error ? err.message : "Publish failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Publish Section
          </Btn>
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((f) => {
          const value = (draft as Record<string, unknown>)[f.key];
          if (f.kind === "text") {
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextInput value={String(value ?? "")} onChange={(e) => setField(f.key, e.target.value)} />
              </label>
            );
          }
          if (f.kind === "textarea") {
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextArea rows={4} value={String(value ?? "")} onChange={(e) => setField(f.key, e.target.value)} />
              </label>
            );
          }
          if (f.kind === "lines") {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            return (
              <label key={f.key} className="block">
                <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">{f.label}</span>
                <TextArea rows={4} value={arr.join("\\n")} onChange={(e) => setField(f.key, e.target.value.split("\\n"))} />
              </label>
            );
          }
          // list
          const listField = f as Extract<EditorField, { kind: "list" }>;
          const arr = Array.isArray(value) ? (value as Record<string, string>[]) : [];
          return (
            <div key={f.key}>
              <p className="font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-2">{f.label}</p>
              <div className="space-y-3">
                {arr.map((item, i) => (
                  <div key={i} className="panel cut-sm p-4 relative">
                    <span className="absolute -top-2.5 left-3 bg-navy px-2 font-display text-sm text-gold/80">{i + 1}</span>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {listField.fields.map((sub: ItemField) => (
                        <label key={sub.key} className={\`block \${sub.kind === "textarea" ? "sm:col-span-2" : ""}\`}>
                          <span className="block text-[11px] text-ash mb-1 font-cond uppercase tracking-[0.14em]">{sub.label}</span>
                          {sub.kind === "textarea" ? (
                            <TextArea rows={2} value={item[sub.key] ?? ""} onChange={(e) => setField(f.key, arr.map((x, j) => (j === i ? { ...x, [sub.key]: e.target.value } : x)))} />
                          ) : (
                            <TextInput value={item[sub.key] ?? ""} onChange={(e) => setField(f.key, arr.map((x, j) => (j === i ? { ...x, [sub.key]: e.target.value } : x)))} />
                          )}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => setField(f.key, arr.filter((_, j) => j !== i))}
                      className="mt-3 inline-flex items-center gap-1.5 text-red-300/90 hover:text-red-300 text-xs font-cond uppercase tracking-[0.14em] transition-colors"
                    >
                      <IconX className="w-3.5 h-3.5" /> Remove item
                    </button>
                  </div>
                ))}
              </div>
              <Btn
                variant="dark"
                className="mt-3 !py-2"
                onClick={() => setField(f.key, [...arr, Object.fromEntries(listField.fields.map((x: ItemField) => [x.key, ""]))])}
              >
                <IconPlus className="w-4 h-4" /> Add Item
              </Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContentSection() {
  const [active, setActive] = useState<keyof Content>("home");
  const schema = SCHEMA.find((s) => s.id === active)!;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-4xl tracking-wide">Website Content Manager</h2>
        <p className="text-ash mt-1.5">Edit every visible string on the public website. Publish to push changes live instantly.</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {SCHEMA.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={\`cut-sm px-4 py-2.5 font-cond uppercase tracking-[0.16em] text-[12px] border transition-all \${
              active === s.id ? "border-gold bg-gold/15 text-goldsoft" : "border-bone/15 text-ash hover:border-gold/40 hover:text-bone"
            }\`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <SectionEditor key={active} sectionKey={active} fields={schema.fields} />
    </div>
  );
}

/* ---------------- image manager ---------------- */

export function ImagesSection() {
  const { db } = useApp();
  const { push } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-4xl tracking-wide">Image Manager</h2>
        <p className="text-ash mt-1.5">
          PNG, JPG, WebP or GIF · max 1.5 MB each. Transparent PNGs render natively — the logo is never placed in a box.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {IMAGE_META.map((meta) => {
          const src = db.images[meta.key];
          const isDefault = src === DEFAULT_IMAGES[meta.key];
          return (
            <div key={meta.key} className="panel cut p-4">
              <div className="relative h-36 bg-ink border border-bone/10 flex items-center justify-center overflow-hidden mb-4">
                {busyKey === meta.key ? (
                  <Spinner className="w-6 h-6 text-gold" />
                ) : (
                  <img src={src} alt={meta.label} className="max-h-full max-w-full object-contain mix-blend-screen" />
                )}
              </div>
              <p className="font-cond uppercase tracking-[0.14em] text-[11px] text-bone/80 mb-3">{meta.label}</p>
              <div className="flex gap-2">
                <input
                  ref={(el) => { fileRefs.current[meta.key] = el; }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setBusyKey(meta.key);
                    try {
                      await api.setImage(meta.key, file);
                      push("success", \`\${meta.label} updated.\`);
                    } catch (err) {
                      push("error", err instanceof Error ? err.message : "Upload failed.");
                    } finally {
                      setBusyKey(null);
                    }
                  }}
                />
                <Btn variant="outline" className="!px-3.5 !py-2 flex-1" onClick={() => fileRefs.current[meta.key]?.click()}>
                  <IconUpload className="w-4 h-4" /> Upload
                </Btn>
                {!isDefault && (
                  <Btn
                    variant="dark"
                    className="!px-3.5 !py-2"
                    onClick={async () => {
                      try {
                        await api.resetImage(meta.key);
                        push("success", \`\${meta.label} restored to default.\`);
                      } catch (err) {
                        push("error", err instanceof Error ? err.message : "Reset failed.");
                      }
                    }}
                  >
                    <IconTrash className="w-4 h-4" /> Reset
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`,rt=`/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_DEFAULT_USERNAME?: string;
  readonly VITE_ADMIN_DEFAULT_PASSWORD?: string;
  readonly VITE_DISCORD_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`,it=`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
`,ot=`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
`;function ke(oe){throw new Error('Could not dynamically require "'+oe+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Ne={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/var Te;function lt(){return Te||(Te=1,(function(oe,fe){(function(v){oe.exports=v()})(function(){return(function v(F,w,l){function o(g,y){if(!w[g]){if(!F[g]){var f=typeof ke=="function"&&ke;if(!y&&f)return f(g,!0);if(a)return a(g,!0);var b=new Error("Cannot find module '"+g+"'");throw b.code="MODULE_NOT_FOUND",b}var s=w[g]={exports:{}};F[g][0].call(s.exports,function(u){var n=F[g][1][u];return o(n||u)},s,s.exports,v,F,w,l)}return w[g].exports}for(var a=typeof ke=="function"&&ke,d=0;d<l.length;d++)o(l[d]);return o})({1:[function(v,F,w){var l=v("./utils"),o=v("./support"),a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";w.encode=function(d){for(var g,y,f,b,s,u,n,c=[],r=0,m=d.length,x=m,_=l.getTypeOf(d)!=="string";r<d.length;)x=m-r,f=_?(g=d[r++],y=r<m?d[r++]:0,r<m?d[r++]:0):(g=d.charCodeAt(r++),y=r<m?d.charCodeAt(r++):0,r<m?d.charCodeAt(r++):0),b=g>>2,s=(3&g)<<4|y>>4,u=1<x?(15&y)<<2|f>>6:64,n=2<x?63&f:64,c.push(a.charAt(b)+a.charAt(s)+a.charAt(u)+a.charAt(n));return c.join("")},w.decode=function(d){var g,y,f,b,s,u,n=0,c=0,r="data:";if(d.substr(0,r.length)===r)throw new Error("Invalid base64 input, it looks like a data url.");var m,x=3*(d=d.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(d.charAt(d.length-1)===a.charAt(64)&&x--,d.charAt(d.length-2)===a.charAt(64)&&x--,x%1!=0)throw new Error("Invalid base64 input, bad content length.");for(m=o.uint8array?new Uint8Array(0|x):new Array(0|x);n<d.length;)g=a.indexOf(d.charAt(n++))<<2|(b=a.indexOf(d.charAt(n++)))>>4,y=(15&b)<<4|(s=a.indexOf(d.charAt(n++)))>>2,f=(3&s)<<6|(u=a.indexOf(d.charAt(n++))),m[c++]=g,s!==64&&(m[c++]=y),u!==64&&(m[c++]=f);return m}},{"./support":30,"./utils":32}],2:[function(v,F,w){var l=v("./external"),o=v("./stream/DataWorker"),a=v("./stream/Crc32Probe"),d=v("./stream/DataLengthProbe");function g(y,f,b,s,u){this.compressedSize=y,this.uncompressedSize=f,this.crc32=b,this.compression=s,this.compressedContent=u}g.prototype={getContentWorker:function(){var y=new o(l.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new d("data_length")),f=this;return y.on("end",function(){if(this.streamInfo.data_length!==f.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),y},getCompressedWorker:function(){return new o(l.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},g.createWorkerFrom=function(y,f,b){return y.pipe(new a).pipe(new d("uncompressedSize")).pipe(f.compressWorker(b)).pipe(new d("compressedSize")).withStreamInfo("compression",f)},F.exports=g},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(v,F,w){var l=v("./stream/GenericWorker");w.STORE={magic:"\0\0",compressWorker:function(){return new l("STORE compression")},uncompressWorker:function(){return new l("STORE decompression")}},w.DEFLATE=v("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(v,F,w){var l=v("./utils"),o=(function(){for(var a,d=[],g=0;g<256;g++){a=g;for(var y=0;y<8;y++)a=1&a?3988292384^a>>>1:a>>>1;d[g]=a}return d})();F.exports=function(a,d){return a!==void 0&&a.length?l.getTypeOf(a)!=="string"?(function(g,y,f,b){var s=o,u=b+f;g^=-1;for(var n=b;n<u;n++)g=g>>>8^s[255&(g^y[n])];return-1^g})(0|d,a,a.length,0):(function(g,y,f,b){var s=o,u=b+f;g^=-1;for(var n=b;n<u;n++)g=g>>>8^s[255&(g^y.charCodeAt(n))];return-1^g})(0|d,a,a.length,0):0}},{"./utils":32}],5:[function(v,F,w){w.base64=!1,w.binary=!1,w.dir=!1,w.createFolders=!0,w.date=null,w.compression=null,w.compressionOptions=null,w.comment=null,w.unixPermissions=null,w.dosPermissions=null},{}],6:[function(v,F,w){var l=null;l=typeof Promise<"u"?Promise:v("lie"),F.exports={Promise:l}},{lie:37}],7:[function(v,F,w){var l=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",o=v("pako"),a=v("./utils"),d=v("./stream/GenericWorker"),g=l?"uint8array":"array";function y(f,b){d.call(this,"FlateWorker/"+f),this._pako=null,this._pakoAction=f,this._pakoOptions=b,this.meta={}}w.magic="\b\0",a.inherits(y,d),y.prototype.processChunk=function(f){this.meta=f.meta,this._pako===null&&this._createPako(),this._pako.push(a.transformTo(g,f.data),!1)},y.prototype.flush=function(){d.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},y.prototype.cleanUp=function(){d.prototype.cleanUp.call(this),this._pako=null},y.prototype._createPako=function(){this._pako=new o[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var f=this;this._pako.onData=function(b){f.push({data:b,meta:f.meta})}},w.compressWorker=function(f){return new y("Deflate",f)},w.uncompressWorker=function(){return new y("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(v,F,w){function l(s,u){var n,c="";for(n=0;n<u;n++)c+=String.fromCharCode(255&s),s>>>=8;return c}function o(s,u,n,c,r,m){var x,_,N=s.file,M=s.compression,C=m!==g.utf8encode,U=a.transformTo("string",m(N.name)),I=a.transformTo("string",g.utf8encode(N.name)),H=N.comment,V=a.transformTo("string",m(H)),h=a.transformTo("string",g.utf8encode(H)),D=I.length!==N.name.length,t=h.length!==H.length,L="",X="",B="",J=N.dir,z=N.date,K={crc32:0,compressedSize:0,uncompressedSize:0};u&&!n||(K.crc32=s.crc32,K.compressedSize=s.compressedSize,K.uncompressedSize=s.uncompressedSize);var T=0;u&&(T|=8),C||!D&&!t||(T|=2048);var A=0,$=0;J&&(A|=16),r==="UNIX"?($=798,A|=(function(G,ae){var le=G;return G||(le=ae?16893:33204),(65535&le)<<16})(N.unixPermissions,J)):($=20,A|=(function(G){return 63&(G||0)})(N.dosPermissions)),x=z.getUTCHours(),x<<=6,x|=z.getUTCMinutes(),x<<=5,x|=z.getUTCSeconds()/2,_=z.getUTCFullYear()-1980,_<<=4,_|=z.getUTCMonth()+1,_<<=5,_|=z.getUTCDate(),D&&(X=l(1,1)+l(y(U),4)+I,L+="up"+l(X.length,2)+X),t&&(B=l(1,1)+l(y(V),4)+h,L+="uc"+l(B.length,2)+B);var W="";return W+=`
\0`,W+=l(T,2),W+=M.magic,W+=l(x,2),W+=l(_,2),W+=l(K.crc32,4),W+=l(K.compressedSize,4),W+=l(K.uncompressedSize,4),W+=l(U.length,2),W+=l(L.length,2),{fileRecord:f.LOCAL_FILE_HEADER+W+U+L,dirRecord:f.CENTRAL_FILE_HEADER+l($,2)+W+l(V.length,2)+"\0\0\0\0"+l(A,4)+l(c,4)+U+L+V}}var a=v("../utils"),d=v("../stream/GenericWorker"),g=v("../utf8"),y=v("../crc32"),f=v("../signature");function b(s,u,n,c){d.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=u,this.zipPlatform=n,this.encodeFileName=c,this.streamFiles=s,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}a.inherits(b,d),b.prototype.push=function(s){var u=s.meta.percent||0,n=this.entriesCount,c=this._sources.length;this.accumulate?this.contentBuffer.push(s):(this.bytesWritten+=s.data.length,d.prototype.push.call(this,{data:s.data,meta:{currentFile:this.currentFile,percent:n?(u+100*(n-c-1))/n:100}}))},b.prototype.openedSource=function(s){this.currentSourceOffset=this.bytesWritten,this.currentFile=s.file.name;var u=this.streamFiles&&!s.file.dir;if(u){var n=o(s,u,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:n.fileRecord,meta:{percent:0}})}else this.accumulate=!0},b.prototype.closedSource=function(s){this.accumulate=!1;var u=this.streamFiles&&!s.file.dir,n=o(s,u,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(n.dirRecord),u)this.push({data:(function(c){return f.DATA_DESCRIPTOR+l(c.crc32,4)+l(c.compressedSize,4)+l(c.uncompressedSize,4)})(s),meta:{percent:100}});else for(this.push({data:n.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},b.prototype.flush=function(){for(var s=this.bytesWritten,u=0;u<this.dirRecords.length;u++)this.push({data:this.dirRecords[u],meta:{percent:100}});var n=this.bytesWritten-s,c=(function(r,m,x,_,N){var M=a.transformTo("string",N(_));return f.CENTRAL_DIRECTORY_END+"\0\0\0\0"+l(r,2)+l(r,2)+l(m,4)+l(x,4)+l(M.length,2)+M})(this.dirRecords.length,n,s,this.zipComment,this.encodeFileName);this.push({data:c,meta:{percent:100}})},b.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},b.prototype.registerPrevious=function(s){this._sources.push(s);var u=this;return s.on("data",function(n){u.processChunk(n)}),s.on("end",function(){u.closedSource(u.previous.streamInfo),u._sources.length?u.prepareNextSource():u.end()}),s.on("error",function(n){u.error(n)}),this},b.prototype.resume=function(){return!!d.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},b.prototype.error=function(s){var u=this._sources;if(!d.prototype.error.call(this,s))return!1;for(var n=0;n<u.length;n++)try{u[n].error(s)}catch{}return!0},b.prototype.lock=function(){d.prototype.lock.call(this);for(var s=this._sources,u=0;u<s.length;u++)s[u].lock()},F.exports=b},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(v,F,w){var l=v("../compressions"),o=v("./ZipFileWorker");w.generateWorker=function(a,d,g){var y=new o(d.streamFiles,g,d.platform,d.encodeFileName),f=0;try{a.forEach(function(b,s){f++;var u=(function(m,x){var _=m||x,N=l[_];if(!N)throw new Error(_+" is not a valid compression method !");return N})(s.options.compression,d.compression),n=s.options.compressionOptions||d.compressionOptions||{},c=s.dir,r=s.date;s._compressWorker(u,n).withStreamInfo("file",{name:b,dir:c,date:r,comment:s.comment||"",unixPermissions:s.unixPermissions,dosPermissions:s.dosPermissions}).pipe(y)}),y.entriesCount=f}catch(b){y.error(b)}return y}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(v,F,w){function l(){if(!(this instanceof l))return new l;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var o=new l;for(var a in this)typeof this[a]!="function"&&(o[a]=this[a]);return o}}(l.prototype=v("./object")).loadAsync=v("./load"),l.support=v("./support"),l.defaults=v("./defaults"),l.version="3.10.1",l.loadAsync=function(o,a){return new l().loadAsync(o,a)},l.external=v("./external"),F.exports=l},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(v,F,w){var l=v("./utils"),o=v("./external"),a=v("./utf8"),d=v("./zipEntries"),g=v("./stream/Crc32Probe"),y=v("./nodejsUtils");function f(b){return new o.Promise(function(s,u){var n=b.decompressed.getContentWorker().pipe(new g);n.on("error",function(c){u(c)}).on("end",function(){n.streamInfo.crc32!==b.decompressed.crc32?u(new Error("Corrupted zip : CRC32 mismatch")):s()}).resume()})}F.exports=function(b,s){var u=this;return s=l.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),y.isNode&&y.isStream(b)?o.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):l.prepareContent("the loaded zip file",b,!0,s.optimizedBinaryString,s.base64).then(function(n){var c=new d(s);return c.load(n),c}).then(function(n){var c=[o.Promise.resolve(n)],r=n.files;if(s.checkCRC32)for(var m=0;m<r.length;m++)c.push(f(r[m]));return o.Promise.all(c)}).then(function(n){for(var c=n.shift(),r=c.files,m=0;m<r.length;m++){var x=r[m],_=x.fileNameStr,N=l.resolve(x.fileNameStr);u.file(N,x.decompressed,{binary:!0,optimizedBinaryString:!0,date:x.date,dir:x.dir,comment:x.fileCommentStr.length?x.fileCommentStr:null,unixPermissions:x.unixPermissions,dosPermissions:x.dosPermissions,createFolders:s.createFolders}),x.dir||(u.file(N).unsafeOriginalName=_)}return c.zipComment.length&&(u.comment=c.zipComment),u})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(v,F,w){var l=v("../utils"),o=v("../stream/GenericWorker");function a(d,g){o.call(this,"Nodejs stream input adapter for "+d),this._upstreamEnded=!1,this._bindStream(g)}l.inherits(a,o),a.prototype._bindStream=function(d){var g=this;(this._stream=d).pause(),d.on("data",function(y){g.push({data:y,meta:{percent:0}})}).on("error",function(y){g.isPaused?this.generatedError=y:g.error(y)}).on("end",function(){g.isPaused?g._upstreamEnded=!0:g.end()})},a.prototype.pause=function(){return!!o.prototype.pause.call(this)&&(this._stream.pause(),!0)},a.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},F.exports=a},{"../stream/GenericWorker":28,"../utils":32}],13:[function(v,F,w){var l=v("readable-stream").Readable;function o(a,d,g){l.call(this,d),this._helper=a;var y=this;a.on("data",function(f,b){y.push(f)||y._helper.pause(),g&&g(b)}).on("error",function(f){y.emit("error",f)}).on("end",function(){y.push(null)})}v("../utils").inherits(o,l),o.prototype._read=function(){this._helper.resume()},F.exports=o},{"../utils":32,"readable-stream":16}],14:[function(v,F,w){F.exports={isNode:typeof Buffer<"u",newBufferFrom:function(l,o){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(l,o);if(typeof l=="number")throw new Error('The "data" argument must not be a number');return new Buffer(l,o)},allocBuffer:function(l){if(Buffer.alloc)return Buffer.alloc(l);var o=new Buffer(l);return o.fill(0),o},isBuffer:function(l){return Buffer.isBuffer(l)},isStream:function(l){return l&&typeof l.on=="function"&&typeof l.pause=="function"&&typeof l.resume=="function"}}},{}],15:[function(v,F,w){function l(N,M,C){var U,I=a.getTypeOf(M),H=a.extend(C||{},y);H.date=H.date||new Date,H.compression!==null&&(H.compression=H.compression.toUpperCase()),typeof H.unixPermissions=="string"&&(H.unixPermissions=parseInt(H.unixPermissions,8)),H.unixPermissions&&16384&H.unixPermissions&&(H.dir=!0),H.dosPermissions&&16&H.dosPermissions&&(H.dir=!0),H.dir&&(N=r(N)),H.createFolders&&(U=c(N))&&m.call(this,U,!0);var V=I==="string"&&H.binary===!1&&H.base64===!1;C&&C.binary!==void 0||(H.binary=!V),(M instanceof f&&M.uncompressedSize===0||H.dir||!M||M.length===0)&&(H.base64=!1,H.binary=!0,M="",H.compression="STORE",I="string");var h=null;h=M instanceof f||M instanceof d?M:u.isNode&&u.isStream(M)?new n(N,M):a.prepareContent(N,M,H.binary,H.optimizedBinaryString,H.base64);var D=new b(N,h,H);this.files[N]=D}var o=v("./utf8"),a=v("./utils"),d=v("./stream/GenericWorker"),g=v("./stream/StreamHelper"),y=v("./defaults"),f=v("./compressedObject"),b=v("./zipObject"),s=v("./generate"),u=v("./nodejsUtils"),n=v("./nodejs/NodejsStreamInputAdapter"),c=function(N){N.slice(-1)==="/"&&(N=N.substring(0,N.length-1));var M=N.lastIndexOf("/");return 0<M?N.substring(0,M):""},r=function(N){return N.slice(-1)!=="/"&&(N+="/"),N},m=function(N,M){return M=M!==void 0?M:y.createFolders,N=r(N),this.files[N]||l.call(this,N,null,{dir:!0,createFolders:M}),this.files[N]};function x(N){return Object.prototype.toString.call(N)==="[object RegExp]"}var _={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(N){var M,C,U;for(M in this.files)U=this.files[M],(C=M.slice(this.root.length,M.length))&&M.slice(0,this.root.length)===this.root&&N(C,U)},filter:function(N){var M=[];return this.forEach(function(C,U){N(C,U)&&M.push(U)}),M},file:function(N,M,C){if(arguments.length!==1)return N=this.root+N,l.call(this,N,M,C),this;if(x(N)){var U=N;return this.filter(function(H,V){return!V.dir&&U.test(H)})}var I=this.files[this.root+N];return I&&!I.dir?I:null},folder:function(N){if(!N)return this;if(x(N))return this.filter(function(I,H){return H.dir&&N.test(I)});var M=this.root+N,C=m.call(this,M),U=this.clone();return U.root=C.name,U},remove:function(N){N=this.root+N;var M=this.files[N];if(M||(N.slice(-1)!=="/"&&(N+="/"),M=this.files[N]),M&&!M.dir)delete this.files[N];else for(var C=this.filter(function(I,H){return H.name.slice(0,N.length)===N}),U=0;U<C.length;U++)delete this.files[C[U].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(N){var M,C={};try{if((C=a.extend(N||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:o.utf8encode})).type=C.type.toLowerCase(),C.compression=C.compression.toUpperCase(),C.type==="binarystring"&&(C.type="string"),!C.type)throw new Error("No output type specified.");a.checkSupport(C.type),C.platform!=="darwin"&&C.platform!=="freebsd"&&C.platform!=="linux"&&C.platform!=="sunos"||(C.platform="UNIX"),C.platform==="win32"&&(C.platform="DOS");var U=C.comment||this.comment||"";M=s.generateWorker(this,C,U)}catch(I){(M=new d("error")).error(I)}return new g(M,C.type||"string",C.mimeType)},generateAsync:function(N,M){return this.generateInternalStream(N).accumulate(M)},generateNodeStream:function(N,M){return(N=N||{}).type||(N.type="nodebuffer"),this.generateInternalStream(N).toNodejsStream(M)}};F.exports=_},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(v,F,w){F.exports=v("stream")},{stream:void 0}],17:[function(v,F,w){var l=v("./DataReader");function o(a){l.call(this,a);for(var d=0;d<this.data.length;d++)a[d]=255&a[d]}v("../utils").inherits(o,l),o.prototype.byteAt=function(a){return this.data[this.zero+a]},o.prototype.lastIndexOfSignature=function(a){for(var d=a.charCodeAt(0),g=a.charCodeAt(1),y=a.charCodeAt(2),f=a.charCodeAt(3),b=this.length-4;0<=b;--b)if(this.data[b]===d&&this.data[b+1]===g&&this.data[b+2]===y&&this.data[b+3]===f)return b-this.zero;return-1},o.prototype.readAndCheckSignature=function(a){var d=a.charCodeAt(0),g=a.charCodeAt(1),y=a.charCodeAt(2),f=a.charCodeAt(3),b=this.readData(4);return d===b[0]&&g===b[1]&&y===b[2]&&f===b[3]},o.prototype.readData=function(a){if(this.checkOffset(a),a===0)return[];var d=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,d},F.exports=o},{"../utils":32,"./DataReader":18}],18:[function(v,F,w){var l=v("../utils");function o(a){this.data=a,this.length=a.length,this.index=0,this.zero=0}o.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<this.zero+a||a<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var d,g=0;for(this.checkOffset(a),d=this.index+a-1;d>=this.index;d--)g=(g<<8)+this.byteAt(d);return this.index+=a,g},readString:function(a){return l.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date(Date.UTC(1980+(a>>25&127),(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1))}},F.exports=o},{"../utils":32}],19:[function(v,F,w){var l=v("./Uint8ArrayReader");function o(a){l.call(this,a)}v("../utils").inherits(o,l),o.prototype.readData=function(a){this.checkOffset(a);var d=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,d},F.exports=o},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(v,F,w){var l=v("./DataReader");function o(a){l.call(this,a)}v("../utils").inherits(o,l),o.prototype.byteAt=function(a){return this.data.charCodeAt(this.zero+a)},o.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)-this.zero},o.prototype.readAndCheckSignature=function(a){return a===this.readData(4)},o.prototype.readData=function(a){this.checkOffset(a);var d=this.data.slice(this.zero+this.index,this.zero+this.index+a);return this.index+=a,d},F.exports=o},{"../utils":32,"./DataReader":18}],21:[function(v,F,w){var l=v("./ArrayReader");function o(a){l.call(this,a)}v("../utils").inherits(o,l),o.prototype.readData=function(a){if(this.checkOffset(a),a===0)return new Uint8Array(0);var d=this.data.subarray(this.zero+this.index,this.zero+this.index+a);return this.index+=a,d},F.exports=o},{"../utils":32,"./ArrayReader":17}],22:[function(v,F,w){var l=v("../utils"),o=v("../support"),a=v("./ArrayReader"),d=v("./StringReader"),g=v("./NodeBufferReader"),y=v("./Uint8ArrayReader");F.exports=function(f){var b=l.getTypeOf(f);return l.checkSupport(b),b!=="string"||o.uint8array?b==="nodebuffer"?new g(f):o.uint8array?new y(l.transformTo("uint8array",f)):new a(l.transformTo("array",f)):new d(f)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(v,F,w){w.LOCAL_FILE_HEADER="PK",w.CENTRAL_FILE_HEADER="PK",w.CENTRAL_DIRECTORY_END="PK",w.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",w.ZIP64_CENTRAL_DIRECTORY_END="PK",w.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(v,F,w){var l=v("./GenericWorker"),o=v("../utils");function a(d){l.call(this,"ConvertWorker to "+d),this.destType=d}o.inherits(a,l),a.prototype.processChunk=function(d){this.push({data:o.transformTo(this.destType,d.data),meta:d.meta})},F.exports=a},{"../utils":32,"./GenericWorker":28}],25:[function(v,F,w){var l=v("./GenericWorker"),o=v("../crc32");function a(){l.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}v("../utils").inherits(a,l),a.prototype.processChunk=function(d){this.streamInfo.crc32=o(d.data,this.streamInfo.crc32||0),this.push(d)},F.exports=a},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(v,F,w){var l=v("../utils"),o=v("./GenericWorker");function a(d){o.call(this,"DataLengthProbe for "+d),this.propName=d,this.withStreamInfo(d,0)}l.inherits(a,o),a.prototype.processChunk=function(d){if(d){var g=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=g+d.data.length}o.prototype.processChunk.call(this,d)},F.exports=a},{"../utils":32,"./GenericWorker":28}],27:[function(v,F,w){var l=v("../utils"),o=v("./GenericWorker");function a(d){o.call(this,"DataWorker");var g=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,d.then(function(y){g.dataIsReady=!0,g.data=y,g.max=y&&y.length||0,g.type=l.getTypeOf(y),g.isPaused||g._tickAndRepeat()},function(y){g.error(y)})}l.inherits(a,o),a.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this.data=null},a.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,l.delay(this._tickAndRepeat,[],this)),!0)},a.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(l.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},a.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var d=null,g=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":d=this.data.substring(this.index,g);break;case"uint8array":d=this.data.subarray(this.index,g);break;case"array":case"nodebuffer":d=this.data.slice(this.index,g)}return this.index=g,this.push({data:d,meta:{percent:this.max?this.index/this.max*100:0}})},F.exports=a},{"../utils":32,"./GenericWorker":28}],28:[function(v,F,w){function l(o){this.name=o||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}l.prototype={push:function(o){this.emit("data",o)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(o){this.emit("error",o)}return!0},error:function(o){return!this.isFinished&&(this.isPaused?this.generatedError=o:(this.isFinished=!0,this.emit("error",o),this.previous&&this.previous.error(o),this.cleanUp()),!0)},on:function(o,a){return this._listeners[o].push(a),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(o,a){if(this._listeners[o])for(var d=0;d<this._listeners[o].length;d++)this._listeners[o][d].call(this,a)},pipe:function(o){return o.registerPrevious(this)},registerPrevious:function(o){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=o.streamInfo,this.mergeStreamInfo(),this.previous=o;var a=this;return o.on("data",function(d){a.processChunk(d)}),o.on("end",function(){a.end()}),o.on("error",function(d){a.error(d)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var o=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),o=!0),this.previous&&this.previous.resume(),!o},flush:function(){},processChunk:function(o){this.push(o)},withStreamInfo:function(o,a){return this.extraStreamInfo[o]=a,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var o in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,o)&&(this.streamInfo[o]=this.extraStreamInfo[o])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var o="Worker "+this.name;return this.previous?this.previous+" -> "+o:o}},F.exports=l},{}],29:[function(v,F,w){var l=v("../utils"),o=v("./ConvertWorker"),a=v("./GenericWorker"),d=v("../base64"),g=v("../support"),y=v("../external"),f=null;if(g.nodestream)try{f=v("../nodejs/NodejsStreamOutputAdapter")}catch{}function b(u,n){return new y.Promise(function(c,r){var m=[],x=u._internalType,_=u._outputType,N=u._mimeType;u.on("data",function(M,C){m.push(M),n&&n(C)}).on("error",function(M){m=[],r(M)}).on("end",function(){try{var M=(function(C,U,I){switch(C){case"blob":return l.newBlob(l.transformTo("arraybuffer",U),I);case"base64":return d.encode(U);default:return l.transformTo(C,U)}})(_,(function(C,U){var I,H=0,V=null,h=0;for(I=0;I<U.length;I++)h+=U[I].length;switch(C){case"string":return U.join("");case"array":return Array.prototype.concat.apply([],U);case"uint8array":for(V=new Uint8Array(h),I=0;I<U.length;I++)V.set(U[I],H),H+=U[I].length;return V;case"nodebuffer":return Buffer.concat(U);default:throw new Error("concat : unsupported type '"+C+"'")}})(x,m),N);c(M)}catch(C){r(C)}m=[]}).resume()})}function s(u,n,c){var r=n;switch(n){case"blob":case"arraybuffer":r="uint8array";break;case"base64":r="string"}try{this._internalType=r,this._outputType=n,this._mimeType=c,l.checkSupport(r),this._worker=u.pipe(new o(r)),u.lock()}catch(m){this._worker=new a("error"),this._worker.error(m)}}s.prototype={accumulate:function(u){return b(this,u)},on:function(u,n){var c=this;return u==="data"?this._worker.on(u,function(r){n.call(c,r.data,r.meta)}):this._worker.on(u,function(){l.delay(n,arguments,c)}),this},resume:function(){return l.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(u){if(l.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new f(this,{objectMode:this._outputType!=="nodebuffer"},u)}},F.exports=s},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(v,F,w){if(w.base64=!0,w.array=!0,w.string=!0,w.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",w.nodebuffer=typeof Buffer<"u",w.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")w.blob=!1;else{var l=new ArrayBuffer(0);try{w.blob=new Blob([l],{type:"application/zip"}).size===0}catch{try{var o=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);o.append(l),w.blob=o.getBlob("application/zip").size===0}catch{w.blob=!1}}}try{w.nodestream=!!v("readable-stream").Readable}catch{w.nodestream=!1}},{"readable-stream":16}],31:[function(v,F,w){for(var l=v("./utils"),o=v("./support"),a=v("./nodejsUtils"),d=v("./stream/GenericWorker"),g=new Array(256),y=0;y<256;y++)g[y]=252<=y?6:248<=y?5:240<=y?4:224<=y?3:192<=y?2:1;g[254]=g[254]=1;function f(){d.call(this,"utf-8 decode"),this.leftOver=null}function b(){d.call(this,"utf-8 encode")}w.utf8encode=function(s){return o.nodebuffer?a.newBufferFrom(s,"utf-8"):(function(u){var n,c,r,m,x,_=u.length,N=0;for(m=0;m<_;m++)(64512&(c=u.charCodeAt(m)))==55296&&m+1<_&&(64512&(r=u.charCodeAt(m+1)))==56320&&(c=65536+(c-55296<<10)+(r-56320),m++),N+=c<128?1:c<2048?2:c<65536?3:4;for(n=o.uint8array?new Uint8Array(N):new Array(N),m=x=0;x<N;m++)(64512&(c=u.charCodeAt(m)))==55296&&m+1<_&&(64512&(r=u.charCodeAt(m+1)))==56320&&(c=65536+(c-55296<<10)+(r-56320),m++),c<128?n[x++]=c:(c<2048?n[x++]=192|c>>>6:(c<65536?n[x++]=224|c>>>12:(n[x++]=240|c>>>18,n[x++]=128|c>>>12&63),n[x++]=128|c>>>6&63),n[x++]=128|63&c);return n})(s)},w.utf8decode=function(s){return o.nodebuffer?l.transformTo("nodebuffer",s).toString("utf-8"):(function(u){var n,c,r,m,x=u.length,_=new Array(2*x);for(n=c=0;n<x;)if((r=u[n++])<128)_[c++]=r;else if(4<(m=g[r]))_[c++]=65533,n+=m-1;else{for(r&=m===2?31:m===3?15:7;1<m&&n<x;)r=r<<6|63&u[n++],m--;1<m?_[c++]=65533:r<65536?_[c++]=r:(r-=65536,_[c++]=55296|r>>10&1023,_[c++]=56320|1023&r)}return _.length!==c&&(_.subarray?_=_.subarray(0,c):_.length=c),l.applyFromCharCode(_)})(s=l.transformTo(o.uint8array?"uint8array":"array",s))},l.inherits(f,d),f.prototype.processChunk=function(s){var u=l.transformTo(o.uint8array?"uint8array":"array",s.data);if(this.leftOver&&this.leftOver.length){if(o.uint8array){var n=u;(u=new Uint8Array(n.length+this.leftOver.length)).set(this.leftOver,0),u.set(n,this.leftOver.length)}else u=this.leftOver.concat(u);this.leftOver=null}var c=(function(m,x){var _;for((x=x||m.length)>m.length&&(x=m.length),_=x-1;0<=_&&(192&m[_])==128;)_--;return _<0||_===0?x:_+g[m[_]]>x?_:x})(u),r=u;c!==u.length&&(o.uint8array?(r=u.subarray(0,c),this.leftOver=u.subarray(c,u.length)):(r=u.slice(0,c),this.leftOver=u.slice(c,u.length))),this.push({data:w.utf8decode(r),meta:s.meta})},f.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:w.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},w.Utf8DecodeWorker=f,l.inherits(b,d),b.prototype.processChunk=function(s){this.push({data:w.utf8encode(s.data),meta:s.meta})},w.Utf8EncodeWorker=b},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(v,F,w){var l=v("./support"),o=v("./base64"),a=v("./nodejsUtils"),d=v("./external");function g(n){return n}function y(n,c){for(var r=0;r<n.length;++r)c[r]=255&n.charCodeAt(r);return c}v("setimmediate"),w.newBlob=function(n,c){w.checkSupport("blob");try{return new Blob([n],{type:c})}catch{try{var r=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return r.append(n),r.getBlob(c)}catch{throw new Error("Bug : can't construct the Blob.")}}};var f={stringifyByChunk:function(n,c,r){var m=[],x=0,_=n.length;if(_<=r)return String.fromCharCode.apply(null,n);for(;x<_;)c==="array"||c==="nodebuffer"?m.push(String.fromCharCode.apply(null,n.slice(x,Math.min(x+r,_)))):m.push(String.fromCharCode.apply(null,n.subarray(x,Math.min(x+r,_)))),x+=r;return m.join("")},stringifyByChar:function(n){for(var c="",r=0;r<n.length;r++)c+=String.fromCharCode(n[r]);return c},applyCanBeUsed:{uint8array:(function(){try{return l.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return l.nodebuffer&&String.fromCharCode.apply(null,a.allocBuffer(1)).length===1}catch{return!1}})()}};function b(n){var c=65536,r=w.getTypeOf(n),m=!0;if(r==="uint8array"?m=f.applyCanBeUsed.uint8array:r==="nodebuffer"&&(m=f.applyCanBeUsed.nodebuffer),m)for(;1<c;)try{return f.stringifyByChunk(n,r,c)}catch{c=Math.floor(c/2)}return f.stringifyByChar(n)}function s(n,c){for(var r=0;r<n.length;r++)c[r]=n[r];return c}w.applyFromCharCode=b;var u={};u.string={string:g,array:function(n){return y(n,new Array(n.length))},arraybuffer:function(n){return u.string.uint8array(n).buffer},uint8array:function(n){return y(n,new Uint8Array(n.length))},nodebuffer:function(n){return y(n,a.allocBuffer(n.length))}},u.array={string:b,array:g,arraybuffer:function(n){return new Uint8Array(n).buffer},uint8array:function(n){return new Uint8Array(n)},nodebuffer:function(n){return a.newBufferFrom(n)}},u.arraybuffer={string:function(n){return b(new Uint8Array(n))},array:function(n){return s(new Uint8Array(n),new Array(n.byteLength))},arraybuffer:g,uint8array:function(n){return new Uint8Array(n)},nodebuffer:function(n){return a.newBufferFrom(new Uint8Array(n))}},u.uint8array={string:b,array:function(n){return s(n,new Array(n.length))},arraybuffer:function(n){return n.buffer},uint8array:g,nodebuffer:function(n){return a.newBufferFrom(n)}},u.nodebuffer={string:b,array:function(n){return s(n,new Array(n.length))},arraybuffer:function(n){return u.nodebuffer.uint8array(n).buffer},uint8array:function(n){return s(n,new Uint8Array(n.length))},nodebuffer:g},w.transformTo=function(n,c){if(c=c||"",!n)return c;w.checkSupport(n);var r=w.getTypeOf(c);return u[r][n](c)},w.resolve=function(n){for(var c=n.split("/"),r=[],m=0;m<c.length;m++){var x=c[m];x==="."||x===""&&m!==0&&m!==c.length-1||(x===".."?r.pop():r.push(x))}return r.join("/")},w.getTypeOf=function(n){return typeof n=="string"?"string":Object.prototype.toString.call(n)==="[object Array]"?"array":l.nodebuffer&&a.isBuffer(n)?"nodebuffer":l.uint8array&&n instanceof Uint8Array?"uint8array":l.arraybuffer&&n instanceof ArrayBuffer?"arraybuffer":void 0},w.checkSupport=function(n){if(!l[n.toLowerCase()])throw new Error(n+" is not supported by this platform")},w.MAX_VALUE_16BITS=65535,w.MAX_VALUE_32BITS=-1,w.pretty=function(n){var c,r,m="";for(r=0;r<(n||"").length;r++)m+="\\x"+((c=n.charCodeAt(r))<16?"0":"")+c.toString(16).toUpperCase();return m},w.delay=function(n,c,r){setImmediate(function(){n.apply(r||null,c||[])})},w.inherits=function(n,c){function r(){}r.prototype=c.prototype,n.prototype=new r},w.extend=function(){var n,c,r={};for(n=0;n<arguments.length;n++)for(c in arguments[n])Object.prototype.hasOwnProperty.call(arguments[n],c)&&r[c]===void 0&&(r[c]=arguments[n][c]);return r},w.prepareContent=function(n,c,r,m,x){return d.Promise.resolve(c).then(function(_){return l.blob&&(_ instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(_))!==-1)&&typeof FileReader<"u"?new d.Promise(function(N,M){var C=new FileReader;C.onload=function(U){N(U.target.result)},C.onerror=function(U){M(U.target.error)},C.readAsArrayBuffer(_)}):_}).then(function(_){var N=w.getTypeOf(_);return N?(N==="arraybuffer"?_=w.transformTo("uint8array",_):N==="string"&&(x?_=o.decode(_):r&&m!==!0&&(_=(function(M){return y(M,l.uint8array?new Uint8Array(M.length):new Array(M.length))})(_))),_):d.Promise.reject(new Error("Can't read the data of '"+n+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(v,F,w){var l=v("./reader/readerFor"),o=v("./utils"),a=v("./signature"),d=v("./zipEntry"),g=v("./support");function y(f){this.files=[],this.loadOptions=f}y.prototype={checkSignature:function(f){if(!this.reader.readAndCheckSignature(f)){this.reader.index-=4;var b=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+o.pretty(b)+", expected "+o.pretty(f)+")")}},isSignature:function(f,b){var s=this.reader.index;this.reader.setIndex(f);var u=this.reader.readString(4)===b;return this.reader.setIndex(s),u},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var f=this.reader.readData(this.zipCommentLength),b=g.uint8array?"uint8array":"array",s=o.transformTo(b,f);this.zipComment=this.loadOptions.decodeFileName(s)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var f,b,s,u=this.zip64EndOfCentralSize-44;0<u;)f=this.reader.readInt(2),b=this.reader.readInt(4),s=this.reader.readData(b),this.zip64ExtensibleData[f]={id:f,length:b,value:s}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var f,b;for(f=0;f<this.files.length;f++)b=this.files[f],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(a.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8(),b.processAttributes()},readCentralDir:function(){var f;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);)(f=new d({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(f);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var f=this.reader.lastIndexOfSignature(a.CENTRAL_DIRECTORY_END);if(f<0)throw this.isSignature(0,a.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(f);var b=f;if(this.checkSignature(a.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===o.MAX_VALUE_16BITS||this.diskWithCentralDirStart===o.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===o.MAX_VALUE_16BITS||this.centralDirRecords===o.MAX_VALUE_16BITS||this.centralDirSize===o.MAX_VALUE_32BITS||this.centralDirOffset===o.MAX_VALUE_32BITS){if(this.zip64=!0,(f=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(f),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,a.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var s=this.centralDirOffset+this.centralDirSize;this.zip64&&(s+=20,s+=12+this.zip64EndOfCentralSize);var u=b-s;if(0<u)this.isSignature(b,a.CENTRAL_FILE_HEADER)||(this.reader.zero=u);else if(u<0)throw new Error("Corrupted zip: missing "+Math.abs(u)+" bytes.")},prepareReader:function(f){this.reader=l(f)},load:function(f){this.prepareReader(f),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},F.exports=y},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(v,F,w){var l=v("./reader/readerFor"),o=v("./utils"),a=v("./compressedObject"),d=v("./crc32"),g=v("./utf8"),y=v("./compressions"),f=v("./support");function b(s,u){this.options=s,this.loadOptions=u}b.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(s){var u,n;if(s.skip(22),this.fileNameLength=s.readInt(2),n=s.readInt(2),this.fileName=s.readData(this.fileNameLength),s.skip(n),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((u=(function(c){for(var r in y)if(Object.prototype.hasOwnProperty.call(y,r)&&y[r].magic===c)return y[r];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+o.pretty(this.compressionMethod)+" unknown (inner file : "+o.transformTo("string",this.fileName)+")");this.decompressed=new a(this.compressedSize,this.uncompressedSize,this.crc32,u,s.readData(this.compressedSize))},readCentralPart:function(s){this.versionMadeBy=s.readInt(2),s.skip(2),this.bitFlag=s.readInt(2),this.compressionMethod=s.readString(2),this.date=s.readDate(),this.crc32=s.readInt(4),this.compressedSize=s.readInt(4),this.uncompressedSize=s.readInt(4);var u=s.readInt(2);if(this.extraFieldsLength=s.readInt(2),this.fileCommentLength=s.readInt(2),this.diskNumberStart=s.readInt(2),this.internalFileAttributes=s.readInt(2),this.externalFileAttributes=s.readInt(4),this.localHeaderOffset=s.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");s.skip(u),this.readExtraFields(s),this.parseZIP64ExtraField(s),this.fileComment=s.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var s=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),s==0&&(this.dosPermissions=63&this.externalFileAttributes),s==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var s=l(this.extraFields[1].value);this.uncompressedSize===o.MAX_VALUE_32BITS&&(this.uncompressedSize=s.readInt(8)),this.compressedSize===o.MAX_VALUE_32BITS&&(this.compressedSize=s.readInt(8)),this.localHeaderOffset===o.MAX_VALUE_32BITS&&(this.localHeaderOffset=s.readInt(8)),this.diskNumberStart===o.MAX_VALUE_32BITS&&(this.diskNumberStart=s.readInt(4))}},readExtraFields:function(s){var u,n,c,r=s.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});s.index+4<r;)u=s.readInt(2),n=s.readInt(2),c=s.readData(n),this.extraFields[u]={id:u,length:n,value:c};s.setIndex(r)},handleUTF8:function(){var s=f.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=g.utf8decode(this.fileName),this.fileCommentStr=g.utf8decode(this.fileComment);else{var u=this.findExtraFieldUnicodePath();if(u!==null)this.fileNameStr=u;else{var n=o.transformTo(s,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(n)}var c=this.findExtraFieldUnicodeComment();if(c!==null)this.fileCommentStr=c;else{var r=o.transformTo(s,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(r)}}},findExtraFieldUnicodePath:function(){var s=this.extraFields[28789];if(s){var u=l(s.value);return u.readInt(1)!==1||d(this.fileName)!==u.readInt(4)?null:g.utf8decode(u.readData(s.length-5))}return null},findExtraFieldUnicodeComment:function(){var s=this.extraFields[25461];if(s){var u=l(s.value);return u.readInt(1)!==1||d(this.fileComment)!==u.readInt(4)?null:g.utf8decode(u.readData(s.length-5))}return null}},F.exports=b},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(v,F,w){function l(u,n,c){this.name=u,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this.unixPermissions=c.unixPermissions,this.dosPermissions=c.dosPermissions,this._data=n,this._dataBinary=c.binary,this.options={compression:c.compression,compressionOptions:c.compressionOptions}}var o=v("./stream/StreamHelper"),a=v("./stream/DataWorker"),d=v("./utf8"),g=v("./compressedObject"),y=v("./stream/GenericWorker");l.prototype={internalStream:function(u){var n=null,c="string";try{if(!u)throw new Error("No output type specified.");var r=(c=u.toLowerCase())==="string"||c==="text";c!=="binarystring"&&c!=="text"||(c="string"),n=this._decompressWorker();var m=!this._dataBinary;m&&!r&&(n=n.pipe(new d.Utf8EncodeWorker)),!m&&r&&(n=n.pipe(new d.Utf8DecodeWorker))}catch(x){(n=new y("error")).error(x)}return new o(n,c,"")},async:function(u,n){return this.internalStream(u).accumulate(n)},nodeStream:function(u,n){return this.internalStream(u||"nodebuffer").toNodejsStream(n)},_compressWorker:function(u,n){if(this._data instanceof g&&this._data.compression.magic===u.magic)return this._data.getCompressedWorker();var c=this._decompressWorker();return this._dataBinary||(c=c.pipe(new d.Utf8EncodeWorker)),g.createWorkerFrom(c,u,n)},_decompressWorker:function(){return this._data instanceof g?this._data.getContentWorker():this._data instanceof y?this._data:new a(this._data)}};for(var f=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],b=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},s=0;s<f.length;s++)l.prototype[f[s]]=b;F.exports=l},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(v,F,w){(function(l){var o,a,d=l.MutationObserver||l.WebKitMutationObserver;if(d){var g=0,y=new d(u),f=l.document.createTextNode("");y.observe(f,{characterData:!0}),o=function(){f.data=g=++g%2}}else if(l.setImmediate||l.MessageChannel===void 0)o="document"in l&&"onreadystatechange"in l.document.createElement("script")?function(){var n=l.document.createElement("script");n.onreadystatechange=function(){u(),n.onreadystatechange=null,n.parentNode.removeChild(n),n=null},l.document.documentElement.appendChild(n)}:function(){setTimeout(u,0)};else{var b=new l.MessageChannel;b.port1.onmessage=u,o=function(){b.port2.postMessage(0)}}var s=[];function u(){var n,c;a=!0;for(var r=s.length;r;){for(c=s,s=[],n=-1;++n<r;)c[n]();r=s.length}a=!1}F.exports=function(n){s.push(n)!==1||a||o()}}).call(this,typeof ye<"u"?ye:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(v,F,w){var l=v("immediate");function o(){}var a={},d=["REJECTED"],g=["FULFILLED"],y=["PENDING"];function f(r){if(typeof r!="function")throw new TypeError("resolver must be a function");this.state=y,this.queue=[],this.outcome=void 0,r!==o&&n(this,r)}function b(r,m,x){this.promise=r,typeof m=="function"&&(this.onFulfilled=m,this.callFulfilled=this.otherCallFulfilled),typeof x=="function"&&(this.onRejected=x,this.callRejected=this.otherCallRejected)}function s(r,m,x){l(function(){var _;try{_=m(x)}catch(N){return a.reject(r,N)}_===r?a.reject(r,new TypeError("Cannot resolve promise with itself")):a.resolve(r,_)})}function u(r){var m=r&&r.then;if(r&&(typeof r=="object"||typeof r=="function")&&typeof m=="function")return function(){m.apply(r,arguments)}}function n(r,m){var x=!1;function _(C){x||(x=!0,a.reject(r,C))}function N(C){x||(x=!0,a.resolve(r,C))}var M=c(function(){m(N,_)});M.status==="error"&&_(M.value)}function c(r,m){var x={};try{x.value=r(m),x.status="success"}catch(_){x.status="error",x.value=_}return x}(F.exports=f).prototype.finally=function(r){if(typeof r!="function")return this;var m=this.constructor;return this.then(function(x){return m.resolve(r()).then(function(){return x})},function(x){return m.resolve(r()).then(function(){throw x})})},f.prototype.catch=function(r){return this.then(null,r)},f.prototype.then=function(r,m){if(typeof r!="function"&&this.state===g||typeof m!="function"&&this.state===d)return this;var x=new this.constructor(o);return this.state!==y?s(x,this.state===g?r:m,this.outcome):this.queue.push(new b(x,r,m)),x},b.prototype.callFulfilled=function(r){a.resolve(this.promise,r)},b.prototype.otherCallFulfilled=function(r){s(this.promise,this.onFulfilled,r)},b.prototype.callRejected=function(r){a.reject(this.promise,r)},b.prototype.otherCallRejected=function(r){s(this.promise,this.onRejected,r)},a.resolve=function(r,m){var x=c(u,m);if(x.status==="error")return a.reject(r,x.value);var _=x.value;if(_)n(r,_);else{r.state=g,r.outcome=m;for(var N=-1,M=r.queue.length;++N<M;)r.queue[N].callFulfilled(m)}return r},a.reject=function(r,m){r.state=d,r.outcome=m;for(var x=-1,_=r.queue.length;++x<_;)r.queue[x].callRejected(m);return r},f.resolve=function(r){return r instanceof this?r:a.resolve(new this(o),r)},f.reject=function(r){var m=new this(o);return a.reject(m,r)},f.all=function(r){var m=this;if(Object.prototype.toString.call(r)!=="[object Array]")return this.reject(new TypeError("must be an array"));var x=r.length,_=!1;if(!x)return this.resolve([]);for(var N=new Array(x),M=0,C=-1,U=new this(o);++C<x;)I(r[C],C);return U;function I(H,V){m.resolve(H).then(function(h){N[V]=h,++M!==x||_||(_=!0,a.resolve(U,N))},function(h){_||(_=!0,a.reject(U,h))})}},f.race=function(r){var m=this;if(Object.prototype.toString.call(r)!=="[object Array]")return this.reject(new TypeError("must be an array"));var x=r.length,_=!1;if(!x)return this.resolve([]);for(var N=-1,M=new this(o);++N<x;)C=r[N],m.resolve(C).then(function(U){_||(_=!0,a.resolve(M,U))},function(U){_||(_=!0,a.reject(M,U))});var C;return M}},{immediate:36}],38:[function(v,F,w){var l={};(0,v("./lib/utils/common").assign)(l,v("./lib/deflate"),v("./lib/inflate"),v("./lib/zlib/constants")),F.exports=l},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(v,F,w){var l=v("./zlib/deflate"),o=v("./utils/common"),a=v("./utils/strings"),d=v("./zlib/messages"),g=v("./zlib/zstream"),y=Object.prototype.toString,f=0,b=-1,s=0,u=8;function n(r){if(!(this instanceof n))return new n(r);this.options=o.assign({level:b,method:u,chunkSize:16384,windowBits:15,memLevel:8,strategy:s,to:""},r||{});var m=this.options;m.raw&&0<m.windowBits?m.windowBits=-m.windowBits:m.gzip&&0<m.windowBits&&m.windowBits<16&&(m.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new g,this.strm.avail_out=0;var x=l.deflateInit2(this.strm,m.level,m.method,m.windowBits,m.memLevel,m.strategy);if(x!==f)throw new Error(d[x]);if(m.header&&l.deflateSetHeader(this.strm,m.header),m.dictionary){var _;if(_=typeof m.dictionary=="string"?a.string2buf(m.dictionary):y.call(m.dictionary)==="[object ArrayBuffer]"?new Uint8Array(m.dictionary):m.dictionary,(x=l.deflateSetDictionary(this.strm,_))!==f)throw new Error(d[x]);this._dict_set=!0}}function c(r,m){var x=new n(m);if(x.push(r,!0),x.err)throw x.msg||d[x.err];return x.result}n.prototype.push=function(r,m){var x,_,N=this.strm,M=this.options.chunkSize;if(this.ended)return!1;_=m===~~m?m:m===!0?4:0,typeof r=="string"?N.input=a.string2buf(r):y.call(r)==="[object ArrayBuffer]"?N.input=new Uint8Array(r):N.input=r,N.next_in=0,N.avail_in=N.input.length;do{if(N.avail_out===0&&(N.output=new o.Buf8(M),N.next_out=0,N.avail_out=M),(x=l.deflate(N,_))!==1&&x!==f)return this.onEnd(x),!(this.ended=!0);N.avail_out!==0&&(N.avail_in!==0||_!==4&&_!==2)||(this.options.to==="string"?this.onData(a.buf2binstring(o.shrinkBuf(N.output,N.next_out))):this.onData(o.shrinkBuf(N.output,N.next_out)))}while((0<N.avail_in||N.avail_out===0)&&x!==1);return _===4?(x=l.deflateEnd(this.strm),this.onEnd(x),this.ended=!0,x===f):_!==2||(this.onEnd(f),!(N.avail_out=0))},n.prototype.onData=function(r){this.chunks.push(r)},n.prototype.onEnd=function(r){r===f&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=r,this.msg=this.strm.msg},w.Deflate=n,w.deflate=c,w.deflateRaw=function(r,m){return(m=m||{}).raw=!0,c(r,m)},w.gzip=function(r,m){return(m=m||{}).gzip=!0,c(r,m)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(v,F,w){var l=v("./zlib/inflate"),o=v("./utils/common"),a=v("./utils/strings"),d=v("./zlib/constants"),g=v("./zlib/messages"),y=v("./zlib/zstream"),f=v("./zlib/gzheader"),b=Object.prototype.toString;function s(n){if(!(this instanceof s))return new s(n);this.options=o.assign({chunkSize:16384,windowBits:0,to:""},n||{});var c=this.options;c.raw&&0<=c.windowBits&&c.windowBits<16&&(c.windowBits=-c.windowBits,c.windowBits===0&&(c.windowBits=-15)),!(0<=c.windowBits&&c.windowBits<16)||n&&n.windowBits||(c.windowBits+=32),15<c.windowBits&&c.windowBits<48&&(15&c.windowBits)==0&&(c.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new y,this.strm.avail_out=0;var r=l.inflateInit2(this.strm,c.windowBits);if(r!==d.Z_OK)throw new Error(g[r]);this.header=new f,l.inflateGetHeader(this.strm,this.header)}function u(n,c){var r=new s(c);if(r.push(n,!0),r.err)throw r.msg||g[r.err];return r.result}s.prototype.push=function(n,c){var r,m,x,_,N,M,C=this.strm,U=this.options.chunkSize,I=this.options.dictionary,H=!1;if(this.ended)return!1;m=c===~~c?c:c===!0?d.Z_FINISH:d.Z_NO_FLUSH,typeof n=="string"?C.input=a.binstring2buf(n):b.call(n)==="[object ArrayBuffer]"?C.input=new Uint8Array(n):C.input=n,C.next_in=0,C.avail_in=C.input.length;do{if(C.avail_out===0&&(C.output=new o.Buf8(U),C.next_out=0,C.avail_out=U),(r=l.inflate(C,d.Z_NO_FLUSH))===d.Z_NEED_DICT&&I&&(M=typeof I=="string"?a.string2buf(I):b.call(I)==="[object ArrayBuffer]"?new Uint8Array(I):I,r=l.inflateSetDictionary(this.strm,M)),r===d.Z_BUF_ERROR&&H===!0&&(r=d.Z_OK,H=!1),r!==d.Z_STREAM_END&&r!==d.Z_OK)return this.onEnd(r),!(this.ended=!0);C.next_out&&(C.avail_out!==0&&r!==d.Z_STREAM_END&&(C.avail_in!==0||m!==d.Z_FINISH&&m!==d.Z_SYNC_FLUSH)||(this.options.to==="string"?(x=a.utf8border(C.output,C.next_out),_=C.next_out-x,N=a.buf2string(C.output,x),C.next_out=_,C.avail_out=U-_,_&&o.arraySet(C.output,C.output,x,_,0),this.onData(N)):this.onData(o.shrinkBuf(C.output,C.next_out)))),C.avail_in===0&&C.avail_out===0&&(H=!0)}while((0<C.avail_in||C.avail_out===0)&&r!==d.Z_STREAM_END);return r===d.Z_STREAM_END&&(m=d.Z_FINISH),m===d.Z_FINISH?(r=l.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===d.Z_OK):m!==d.Z_SYNC_FLUSH||(this.onEnd(d.Z_OK),!(C.avail_out=0))},s.prototype.onData=function(n){this.chunks.push(n)},s.prototype.onEnd=function(n){n===d.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=n,this.msg=this.strm.msg},w.Inflate=s,w.inflate=u,w.inflateRaw=function(n,c){return(c=c||{}).raw=!0,u(n,c)},w.ungzip=u},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(v,F,w){var l=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";w.assign=function(d){for(var g=Array.prototype.slice.call(arguments,1);g.length;){var y=g.shift();if(y){if(typeof y!="object")throw new TypeError(y+"must be non-object");for(var f in y)y.hasOwnProperty(f)&&(d[f]=y[f])}}return d},w.shrinkBuf=function(d,g){return d.length===g?d:d.subarray?d.subarray(0,g):(d.length=g,d)};var o={arraySet:function(d,g,y,f,b){if(g.subarray&&d.subarray)d.set(g.subarray(y,y+f),b);else for(var s=0;s<f;s++)d[b+s]=g[y+s]},flattenChunks:function(d){var g,y,f,b,s,u;for(g=f=0,y=d.length;g<y;g++)f+=d[g].length;for(u=new Uint8Array(f),g=b=0,y=d.length;g<y;g++)s=d[g],u.set(s,b),b+=s.length;return u}},a={arraySet:function(d,g,y,f,b){for(var s=0;s<f;s++)d[b+s]=g[y+s]},flattenChunks:function(d){return[].concat.apply([],d)}};w.setTyped=function(d){d?(w.Buf8=Uint8Array,w.Buf16=Uint16Array,w.Buf32=Int32Array,w.assign(w,o)):(w.Buf8=Array,w.Buf16=Array,w.Buf32=Array,w.assign(w,a))},w.setTyped(l)},{}],42:[function(v,F,w){var l=v("./common"),o=!0,a=!0;try{String.fromCharCode.apply(null,[0])}catch{o=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{a=!1}for(var d=new l.Buf8(256),g=0;g<256;g++)d[g]=252<=g?6:248<=g?5:240<=g?4:224<=g?3:192<=g?2:1;function y(f,b){if(b<65537&&(f.subarray&&a||!f.subarray&&o))return String.fromCharCode.apply(null,l.shrinkBuf(f,b));for(var s="",u=0;u<b;u++)s+=String.fromCharCode(f[u]);return s}d[254]=d[254]=1,w.string2buf=function(f){var b,s,u,n,c,r=f.length,m=0;for(n=0;n<r;n++)(64512&(s=f.charCodeAt(n)))==55296&&n+1<r&&(64512&(u=f.charCodeAt(n+1)))==56320&&(s=65536+(s-55296<<10)+(u-56320),n++),m+=s<128?1:s<2048?2:s<65536?3:4;for(b=new l.Buf8(m),n=c=0;c<m;n++)(64512&(s=f.charCodeAt(n)))==55296&&n+1<r&&(64512&(u=f.charCodeAt(n+1)))==56320&&(s=65536+(s-55296<<10)+(u-56320),n++),s<128?b[c++]=s:(s<2048?b[c++]=192|s>>>6:(s<65536?b[c++]=224|s>>>12:(b[c++]=240|s>>>18,b[c++]=128|s>>>12&63),b[c++]=128|s>>>6&63),b[c++]=128|63&s);return b},w.buf2binstring=function(f){return y(f,f.length)},w.binstring2buf=function(f){for(var b=new l.Buf8(f.length),s=0,u=b.length;s<u;s++)b[s]=f.charCodeAt(s);return b},w.buf2string=function(f,b){var s,u,n,c,r=b||f.length,m=new Array(2*r);for(s=u=0;s<r;)if((n=f[s++])<128)m[u++]=n;else if(4<(c=d[n]))m[u++]=65533,s+=c-1;else{for(n&=c===2?31:c===3?15:7;1<c&&s<r;)n=n<<6|63&f[s++],c--;1<c?m[u++]=65533:n<65536?m[u++]=n:(n-=65536,m[u++]=55296|n>>10&1023,m[u++]=56320|1023&n)}return y(m,u)},w.utf8border=function(f,b){var s;for((b=b||f.length)>f.length&&(b=f.length),s=b-1;0<=s&&(192&f[s])==128;)s--;return s<0||s===0?b:s+d[f[s]]>b?s:b}},{"./common":41}],43:[function(v,F,w){F.exports=function(l,o,a,d){for(var g=65535&l|0,y=l>>>16&65535|0,f=0;a!==0;){for(a-=f=2e3<a?2e3:a;y=y+(g=g+o[d++]|0)|0,--f;);g%=65521,y%=65521}return g|y<<16|0}},{}],44:[function(v,F,w){F.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(v,F,w){var l=(function(){for(var o,a=[],d=0;d<256;d++){o=d;for(var g=0;g<8;g++)o=1&o?3988292384^o>>>1:o>>>1;a[d]=o}return a})();F.exports=function(o,a,d,g){var y=l,f=g+d;o^=-1;for(var b=g;b<f;b++)o=o>>>8^y[255&(o^a[b])];return-1^o}},{}],46:[function(v,F,w){var l,o=v("../utils/common"),a=v("./trees"),d=v("./adler32"),g=v("./crc32"),y=v("./messages"),f=0,b=4,s=0,u=-2,n=-1,c=4,r=2,m=8,x=9,_=286,N=30,M=19,C=2*_+1,U=15,I=3,H=258,V=H+I+1,h=42,D=113,t=1,L=2,X=3,B=4;function J(e,R){return e.msg=y[R],R}function z(e){return(e<<1)-(4<e?9:0)}function K(e){for(var R=e.length;0<=--R;)e[R]=0}function T(e){var R=e.state,E=R.pending;E>e.avail_out&&(E=e.avail_out),E!==0&&(o.arraySet(e.output,R.pending_buf,R.pending_out,E,e.next_out),e.next_out+=E,R.pending_out+=E,e.total_out+=E,e.avail_out-=E,R.pending-=E,R.pending===0&&(R.pending_out=0))}function A(e,R){a._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,R),e.block_start=e.strstart,T(e.strm)}function $(e,R){e.pending_buf[e.pending++]=R}function W(e,R){e.pending_buf[e.pending++]=R>>>8&255,e.pending_buf[e.pending++]=255&R}function G(e,R){var E,p,i=e.max_chain_length,k=e.strstart,P=e.prev_length,O=e.nice_match,S=e.strstart>e.w_size-V?e.strstart-(e.w_size-V):0,j=e.window,Y=e.w_mask,q=e.prev,Z=e.strstart+H,ne=j[k+P-1],ee=j[k+P];e.prev_length>=e.good_match&&(i>>=2),O>e.lookahead&&(O=e.lookahead);do if(j[(E=R)+P]===ee&&j[E+P-1]===ne&&j[E]===j[k]&&j[++E]===j[k+1]){k+=2,E++;do;while(j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&j[++k]===j[++E]&&k<Z);if(p=H-(Z-k),k=Z-H,P<p){if(e.match_start=R,O<=(P=p))break;ne=j[k+P-1],ee=j[k+P]}}while((R=q[R&Y])>S&&--i!=0);return P<=e.lookahead?P:e.lookahead}function ae(e){var R,E,p,i,k,P,O,S,j,Y,q=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=q+(q-V)){for(o.arraySet(e.window,e.window,q,q,0),e.match_start-=q,e.strstart-=q,e.block_start-=q,R=E=e.hash_size;p=e.head[--R],e.head[R]=q<=p?p-q:0,--E;);for(R=E=q;p=e.prev[--R],e.prev[R]=q<=p?p-q:0,--E;);i+=q}if(e.strm.avail_in===0)break;if(P=e.strm,O=e.window,S=e.strstart+e.lookahead,j=i,Y=void 0,Y=P.avail_in,j<Y&&(Y=j),E=Y===0?0:(P.avail_in-=Y,o.arraySet(O,P.input,P.next_in,Y,S),P.state.wrap===1?P.adler=d(P.adler,O,Y,S):P.state.wrap===2&&(P.adler=g(P.adler,O,Y,S)),P.next_in+=Y,P.total_in+=Y,Y),e.lookahead+=E,e.lookahead+e.insert>=I)for(k=e.strstart-e.insert,e.ins_h=e.window[k],e.ins_h=(e.ins_h<<e.hash_shift^e.window[k+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[k+I-1])&e.hash_mask,e.prev[k&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=k,k++,e.insert--,!(e.lookahead+e.insert<I)););}while(e.lookahead<V&&e.strm.avail_in!==0)}function le(e,R){for(var E,p;;){if(e.lookahead<V){if(ae(e),e.lookahead<V&&R===f)return t;if(e.lookahead===0)break}if(E=0,e.lookahead>=I&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+I-1])&e.hash_mask,E=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),E!==0&&e.strstart-E<=e.w_size-V&&(e.match_length=G(e,E)),e.match_length>=I)if(p=a._tr_tally(e,e.strstart-e.match_start,e.match_length-I),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=I){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+I-1])&e.hash_mask,E=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,--e.match_length!=0;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else p=a._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(p&&(A(e,!1),e.strm.avail_out===0))return t}return e.insert=e.strstart<I-1?e.strstart:I-1,R===b?(A(e,!0),e.strm.avail_out===0?X:B):e.last_lit&&(A(e,!1),e.strm.avail_out===0)?t:L}function Q(e,R){for(var E,p,i;;){if(e.lookahead<V){if(ae(e),e.lookahead<V&&R===f)return t;if(e.lookahead===0)break}if(E=0,e.lookahead>=I&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+I-1])&e.hash_mask,E=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=I-1,E!==0&&e.prev_length<e.max_lazy_match&&e.strstart-E<=e.w_size-V&&(e.match_length=G(e,E),e.match_length<=5&&(e.strategy===1||e.match_length===I&&4096<e.strstart-e.match_start)&&(e.match_length=I-1)),e.prev_length>=I&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-I,p=a._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-I),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+I-1])&e.hash_mask,E=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),--e.prev_length!=0;);if(e.match_available=0,e.match_length=I-1,e.strstart++,p&&(A(e,!1),e.strm.avail_out===0))return t}else if(e.match_available){if((p=a._tr_tally(e,0,e.window[e.strstart-1]))&&A(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return t}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(p=a._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<I-1?e.strstart:I-1,R===b?(A(e,!0),e.strm.avail_out===0?X:B):e.last_lit&&(A(e,!1),e.strm.avail_out===0)?t:L}function te(e,R,E,p,i){this.good_length=e,this.max_lazy=R,this.nice_length=E,this.max_chain=p,this.func=i}function ie(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=m,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new o.Buf16(2*C),this.dyn_dtree=new o.Buf16(2*(2*N+1)),this.bl_tree=new o.Buf16(2*(2*M+1)),K(this.dyn_ltree),K(this.dyn_dtree),K(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new o.Buf16(U+1),this.heap=new o.Buf16(2*_+1),K(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new o.Buf16(2*_+1),K(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function se(e){var R;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=r,(R=e.state).pending=0,R.pending_out=0,R.wrap<0&&(R.wrap=-R.wrap),R.status=R.wrap?h:D,e.adler=R.wrap===2?0:1,R.last_flush=f,a._tr_init(R),s):J(e,u)}function pe(e){var R=se(e);return R===s&&(function(E){E.window_size=2*E.w_size,K(E.head),E.max_lazy_match=l[E.level].max_lazy,E.good_match=l[E.level].good_length,E.nice_match=l[E.level].nice_length,E.max_chain_length=l[E.level].max_chain,E.strstart=0,E.block_start=0,E.lookahead=0,E.insert=0,E.match_length=E.prev_length=I-1,E.match_available=0,E.ins_h=0})(e.state),R}function ce(e,R,E,p,i,k){if(!e)return u;var P=1;if(R===n&&(R=6),p<0?(P=0,p=-p):15<p&&(P=2,p-=16),i<1||x<i||E!==m||p<8||15<p||R<0||9<R||k<0||c<k)return J(e,u);p===8&&(p=9);var O=new ie;return(e.state=O).strm=e,O.wrap=P,O.gzhead=null,O.w_bits=p,O.w_size=1<<O.w_bits,O.w_mask=O.w_size-1,O.hash_bits=i+7,O.hash_size=1<<O.hash_bits,O.hash_mask=O.hash_size-1,O.hash_shift=~~((O.hash_bits+I-1)/I),O.window=new o.Buf8(2*O.w_size),O.head=new o.Buf16(O.hash_size),O.prev=new o.Buf16(O.w_size),O.lit_bufsize=1<<i+6,O.pending_buf_size=4*O.lit_bufsize,O.pending_buf=new o.Buf8(O.pending_buf_size),O.d_buf=1*O.lit_bufsize,O.l_buf=3*O.lit_bufsize,O.level=R,O.strategy=k,O.method=E,pe(e)}l=[new te(0,0,0,0,function(e,R){var E=65535;for(E>e.pending_buf_size-5&&(E=e.pending_buf_size-5);;){if(e.lookahead<=1){if(ae(e),e.lookahead===0&&R===f)return t;if(e.lookahead===0)break}e.strstart+=e.lookahead,e.lookahead=0;var p=e.block_start+E;if((e.strstart===0||e.strstart>=p)&&(e.lookahead=e.strstart-p,e.strstart=p,A(e,!1),e.strm.avail_out===0)||e.strstart-e.block_start>=e.w_size-V&&(A(e,!1),e.strm.avail_out===0))return t}return e.insert=0,R===b?(A(e,!0),e.strm.avail_out===0?X:B):(e.strstart>e.block_start&&(A(e,!1),e.strm.avail_out),t)}),new te(4,4,8,4,le),new te(4,5,16,8,le),new te(4,6,32,32,le),new te(4,4,16,16,Q),new te(8,16,32,32,Q),new te(8,16,128,128,Q),new te(8,32,128,256,Q),new te(32,128,258,1024,Q),new te(32,258,258,4096,Q)],w.deflateInit=function(e,R){return ce(e,R,m,15,8,0)},w.deflateInit2=ce,w.deflateReset=pe,w.deflateResetKeep=se,w.deflateSetHeader=function(e,R){return e&&e.state?e.state.wrap!==2?u:(e.state.gzhead=R,s):u},w.deflate=function(e,R){var E,p,i,k;if(!e||!e.state||5<R||R<0)return e?J(e,u):u;if(p=e.state,!e.output||!e.input&&e.avail_in!==0||p.status===666&&R!==b)return J(e,e.avail_out===0?-5:u);if(p.strm=e,E=p.last_flush,p.last_flush=R,p.status===h)if(p.wrap===2)e.adler=0,$(p,31),$(p,139),$(p,8),p.gzhead?($(p,(p.gzhead.text?1:0)+(p.gzhead.hcrc?2:0)+(p.gzhead.extra?4:0)+(p.gzhead.name?8:0)+(p.gzhead.comment?16:0)),$(p,255&p.gzhead.time),$(p,p.gzhead.time>>8&255),$(p,p.gzhead.time>>16&255),$(p,p.gzhead.time>>24&255),$(p,p.level===9?2:2<=p.strategy||p.level<2?4:0),$(p,255&p.gzhead.os),p.gzhead.extra&&p.gzhead.extra.length&&($(p,255&p.gzhead.extra.length),$(p,p.gzhead.extra.length>>8&255)),p.gzhead.hcrc&&(e.adler=g(e.adler,p.pending_buf,p.pending,0)),p.gzindex=0,p.status=69):($(p,0),$(p,0),$(p,0),$(p,0),$(p,0),$(p,p.level===9?2:2<=p.strategy||p.level<2?4:0),$(p,3),p.status=D);else{var P=m+(p.w_bits-8<<4)<<8;P|=(2<=p.strategy||p.level<2?0:p.level<6?1:p.level===6?2:3)<<6,p.strstart!==0&&(P|=32),P+=31-P%31,p.status=D,W(p,P),p.strstart!==0&&(W(p,e.adler>>>16),W(p,65535&e.adler)),e.adler=1}if(p.status===69)if(p.gzhead.extra){for(i=p.pending;p.gzindex<(65535&p.gzhead.extra.length)&&(p.pending!==p.pending_buf_size||(p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),T(e),i=p.pending,p.pending!==p.pending_buf_size));)$(p,255&p.gzhead.extra[p.gzindex]),p.gzindex++;p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),p.gzindex===p.gzhead.extra.length&&(p.gzindex=0,p.status=73)}else p.status=73;if(p.status===73)if(p.gzhead.name){i=p.pending;do{if(p.pending===p.pending_buf_size&&(p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),T(e),i=p.pending,p.pending===p.pending_buf_size)){k=1;break}k=p.gzindex<p.gzhead.name.length?255&p.gzhead.name.charCodeAt(p.gzindex++):0,$(p,k)}while(k!==0);p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),k===0&&(p.gzindex=0,p.status=91)}else p.status=91;if(p.status===91)if(p.gzhead.comment){i=p.pending;do{if(p.pending===p.pending_buf_size&&(p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),T(e),i=p.pending,p.pending===p.pending_buf_size)){k=1;break}k=p.gzindex<p.gzhead.comment.length?255&p.gzhead.comment.charCodeAt(p.gzindex++):0,$(p,k)}while(k!==0);p.gzhead.hcrc&&p.pending>i&&(e.adler=g(e.adler,p.pending_buf,p.pending-i,i)),k===0&&(p.status=103)}else p.status=103;if(p.status===103&&(p.gzhead.hcrc?(p.pending+2>p.pending_buf_size&&T(e),p.pending+2<=p.pending_buf_size&&($(p,255&e.adler),$(p,e.adler>>8&255),e.adler=0,p.status=D)):p.status=D),p.pending!==0){if(T(e),e.avail_out===0)return p.last_flush=-1,s}else if(e.avail_in===0&&z(R)<=z(E)&&R!==b)return J(e,-5);if(p.status===666&&e.avail_in!==0)return J(e,-5);if(e.avail_in!==0||p.lookahead!==0||R!==f&&p.status!==666){var O=p.strategy===2?(function(S,j){for(var Y;;){if(S.lookahead===0&&(ae(S),S.lookahead===0)){if(j===f)return t;break}if(S.match_length=0,Y=a._tr_tally(S,0,S.window[S.strstart]),S.lookahead--,S.strstart++,Y&&(A(S,!1),S.strm.avail_out===0))return t}return S.insert=0,j===b?(A(S,!0),S.strm.avail_out===0?X:B):S.last_lit&&(A(S,!1),S.strm.avail_out===0)?t:L})(p,R):p.strategy===3?(function(S,j){for(var Y,q,Z,ne,ee=S.window;;){if(S.lookahead<=H){if(ae(S),S.lookahead<=H&&j===f)return t;if(S.lookahead===0)break}if(S.match_length=0,S.lookahead>=I&&0<S.strstart&&(q=ee[Z=S.strstart-1])===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]){ne=S.strstart+H;do;while(q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&q===ee[++Z]&&Z<ne);S.match_length=H-(ne-Z),S.match_length>S.lookahead&&(S.match_length=S.lookahead)}if(S.match_length>=I?(Y=a._tr_tally(S,1,S.match_length-I),S.lookahead-=S.match_length,S.strstart+=S.match_length,S.match_length=0):(Y=a._tr_tally(S,0,S.window[S.strstart]),S.lookahead--,S.strstart++),Y&&(A(S,!1),S.strm.avail_out===0))return t}return S.insert=0,j===b?(A(S,!0),S.strm.avail_out===0?X:B):S.last_lit&&(A(S,!1),S.strm.avail_out===0)?t:L})(p,R):l[p.level].func(p,R);if(O!==X&&O!==B||(p.status=666),O===t||O===X)return e.avail_out===0&&(p.last_flush=-1),s;if(O===L&&(R===1?a._tr_align(p):R!==5&&(a._tr_stored_block(p,0,0,!1),R===3&&(K(p.head),p.lookahead===0&&(p.strstart=0,p.block_start=0,p.insert=0))),T(e),e.avail_out===0))return p.last_flush=-1,s}return R!==b?s:p.wrap<=0?1:(p.wrap===2?($(p,255&e.adler),$(p,e.adler>>8&255),$(p,e.adler>>16&255),$(p,e.adler>>24&255),$(p,255&e.total_in),$(p,e.total_in>>8&255),$(p,e.total_in>>16&255),$(p,e.total_in>>24&255)):(W(p,e.adler>>>16),W(p,65535&e.adler)),T(e),0<p.wrap&&(p.wrap=-p.wrap),p.pending!==0?s:1)},w.deflateEnd=function(e){var R;return e&&e.state?(R=e.state.status)!==h&&R!==69&&R!==73&&R!==91&&R!==103&&R!==D&&R!==666?J(e,u):(e.state=null,R===D?J(e,-3):s):u},w.deflateSetDictionary=function(e,R){var E,p,i,k,P,O,S,j,Y=R.length;if(!e||!e.state||(k=(E=e.state).wrap)===2||k===1&&E.status!==h||E.lookahead)return u;for(k===1&&(e.adler=d(e.adler,R,Y,0)),E.wrap=0,Y>=E.w_size&&(k===0&&(K(E.head),E.strstart=0,E.block_start=0,E.insert=0),j=new o.Buf8(E.w_size),o.arraySet(j,R,Y-E.w_size,E.w_size,0),R=j,Y=E.w_size),P=e.avail_in,O=e.next_in,S=e.input,e.avail_in=Y,e.next_in=0,e.input=R,ae(E);E.lookahead>=I;){for(p=E.strstart,i=E.lookahead-(I-1);E.ins_h=(E.ins_h<<E.hash_shift^E.window[p+I-1])&E.hash_mask,E.prev[p&E.w_mask]=E.head[E.ins_h],E.head[E.ins_h]=p,p++,--i;);E.strstart=p,E.lookahead=I-1,ae(E)}return E.strstart+=E.lookahead,E.block_start=E.strstart,E.insert=E.lookahead,E.lookahead=0,E.match_length=E.prev_length=I-1,E.match_available=0,e.next_in=O,e.input=S,e.avail_in=P,E.wrap=k,s},w.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(v,F,w){F.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(v,F,w){F.exports=function(l,o){var a,d,g,y,f,b,s,u,n,c,r,m,x,_,N,M,C,U,I,H,V,h,D,t,L;a=l.state,d=l.next_in,t=l.input,g=d+(l.avail_in-5),y=l.next_out,L=l.output,f=y-(o-l.avail_out),b=y+(l.avail_out-257),s=a.dmax,u=a.wsize,n=a.whave,c=a.wnext,r=a.window,m=a.hold,x=a.bits,_=a.lencode,N=a.distcode,M=(1<<a.lenbits)-1,C=(1<<a.distbits)-1;e:do{x<15&&(m+=t[d++]<<x,x+=8,m+=t[d++]<<x,x+=8),U=_[m&M];t:for(;;){if(m>>>=I=U>>>24,x-=I,(I=U>>>16&255)===0)L[y++]=65535&U;else{if(!(16&I)){if((64&I)==0){U=_[(65535&U)+(m&(1<<I)-1)];continue t}if(32&I){a.mode=12;break e}l.msg="invalid literal/length code",a.mode=30;break e}H=65535&U,(I&=15)&&(x<I&&(m+=t[d++]<<x,x+=8),H+=m&(1<<I)-1,m>>>=I,x-=I),x<15&&(m+=t[d++]<<x,x+=8,m+=t[d++]<<x,x+=8),U=N[m&C];n:for(;;){if(m>>>=I=U>>>24,x-=I,!(16&(I=U>>>16&255))){if((64&I)==0){U=N[(65535&U)+(m&(1<<I)-1)];continue n}l.msg="invalid distance code",a.mode=30;break e}if(V=65535&U,x<(I&=15)&&(m+=t[d++]<<x,(x+=8)<I&&(m+=t[d++]<<x,x+=8)),s<(V+=m&(1<<I)-1)){l.msg="invalid distance too far back",a.mode=30;break e}if(m>>>=I,x-=I,(I=y-f)<V){if(n<(I=V-I)&&a.sane){l.msg="invalid distance too far back",a.mode=30;break e}if(D=r,(h=0)===c){if(h+=u-I,I<H){for(H-=I;L[y++]=r[h++],--I;);h=y-V,D=L}}else if(c<I){if(h+=u+c-I,(I-=c)<H){for(H-=I;L[y++]=r[h++],--I;);if(h=0,c<H){for(H-=I=c;L[y++]=r[h++],--I;);h=y-V,D=L}}}else if(h+=c-I,I<H){for(H-=I;L[y++]=r[h++],--I;);h=y-V,D=L}for(;2<H;)L[y++]=D[h++],L[y++]=D[h++],L[y++]=D[h++],H-=3;H&&(L[y++]=D[h++],1<H&&(L[y++]=D[h++]))}else{for(h=y-V;L[y++]=L[h++],L[y++]=L[h++],L[y++]=L[h++],2<(H-=3););H&&(L[y++]=L[h++],1<H&&(L[y++]=L[h++]))}break}}break}}while(d<g&&y<b);d-=H=x>>3,m&=(1<<(x-=H<<3))-1,l.next_in=d,l.next_out=y,l.avail_in=d<g?g-d+5:5-(d-g),l.avail_out=y<b?b-y+257:257-(y-b),a.hold=m,a.bits=x}},{}],49:[function(v,F,w){var l=v("../utils/common"),o=v("./adler32"),a=v("./crc32"),d=v("./inffast"),g=v("./inftrees"),y=1,f=2,b=0,s=-2,u=1,n=852,c=592;function r(h){return(h>>>24&255)+(h>>>8&65280)+((65280&h)<<8)+((255&h)<<24)}function m(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new l.Buf16(320),this.work=new l.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function x(h){var D;return h&&h.state?(D=h.state,h.total_in=h.total_out=D.total=0,h.msg="",D.wrap&&(h.adler=1&D.wrap),D.mode=u,D.last=0,D.havedict=0,D.dmax=32768,D.head=null,D.hold=0,D.bits=0,D.lencode=D.lendyn=new l.Buf32(n),D.distcode=D.distdyn=new l.Buf32(c),D.sane=1,D.back=-1,b):s}function _(h){var D;return h&&h.state?((D=h.state).wsize=0,D.whave=0,D.wnext=0,x(h)):s}function N(h,D){var t,L;return h&&h.state?(L=h.state,D<0?(t=0,D=-D):(t=1+(D>>4),D<48&&(D&=15)),D&&(D<8||15<D)?s:(L.window!==null&&L.wbits!==D&&(L.window=null),L.wrap=t,L.wbits=D,_(h))):s}function M(h,D){var t,L;return h?(L=new m,(h.state=L).window=null,(t=N(h,D))!==b&&(h.state=null),t):s}var C,U,I=!0;function H(h){if(I){var D;for(C=new l.Buf32(512),U=new l.Buf32(32),D=0;D<144;)h.lens[D++]=8;for(;D<256;)h.lens[D++]=9;for(;D<280;)h.lens[D++]=7;for(;D<288;)h.lens[D++]=8;for(g(y,h.lens,0,288,C,0,h.work,{bits:9}),D=0;D<32;)h.lens[D++]=5;g(f,h.lens,0,32,U,0,h.work,{bits:5}),I=!1}h.lencode=C,h.lenbits=9,h.distcode=U,h.distbits=5}function V(h,D,t,L){var X,B=h.state;return B.window===null&&(B.wsize=1<<B.wbits,B.wnext=0,B.whave=0,B.window=new l.Buf8(B.wsize)),L>=B.wsize?(l.arraySet(B.window,D,t-B.wsize,B.wsize,0),B.wnext=0,B.whave=B.wsize):(L<(X=B.wsize-B.wnext)&&(X=L),l.arraySet(B.window,D,t-L,X,B.wnext),(L-=X)?(l.arraySet(B.window,D,t-L,L,0),B.wnext=L,B.whave=B.wsize):(B.wnext+=X,B.wnext===B.wsize&&(B.wnext=0),B.whave<B.wsize&&(B.whave+=X))),0}w.inflateReset=_,w.inflateReset2=N,w.inflateResetKeep=x,w.inflateInit=function(h){return M(h,15)},w.inflateInit2=M,w.inflate=function(h,D){var t,L,X,B,J,z,K,T,A,$,W,G,ae,le,Q,te,ie,se,pe,ce,e,R,E,p,i=0,k=new l.Buf8(4),P=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!h||!h.state||!h.output||!h.input&&h.avail_in!==0)return s;(t=h.state).mode===12&&(t.mode=13),J=h.next_out,X=h.output,K=h.avail_out,B=h.next_in,L=h.input,z=h.avail_in,T=t.hold,A=t.bits,$=z,W=K,R=b;e:for(;;)switch(t.mode){case u:if(t.wrap===0){t.mode=13;break}for(;A<16;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(2&t.wrap&&T===35615){k[t.check=0]=255&T,k[1]=T>>>8&255,t.check=a(t.check,k,2,0),A=T=0,t.mode=2;break}if(t.flags=0,t.head&&(t.head.done=!1),!(1&t.wrap)||(((255&T)<<8)+(T>>8))%31){h.msg="incorrect header check",t.mode=30;break}if((15&T)!=8){h.msg="unknown compression method",t.mode=30;break}if(A-=4,e=8+(15&(T>>>=4)),t.wbits===0)t.wbits=e;else if(e>t.wbits){h.msg="invalid window size",t.mode=30;break}t.dmax=1<<e,h.adler=t.check=1,t.mode=512&T?10:12,A=T=0;break;case 2:for(;A<16;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(t.flags=T,(255&t.flags)!=8){h.msg="unknown compression method",t.mode=30;break}if(57344&t.flags){h.msg="unknown header flags set",t.mode=30;break}t.head&&(t.head.text=T>>8&1),512&t.flags&&(k[0]=255&T,k[1]=T>>>8&255,t.check=a(t.check,k,2,0)),A=T=0,t.mode=3;case 3:for(;A<32;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.head&&(t.head.time=T),512&t.flags&&(k[0]=255&T,k[1]=T>>>8&255,k[2]=T>>>16&255,k[3]=T>>>24&255,t.check=a(t.check,k,4,0)),A=T=0,t.mode=4;case 4:for(;A<16;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.head&&(t.head.xflags=255&T,t.head.os=T>>8),512&t.flags&&(k[0]=255&T,k[1]=T>>>8&255,t.check=a(t.check,k,2,0)),A=T=0,t.mode=5;case 5:if(1024&t.flags){for(;A<16;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.length=T,t.head&&(t.head.extra_len=T),512&t.flags&&(k[0]=255&T,k[1]=T>>>8&255,t.check=a(t.check,k,2,0)),A=T=0}else t.head&&(t.head.extra=null);t.mode=6;case 6:if(1024&t.flags&&(z<(G=t.length)&&(G=z),G&&(t.head&&(e=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Array(t.head.extra_len)),l.arraySet(t.head.extra,L,B,G,e)),512&t.flags&&(t.check=a(t.check,L,G,B)),z-=G,B+=G,t.length-=G),t.length))break e;t.length=0,t.mode=7;case 7:if(2048&t.flags){if(z===0)break e;for(G=0;e=L[B+G++],t.head&&e&&t.length<65536&&(t.head.name+=String.fromCharCode(e)),e&&G<z;);if(512&t.flags&&(t.check=a(t.check,L,G,B)),z-=G,B+=G,e)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=8;case 8:if(4096&t.flags){if(z===0)break e;for(G=0;e=L[B+G++],t.head&&e&&t.length<65536&&(t.head.comment+=String.fromCharCode(e)),e&&G<z;);if(512&t.flags&&(t.check=a(t.check,L,G,B)),z-=G,B+=G,e)break e}else t.head&&(t.head.comment=null);t.mode=9;case 9:if(512&t.flags){for(;A<16;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(T!==(65535&t.check)){h.msg="header crc mismatch",t.mode=30;break}A=T=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),h.adler=t.check=0,t.mode=12;break;case 10:for(;A<32;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}h.adler=t.check=r(T),A=T=0,t.mode=11;case 11:if(t.havedict===0)return h.next_out=J,h.avail_out=K,h.next_in=B,h.avail_in=z,t.hold=T,t.bits=A,2;h.adler=t.check=1,t.mode=12;case 12:if(D===5||D===6)break e;case 13:if(t.last){T>>>=7&A,A-=7&A,t.mode=27;break}for(;A<3;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}switch(t.last=1&T,A-=1,3&(T>>>=1)){case 0:t.mode=14;break;case 1:if(H(t),t.mode=20,D!==6)break;T>>>=2,A-=2;break e;case 2:t.mode=17;break;case 3:h.msg="invalid block type",t.mode=30}T>>>=2,A-=2;break;case 14:for(T>>>=7&A,A-=7&A;A<32;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if((65535&T)!=(T>>>16^65535)){h.msg="invalid stored block lengths",t.mode=30;break}if(t.length=65535&T,A=T=0,t.mode=15,D===6)break e;case 15:t.mode=16;case 16:if(G=t.length){if(z<G&&(G=z),K<G&&(G=K),G===0)break e;l.arraySet(X,L,B,G,J),z-=G,B+=G,K-=G,J+=G,t.length-=G;break}t.mode=12;break;case 17:for(;A<14;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(t.nlen=257+(31&T),T>>>=5,A-=5,t.ndist=1+(31&T),T>>>=5,A-=5,t.ncode=4+(15&T),T>>>=4,A-=4,286<t.nlen||30<t.ndist){h.msg="too many length or distance symbols",t.mode=30;break}t.have=0,t.mode=18;case 18:for(;t.have<t.ncode;){for(;A<3;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.lens[P[t.have++]]=7&T,T>>>=3,A-=3}for(;t.have<19;)t.lens[P[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,E={bits:t.lenbits},R=g(0,t.lens,0,19,t.lencode,0,t.work,E),t.lenbits=E.bits,R){h.msg="invalid code lengths set",t.mode=30;break}t.have=0,t.mode=19;case 19:for(;t.have<t.nlen+t.ndist;){for(;te=(i=t.lencode[T&(1<<t.lenbits)-1])>>>16&255,ie=65535&i,!((Q=i>>>24)<=A);){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(ie<16)T>>>=Q,A-=Q,t.lens[t.have++]=ie;else{if(ie===16){for(p=Q+2;A<p;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(T>>>=Q,A-=Q,t.have===0){h.msg="invalid bit length repeat",t.mode=30;break}e=t.lens[t.have-1],G=3+(3&T),T>>>=2,A-=2}else if(ie===17){for(p=Q+3;A<p;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}A-=Q,e=0,G=3+(7&(T>>>=Q)),T>>>=3,A-=3}else{for(p=Q+7;A<p;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}A-=Q,e=0,G=11+(127&(T>>>=Q)),T>>>=7,A-=7}if(t.have+G>t.nlen+t.ndist){h.msg="invalid bit length repeat",t.mode=30;break}for(;G--;)t.lens[t.have++]=e}}if(t.mode===30)break;if(t.lens[256]===0){h.msg="invalid code -- missing end-of-block",t.mode=30;break}if(t.lenbits=9,E={bits:t.lenbits},R=g(y,t.lens,0,t.nlen,t.lencode,0,t.work,E),t.lenbits=E.bits,R){h.msg="invalid literal/lengths set",t.mode=30;break}if(t.distbits=6,t.distcode=t.distdyn,E={bits:t.distbits},R=g(f,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,E),t.distbits=E.bits,R){h.msg="invalid distances set",t.mode=30;break}if(t.mode=20,D===6)break e;case 20:t.mode=21;case 21:if(6<=z&&258<=K){h.next_out=J,h.avail_out=K,h.next_in=B,h.avail_in=z,t.hold=T,t.bits=A,d(h,W),J=h.next_out,X=h.output,K=h.avail_out,B=h.next_in,L=h.input,z=h.avail_in,T=t.hold,A=t.bits,t.mode===12&&(t.back=-1);break}for(t.back=0;te=(i=t.lencode[T&(1<<t.lenbits)-1])>>>16&255,ie=65535&i,!((Q=i>>>24)<=A);){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(te&&(240&te)==0){for(se=Q,pe=te,ce=ie;te=(i=t.lencode[ce+((T&(1<<se+pe)-1)>>se)])>>>16&255,ie=65535&i,!(se+(Q=i>>>24)<=A);){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}T>>>=se,A-=se,t.back+=se}if(T>>>=Q,A-=Q,t.back+=Q,t.length=ie,te===0){t.mode=26;break}if(32&te){t.back=-1,t.mode=12;break}if(64&te){h.msg="invalid literal/length code",t.mode=30;break}t.extra=15&te,t.mode=22;case 22:if(t.extra){for(p=t.extra;A<p;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.length+=T&(1<<t.extra)-1,T>>>=t.extra,A-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=23;case 23:for(;te=(i=t.distcode[T&(1<<t.distbits)-1])>>>16&255,ie=65535&i,!((Q=i>>>24)<=A);){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if((240&te)==0){for(se=Q,pe=te,ce=ie;te=(i=t.distcode[ce+((T&(1<<se+pe)-1)>>se)])>>>16&255,ie=65535&i,!(se+(Q=i>>>24)<=A);){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}T>>>=se,A-=se,t.back+=se}if(T>>>=Q,A-=Q,t.back+=Q,64&te){h.msg="invalid distance code",t.mode=30;break}t.offset=ie,t.extra=15&te,t.mode=24;case 24:if(t.extra){for(p=t.extra;A<p;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}t.offset+=T&(1<<t.extra)-1,T>>>=t.extra,A-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){h.msg="invalid distance too far back",t.mode=30;break}t.mode=25;case 25:if(K===0)break e;if(G=W-K,t.offset>G){if((G=t.offset-G)>t.whave&&t.sane){h.msg="invalid distance too far back",t.mode=30;break}ae=G>t.wnext?(G-=t.wnext,t.wsize-G):t.wnext-G,G>t.length&&(G=t.length),le=t.window}else le=X,ae=J-t.offset,G=t.length;for(K<G&&(G=K),K-=G,t.length-=G;X[J++]=le[ae++],--G;);t.length===0&&(t.mode=21);break;case 26:if(K===0)break e;X[J++]=t.length,K--,t.mode=21;break;case 27:if(t.wrap){for(;A<32;){if(z===0)break e;z--,T|=L[B++]<<A,A+=8}if(W-=K,h.total_out+=W,t.total+=W,W&&(h.adler=t.check=t.flags?a(t.check,X,W,J-W):o(t.check,X,W,J-W)),W=K,(t.flags?T:r(T))!==t.check){h.msg="incorrect data check",t.mode=30;break}A=T=0}t.mode=28;case 28:if(t.wrap&&t.flags){for(;A<32;){if(z===0)break e;z--,T+=L[B++]<<A,A+=8}if(T!==(4294967295&t.total)){h.msg="incorrect length check",t.mode=30;break}A=T=0}t.mode=29;case 29:R=1;break e;case 30:R=-3;break e;case 31:return-4;case 32:default:return s}return h.next_out=J,h.avail_out=K,h.next_in=B,h.avail_in=z,t.hold=T,t.bits=A,(t.wsize||W!==h.avail_out&&t.mode<30&&(t.mode<27||D!==4))&&V(h,h.output,h.next_out,W-h.avail_out)?(t.mode=31,-4):($-=h.avail_in,W-=h.avail_out,h.total_in+=$,h.total_out+=W,t.total+=W,t.wrap&&W&&(h.adler=t.check=t.flags?a(t.check,X,W,h.next_out-W):o(t.check,X,W,h.next_out-W)),h.data_type=t.bits+(t.last?64:0)+(t.mode===12?128:0)+(t.mode===20||t.mode===15?256:0),($==0&&W===0||D===4)&&R===b&&(R=-5),R)},w.inflateEnd=function(h){if(!h||!h.state)return s;var D=h.state;return D.window&&(D.window=null),h.state=null,b},w.inflateGetHeader=function(h,D){var t;return h&&h.state?(2&(t=h.state).wrap)==0?s:((t.head=D).done=!1,b):s},w.inflateSetDictionary=function(h,D){var t,L=D.length;return h&&h.state?(t=h.state).wrap!==0&&t.mode!==11?s:t.mode===11&&o(1,D,L,0)!==t.check?-3:V(h,D,L,L)?(t.mode=31,-4):(t.havedict=1,b):s},w.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(v,F,w){var l=v("../utils/common"),o=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],a=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],d=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],g=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];F.exports=function(y,f,b,s,u,n,c,r){var m,x,_,N,M,C,U,I,H,V=r.bits,h=0,D=0,t=0,L=0,X=0,B=0,J=0,z=0,K=0,T=0,A=null,$=0,W=new l.Buf16(16),G=new l.Buf16(16),ae=null,le=0;for(h=0;h<=15;h++)W[h]=0;for(D=0;D<s;D++)W[f[b+D]]++;for(X=V,L=15;1<=L&&W[L]===0;L--);if(L<X&&(X=L),L===0)return u[n++]=20971520,u[n++]=20971520,r.bits=1,0;for(t=1;t<L&&W[t]===0;t++);for(X<t&&(X=t),h=z=1;h<=15;h++)if(z<<=1,(z-=W[h])<0)return-1;if(0<z&&(y===0||L!==1))return-1;for(G[1]=0,h=1;h<15;h++)G[h+1]=G[h]+W[h];for(D=0;D<s;D++)f[b+D]!==0&&(c[G[f[b+D]]++]=D);if(C=y===0?(A=ae=c,19):y===1?(A=o,$-=257,ae=a,le-=257,256):(A=d,ae=g,-1),h=t,M=n,J=D=T=0,_=-1,N=(K=1<<(B=X))-1,y===1&&852<K||y===2&&592<K)return 1;for(;;){for(U=h-J,H=c[D]<C?(I=0,c[D]):c[D]>C?(I=ae[le+c[D]],A[$+c[D]]):(I=96,0),m=1<<h-J,t=x=1<<B;u[M+(T>>J)+(x-=m)]=U<<24|I<<16|H|0,x!==0;);for(m=1<<h-1;T&m;)m>>=1;if(m!==0?(T&=m-1,T+=m):T=0,D++,--W[h]==0){if(h===L)break;h=f[b+c[D]]}if(X<h&&(T&N)!==_){for(J===0&&(J=X),M+=t,z=1<<(B=h-J);B+J<L&&!((z-=W[B+J])<=0);)B++,z<<=1;if(K+=1<<B,y===1&&852<K||y===2&&592<K)return 1;u[_=T&N]=X<<24|B<<16|M-n|0}}return T!==0&&(u[M+T]=h-J<<24|64<<16|0),r.bits=X,0}},{"../utils/common":41}],51:[function(v,F,w){F.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(v,F,w){var l=v("../utils/common"),o=0,a=1;function d(i){for(var k=i.length;0<=--k;)i[k]=0}var g=0,y=29,f=256,b=f+1+y,s=30,u=19,n=2*b+1,c=15,r=16,m=7,x=256,_=16,N=17,M=18,C=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],U=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],I=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],H=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],V=new Array(2*(b+2));d(V);var h=new Array(2*s);d(h);var D=new Array(512);d(D);var t=new Array(256);d(t);var L=new Array(y);d(L);var X,B,J,z=new Array(s);function K(i,k,P,O,S){this.static_tree=i,this.extra_bits=k,this.extra_base=P,this.elems=O,this.max_length=S,this.has_stree=i&&i.length}function T(i,k){this.dyn_tree=i,this.max_code=0,this.stat_desc=k}function A(i){return i<256?D[i]:D[256+(i>>>7)]}function $(i,k){i.pending_buf[i.pending++]=255&k,i.pending_buf[i.pending++]=k>>>8&255}function W(i,k,P){i.bi_valid>r-P?(i.bi_buf|=k<<i.bi_valid&65535,$(i,i.bi_buf),i.bi_buf=k>>r-i.bi_valid,i.bi_valid+=P-r):(i.bi_buf|=k<<i.bi_valid&65535,i.bi_valid+=P)}function G(i,k,P){W(i,P[2*k],P[2*k+1])}function ae(i,k){for(var P=0;P|=1&i,i>>>=1,P<<=1,0<--k;);return P>>>1}function le(i,k,P){var O,S,j=new Array(c+1),Y=0;for(O=1;O<=c;O++)j[O]=Y=Y+P[O-1]<<1;for(S=0;S<=k;S++){var q=i[2*S+1];q!==0&&(i[2*S]=ae(j[q]++,q))}}function Q(i){var k;for(k=0;k<b;k++)i.dyn_ltree[2*k]=0;for(k=0;k<s;k++)i.dyn_dtree[2*k]=0;for(k=0;k<u;k++)i.bl_tree[2*k]=0;i.dyn_ltree[2*x]=1,i.opt_len=i.static_len=0,i.last_lit=i.matches=0}function te(i){8<i.bi_valid?$(i,i.bi_buf):0<i.bi_valid&&(i.pending_buf[i.pending++]=i.bi_buf),i.bi_buf=0,i.bi_valid=0}function ie(i,k,P,O){var S=2*k,j=2*P;return i[S]<i[j]||i[S]===i[j]&&O[k]<=O[P]}function se(i,k,P){for(var O=i.heap[P],S=P<<1;S<=i.heap_len&&(S<i.heap_len&&ie(k,i.heap[S+1],i.heap[S],i.depth)&&S++,!ie(k,O,i.heap[S],i.depth));)i.heap[P]=i.heap[S],P=S,S<<=1;i.heap[P]=O}function pe(i,k,P){var O,S,j,Y,q=0;if(i.last_lit!==0)for(;O=i.pending_buf[i.d_buf+2*q]<<8|i.pending_buf[i.d_buf+2*q+1],S=i.pending_buf[i.l_buf+q],q++,O===0?G(i,S,k):(G(i,(j=t[S])+f+1,k),(Y=C[j])!==0&&W(i,S-=L[j],Y),G(i,j=A(--O),P),(Y=U[j])!==0&&W(i,O-=z[j],Y)),q<i.last_lit;);G(i,x,k)}function ce(i,k){var P,O,S,j=k.dyn_tree,Y=k.stat_desc.static_tree,q=k.stat_desc.has_stree,Z=k.stat_desc.elems,ne=-1;for(i.heap_len=0,i.heap_max=n,P=0;P<Z;P++)j[2*P]!==0?(i.heap[++i.heap_len]=ne=P,i.depth[P]=0):j[2*P+1]=0;for(;i.heap_len<2;)j[2*(S=i.heap[++i.heap_len]=ne<2?++ne:0)]=1,i.depth[S]=0,i.opt_len--,q&&(i.static_len-=Y[2*S+1]);for(k.max_code=ne,P=i.heap_len>>1;1<=P;P--)se(i,j,P);for(S=Z;P=i.heap[1],i.heap[1]=i.heap[i.heap_len--],se(i,j,1),O=i.heap[1],i.heap[--i.heap_max]=P,i.heap[--i.heap_max]=O,j[2*S]=j[2*P]+j[2*O],i.depth[S]=(i.depth[P]>=i.depth[O]?i.depth[P]:i.depth[O])+1,j[2*P+1]=j[2*O+1]=S,i.heap[1]=S++,se(i,j,1),2<=i.heap_len;);i.heap[--i.heap_max]=i.heap[1],(function(ee,de){var he,ue,ge,re,ve,we,me=de.dyn_tree,Se=de.max_code,Ee=de.stat_desc.static_tree,Ie=de.stat_desc.has_stree,Ce=de.stat_desc.extra_bits,Ae=de.stat_desc.extra_base,be=de.stat_desc.max_length,xe=0;for(re=0;re<=c;re++)ee.bl_count[re]=0;for(me[2*ee.heap[ee.heap_max]+1]=0,he=ee.heap_max+1;he<n;he++)be<(re=me[2*me[2*(ue=ee.heap[he])+1]+1]+1)&&(re=be,xe++),me[2*ue+1]=re,Se<ue||(ee.bl_count[re]++,ve=0,Ae<=ue&&(ve=Ce[ue-Ae]),we=me[2*ue],ee.opt_len+=we*(re+ve),Ie&&(ee.static_len+=we*(Ee[2*ue+1]+ve)));if(xe!==0){do{for(re=be-1;ee.bl_count[re]===0;)re--;ee.bl_count[re]--,ee.bl_count[re+1]+=2,ee.bl_count[be]--,xe-=2}while(0<xe);for(re=be;re!==0;re--)for(ue=ee.bl_count[re];ue!==0;)Se<(ge=ee.heap[--he])||(me[2*ge+1]!==re&&(ee.opt_len+=(re-me[2*ge+1])*me[2*ge],me[2*ge+1]=re),ue--)}})(i,k),le(j,ne,i.bl_count)}function e(i,k,P){var O,S,j=-1,Y=k[1],q=0,Z=7,ne=4;for(Y===0&&(Z=138,ne=3),k[2*(P+1)+1]=65535,O=0;O<=P;O++)S=Y,Y=k[2*(O+1)+1],++q<Z&&S===Y||(q<ne?i.bl_tree[2*S]+=q:S!==0?(S!==j&&i.bl_tree[2*S]++,i.bl_tree[2*_]++):q<=10?i.bl_tree[2*N]++:i.bl_tree[2*M]++,j=S,ne=(q=0)===Y?(Z=138,3):S===Y?(Z=6,3):(Z=7,4))}function R(i,k,P){var O,S,j=-1,Y=k[1],q=0,Z=7,ne=4;for(Y===0&&(Z=138,ne=3),O=0;O<=P;O++)if(S=Y,Y=k[2*(O+1)+1],!(++q<Z&&S===Y)){if(q<ne)for(;G(i,S,i.bl_tree),--q!=0;);else S!==0?(S!==j&&(G(i,S,i.bl_tree),q--),G(i,_,i.bl_tree),W(i,q-3,2)):q<=10?(G(i,N,i.bl_tree),W(i,q-3,3)):(G(i,M,i.bl_tree),W(i,q-11,7));j=S,ne=(q=0)===Y?(Z=138,3):S===Y?(Z=6,3):(Z=7,4)}}d(z);var E=!1;function p(i,k,P,O){W(i,(g<<1)+(O?1:0),3),(function(S,j,Y,q){te(S),$(S,Y),$(S,~Y),l.arraySet(S.pending_buf,S.window,j,Y,S.pending),S.pending+=Y})(i,k,P)}w._tr_init=function(i){E||((function(){var k,P,O,S,j,Y=new Array(c+1);for(S=O=0;S<y-1;S++)for(L[S]=O,k=0;k<1<<C[S];k++)t[O++]=S;for(t[O-1]=S,S=j=0;S<16;S++)for(z[S]=j,k=0;k<1<<U[S];k++)D[j++]=S;for(j>>=7;S<s;S++)for(z[S]=j<<7,k=0;k<1<<U[S]-7;k++)D[256+j++]=S;for(P=0;P<=c;P++)Y[P]=0;for(k=0;k<=143;)V[2*k+1]=8,k++,Y[8]++;for(;k<=255;)V[2*k+1]=9,k++,Y[9]++;for(;k<=279;)V[2*k+1]=7,k++,Y[7]++;for(;k<=287;)V[2*k+1]=8,k++,Y[8]++;for(le(V,b+1,Y),k=0;k<s;k++)h[2*k+1]=5,h[2*k]=ae(k,5);X=new K(V,C,f+1,b,c),B=new K(h,U,0,s,c),J=new K(new Array(0),I,0,u,m)})(),E=!0),i.l_desc=new T(i.dyn_ltree,X),i.d_desc=new T(i.dyn_dtree,B),i.bl_desc=new T(i.bl_tree,J),i.bi_buf=0,i.bi_valid=0,Q(i)},w._tr_stored_block=p,w._tr_flush_block=function(i,k,P,O){var S,j,Y=0;0<i.level?(i.strm.data_type===2&&(i.strm.data_type=(function(q){var Z,ne=4093624447;for(Z=0;Z<=31;Z++,ne>>>=1)if(1&ne&&q.dyn_ltree[2*Z]!==0)return o;if(q.dyn_ltree[18]!==0||q.dyn_ltree[20]!==0||q.dyn_ltree[26]!==0)return a;for(Z=32;Z<f;Z++)if(q.dyn_ltree[2*Z]!==0)return a;return o})(i)),ce(i,i.l_desc),ce(i,i.d_desc),Y=(function(q){var Z;for(e(q,q.dyn_ltree,q.l_desc.max_code),e(q,q.dyn_dtree,q.d_desc.max_code),ce(q,q.bl_desc),Z=u-1;3<=Z&&q.bl_tree[2*H[Z]+1]===0;Z--);return q.opt_len+=3*(Z+1)+5+5+4,Z})(i),S=i.opt_len+3+7>>>3,(j=i.static_len+3+7>>>3)<=S&&(S=j)):S=j=P+5,P+4<=S&&k!==-1?p(i,k,P,O):i.strategy===4||j===S?(W(i,2+(O?1:0),3),pe(i,V,h)):(W(i,4+(O?1:0),3),(function(q,Z,ne,ee){var de;for(W(q,Z-257,5),W(q,ne-1,5),W(q,ee-4,4),de=0;de<ee;de++)W(q,q.bl_tree[2*H[de]+1],3);R(q,q.dyn_ltree,Z-1),R(q,q.dyn_dtree,ne-1)})(i,i.l_desc.max_code+1,i.d_desc.max_code+1,Y+1),pe(i,i.dyn_ltree,i.dyn_dtree)),Q(i),O&&te(i)},w._tr_tally=function(i,k,P){return i.pending_buf[i.d_buf+2*i.last_lit]=k>>>8&255,i.pending_buf[i.d_buf+2*i.last_lit+1]=255&k,i.pending_buf[i.l_buf+i.last_lit]=255&P,i.last_lit++,k===0?i.dyn_ltree[2*P]++:(i.matches++,k--,i.dyn_ltree[2*(t[P]+f+1)]++,i.dyn_dtree[2*A(k)]++),i.last_lit===i.lit_bufsize-1},w._tr_align=function(i){W(i,2,3),G(i,x,V),(function(k){k.bi_valid===16?($(k,k.bi_buf),k.bi_buf=0,k.bi_valid=0):8<=k.bi_valid&&(k.pending_buf[k.pending++]=255&k.bi_buf,k.bi_buf>>=8,k.bi_valid-=8)})(i)}},{"../utils/common":41}],53:[function(v,F,w){F.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(v,F,w){(function(l){(function(o,a){if(!o.setImmediate){var d,g,y,f,b=1,s={},u=!1,n=o.document,c=Object.getPrototypeOf&&Object.getPrototypeOf(o);c=c&&c.setTimeout?c:o,d={}.toString.call(o.process)==="[object process]"?function(_){process.nextTick(function(){m(_)})}:(function(){if(o.postMessage&&!o.importScripts){var _=!0,N=o.onmessage;return o.onmessage=function(){_=!1},o.postMessage("","*"),o.onmessage=N,_}})()?(f="setImmediate$"+Math.random()+"$",o.addEventListener?o.addEventListener("message",x,!1):o.attachEvent("onmessage",x),function(_){o.postMessage(f+_,"*")}):o.MessageChannel?((y=new MessageChannel).port1.onmessage=function(_){m(_.data)},function(_){y.port2.postMessage(_)}):n&&"onreadystatechange"in n.createElement("script")?(g=n.documentElement,function(_){var N=n.createElement("script");N.onreadystatechange=function(){m(_),N.onreadystatechange=null,g.removeChild(N),N=null},g.appendChild(N)}):function(_){setTimeout(m,0,_)},c.setImmediate=function(_){typeof _!="function"&&(_=new Function(""+_));for(var N=new Array(arguments.length-1),M=0;M<N.length;M++)N[M]=arguments[M+1];var C={callback:_,args:N};return s[b]=C,d(b),b++},c.clearImmediate=r}function r(_){delete s[_]}function m(_){if(u)setTimeout(m,0,_);else{var N=s[_];if(N){u=!0;try{(function(M){var C=M.callback,U=M.args;switch(U.length){case 0:C();break;case 1:C(U[0]);break;case 2:C(U[0],U[1]);break;case 3:C(U[0],U[1],U[2]);break;default:C.apply(a,U)}})(N)}finally{r(_),u=!1}}}}function x(_){_.source===o&&typeof _.data=="string"&&_.data.indexOf(f)===0&&m(+_.data.slice(f.length))}})(typeof self>"u"?l===void 0?this:l:self)}).call(this,typeof ye<"u"?ye:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Ne)),Ne.exports}var dt=lt();const ct=De(dt),_e=Object.assign({".env.example":Re,"/README.md":Le,"/db/schema.sql":Me,"/index.html":Pe,"/package.json":Oe,"/src/App.tsx":Fe,"/src/components/ApplicationForm.tsx":Be,"/src/components/Footer.tsx":Ue,"/src/components/Header.tsx":ze,"/src/components/ui.tsx":je,"/src/context/AppContext.tsx":He,"/src/index.css":qe,"/src/lib/api.ts":Ge,"/src/lib/crypto.ts":We,"/src/lib/db.ts":Ye,"/src/lib/validation.ts":Ze,"/src/main.tsx":$e,"/src/pages/Apply.tsx":Ve,"/src/pages/Community.tsx":Ke,"/src/pages/Department.tsx":Xe,"/src/pages/Download.tsx":Je,"/src/pages/Esports.tsx":Qe,"/src/pages/Home.tsx":et,"/src/pages/admin/AdminDashboard.tsx":tt,"/src/pages/admin/AdminLogin.tsx":nt,"/src/pages/admin/AdminSections.tsx":at,"/src/pages/admin/ContentManager.tsx":st,"/src/vite-env.d.ts":rt,"/tsconfig.json":it,"/vite.config.js":ot});function ut(){return Object.entries(_e).map(([oe,fe])=>({path:oe.replace(/^\//,""),size:new TextEncoder().encode(fe).length})).sort((oe,fe)=>oe.path.localeCompare(fe.path))}function mt(oe){return oe<1024?`${oe} B`:oe<1024*1024?`${(oe/1024).toFixed(1)} KB`:`${(oe/(1024*1024)).toFixed(2)} MB`}async function ft(){const oe=new ct,fe=oe.folder("fursan-community");fe.file("EXPORT-NOTES.txt",["FURSAN COMMUNITY — full project source","=======================================","","Everything in this archive is the live project source.","","Quick start:","  1. npm install","  2. copy .env.example to .env and adjust credentials","  3. npm run dev   (development)","     npm run build (production)","","Admin defaults: admin / fursan2020 — change after first login","(Admin → Settings → Change Admin Password).","","Database schema + first migration: db/schema.sql (PostgreSQL).","See README.md for full deployment & Discord bot instructions.","","Notes:","- package-lock.json and node_modules are excluded — regenerate","  them with `npm install`.","- Brand images are referenced by URL in src/lib/db.ts; replace","  them any time via Admin → Image Manager (transparent PNGs","  render natively).",""].join(`
`));for(const[o,a]of Object.entries(_e))fe.file(o.replace(/^\//,""),a);const v=await oe.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:9}}),F="fursan-community-source.zip",w=URL.createObjectURL(v),l=document.createElement("a");return l.href=w,l.download=F,document.body.appendChild(l),l.click(),l.remove(),setTimeout(()=>URL.revokeObjectURL(w),4e3),{files:Object.keys(_e).length+1,name:F}}export{ft as d,mt as f,ut as g};
