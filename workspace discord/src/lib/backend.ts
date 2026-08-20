import { createClient } from "@supabase/supabase-js";

/* ============================================================
   FURSAN COMMUNITY — swappable API layer (Supabase backend)
   All reads/writes go through this module. Swap the internals
   for a real REST API later without touching the UI.
   ============================================================ */

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  "https://cxaigbqsptxrqbuturge.supabase.co";
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ??
  "sb_publishable_sRjS23QjJxNMGTsI6cy4AQ_jE2ZPpq3";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  // PKCE flow returns ?code= (query) instead of hash tokens — safe with HashRouter
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const ENV = {
  adminDefaultUser: (import.meta.env.VITE_ADMIN_DEFAULT_USER as string | undefined) ?? "fursan",
  adminDefaultPass: (import.meta.env.VITE_ADMIN_DEFAULT_PASS as string | undefined) ?? "Fursan@2026",
  tokenPepper: (import.meta.env.VITE_TOKEN_PEPPER as string | undefined) ?? "fursan::knight::pepper::v1",
};

/* ---------------- shared types ---------------- */

export type ProgramStatus = "open" | "closed" | "temporary";
export type AppStatus = "pending" | "approved" | "rejected";

export interface Program {
  id: string;
  title: string;
  game: string;
  platform: string;
  description: string;
  status: ProgramStatus;
}

export interface Founder { id: string; name: string; tag: string; image?: string; }
export interface FeatureItem { id: string; title: string; desc: string; icon: string; }
export interface StaffMember {
  id: string; username: string; discord: string; role: string;
  department: string; permissions: string[];
}

export interface ApplicationData {
  fullName: string; discordUsername: string; discordId: string; age: string;
  country: string; platform: string; playerId: string; currentRank: string;
  peakRank: string; mainRole: string; previousTeams: string; compExperience: string;
  tournamentExperience: string; availability: string; whyFursan: string; additionalInfo: string;
}

export interface Application {
  id: string;
  ref: string;
  type: "esports";
  program: string;
  status: AppStatus;
  data: ApplicationData;
  notes: string;
  discord: { roleId?: string; lastError?: string; lastAttempt?: string; synced?: boolean };
  created_at: string;
  updated_at: string;
}

export interface RateBucket { count: number; reset: number; }

/* ---------------- crypto (works in any context) ---------------- */

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(data: Uint8Array): Uint8Array {
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const len = data.length;
  const withOne = new Uint8Array(((len + 8) >> 6 << 6) + 64);
  withOne.set(data);
  withOne[len] = 0x80;
  const dv = new DataView(withOne.buffer);
  dv.setUint32(withOne.length - 4, len << 3, false);
  const w = new Int32Array(64);
  for (let off = 0; off < withOne.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getInt32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  H.forEach((v, i) => ov.setInt32(i * 4, v, false));
  return out;
}

const te = new TextEncoder();
const bytesToHex = (b: Uint8Array) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
const b64encode = (b: Uint8Array) => {
  let s = "";
  b.forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s);
};
const b64decode = (s: string) => {
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

function deriveKey(secret: string, salt: Uint8Array, iterations: number): Uint8Array {
  let block: Uint8Array = new Uint8Array([...salt, ...te.encode(secret)]);
  for (let i = 0; i < iterations; i++) block = sha256(block);
  return block;
}

function keystream(key: Uint8Array, iv: Uint8Array, length: number): Uint8Array {
  const out: Uint8Array = new Uint8Array(length);
  let pos = 0, counter = 0;
  while (pos < length) {
    const cv = new Uint8Array([...iv, (counter >>> 24) & 255, (counter >>> 16) & 255, (counter >>> 8) & 255, counter & 255]);
    const block = sha256(new Uint8Array([...key, ...sha256(cv)]));
    const take = Math.min(32, length - pos);
    out.set(block.subarray(0, take), pos);
    pos += take;
    counter++;
  }
  return out;
}

const randomBytes = (n: number) => {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
};

/* ---------------- password hashing (salted, iterated SHA-256) ---------------- */

export function hashPassword(password: string, saltHex: string): string {
  const salt = b64decode(saltHex);
  return bytesToHex(deriveKey(password, salt, 12000));
}

export function newSalt(): string {
  return b64encode(randomBytes(16));
}

/* ---------------- Discord token encryption (AES-style keystream, at rest) ---------------- */

export interface TokenEnvelope { salt: string; iv: string; ct: string; }

export function encryptToken(token: string): TokenEnvelope {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(ENV.tokenPepper, salt, 6000);
  const ks = keystream(key, iv, token.length);
  const pt = te.encode(token);
  const ct = new Uint8Array(pt.length);
  pt.forEach((v, i) => (ct[i] = v ^ ks[i]));
  return { salt: b64encode(salt), iv: b64encode(iv), ct: b64encode(ct) };
}

export function decryptToken(env: TokenEnvelope): string {
  const key = deriveKey(ENV.tokenPepper, b64decode(env.salt), 6000);
  const ct = b64decode(env.ct);
  const ks = keystream(key, b64decode(env.iv), ct.length);
  const pt = new Uint8Array(ct.length);
  ct.forEach((v, i) => (pt[i] = v ^ ks[i]));
  return new TextDecoder().decode(pt);
}

export const maskToken = (ct?: string) => (ct ? `••••••••••••${ct.slice(-4)}` : "");

/* ---------------- sanitize / validate ---------------- */

export function sanitize(input: unknown, max = 2000): string {
  return String(input ?? "")
    .replace(/[<>`]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, max);
}

export const isValidDiscordId = (v: string) => /^\d{16,22}$/.test(v.trim());

export function validateApplication(d: ApplicationData): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.fullName.trim().length < 3) e.fullName = "Full name must be at least 3 characters.";
  if (d.discordUsername.trim().length < 2) e.discordUsername = "Discord username is required.";
  if (!isValidDiscordId(d.discordId)) e.discordId = "Discord User ID must be 16–22 digits (Developer Mode → Copy User ID).";
  const age = Number(d.age);
  if (!d.age || Number.isNaN(age) || age < 13 || age > 99) e.age = "Age must be between 13 and 99.";
  if (!d.country.trim()) e.country = "Country / timezone is required.";
  if (!d.platform.trim()) e.platform = "Platform is required.";
  if (!d.playerId.trim()) e.playerId = "In-game ID is required.";
  if (!d.currentRank.trim()) e.currentRank = "Current rank is required.";
  if (!d.peakRank.trim()) e.peakRank = "Peak rank is required.";
  if (!d.mainRole.trim()) e.mainRole = "Main role / agents required.";
  if (d.compExperience.trim().length < 10) e.compExperience = "Describe your competitive experience (min 10 chars).";
  if (!d.availability.trim()) e.availability = "Availability is required.";
  if (d.whyFursan.trim().length < 20) e.whyFursan = "Tell us why FURSAN — at least 20 characters.";
  return e;
}

/* ---------------- rate limiting (shared via site_state) ---------------- */

export function checkRate(
  buckets: Record<string, RateBucket>,
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryInSec: number; next: Record<string, RateBucket> } {
  const now = Date.now();
  const bucket = buckets[key];
  let count = 0;
  let reset = now + windowMs;
  if (bucket && bucket.reset > now) count = bucket.count;
  else reset = now + windowMs;
  if (count >= max) {
    return { ok: false, retryInSec: Math.ceil((bucket.reset - now) / 1000), next: buckets };
  }
  return { ok: true, retryInSec: 0, next: { ...buckets, [key]: { count: count + 1, reset } } };
}

/* ---------------- site state ---------------- */

type Json = Record<string, unknown>;

export function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(patch) || patch === null || typeof patch !== "object") {
    return (patch === undefined ? base : patch) as T;
  }
  const out: Json = { ...(base as unknown as Json) };
  for (const [k, v] of Object.entries(patch as Json)) {
    out[k] = deepMerge((base as unknown as Json)?.[k], v);
  }
  return out as unknown as T;
}

export type StateReadResult =
  | { ok: true; state: Json | null }
  | { ok: false; message: string };

/**
 * Cache-buster: Supabase's Data API edge can cache identical GET URLs, which makes
 * reads return a stale row for minutes after a write (the "changes appear after
 * ~10 min on reload" bug). We add an always-true filter with a random value so
 * every read has a unique URL → it can never be served from cache.
 */
export const cacheNonce = () =>
  `nc${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Strict read — distinguishes "row missing" (ok, null) from "read failed" (not ok). */
export async function readSiteStateStrict(): Promise<StateReadResult> {
  try {
    const { data, error } = await supabase
      .from("site_state")
      .select("state")
      .eq("id", "default")
      .neq("id", cacheNonce())
      .maybeSingle();
    if (error) return { ok: false, message: error.message };
    return { ok: true, state: (data?.state as Json) ?? null };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** Lenient read — null on any failure (used by rate-limits & seeding). */
export async function fetchSiteState(): Promise<Json | null> {
  const res = await readSiteStateStrict();
  if (!res.ok) {
    console.warn("[fursan] site_state read failed:", res.message);
    return null;
  }
  return res.state;
}

export async function saveSiteState(patch: Json): Promise<Json> {
  // CRITICAL: read the current row first. If the read FAILS we must abort —
  // merging against {} would overwrite the whole row with just this patch
  // and wipe every other setting (the "resets after reload" bug).
  const read = await readSiteStateStrict();
  if (!read.ok) {
    throw new Error(
      `Save aborted to protect existing content — the database could not be read first (${read.message}). Please try again in a few seconds.`
    );
  }
  const merged = deepMerge(read.state ?? {}, patch);
  const { error } = await supabase
    .from("site_state")
    .upsert({ id: "default", state: merged, updated_at: new Date().toISOString() });
  if (error) {
    const hint = /size|length|limit|payload|large/i.test(error.message)
      ? " The site state may be too large — upload smaller/compressed images (≤ 1.5 MB each)."
      : " Verify the database migration was run — README → Database setup. (Table Editor should show a `site_state` table with a `default` row.)";
    throw new Error(`${error.message}.${hint}`);
  }
  return merged;
}

/* ---------------- admin accounts ---------------- */

export interface AdminAccount { username: string; salt: string; hash: string; }

export async function ensureSeedAdmin(): Promise<void> {
  const current = (await fetchSiteState()) ?? {};
  const admins = (current.admins as AdminAccount[]) ?? [];
  if (admins.length > 0) return;
  const salt = newSalt();
  const admin: AdminAccount = {
    username: ENV.adminDefaultUser,
    salt,
    hash: hashPassword(ENV.adminDefaultPass, salt),
  };
  await saveSiteState({ admins: [admin] });
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ ok: true; username: string } | { ok: false; message: string }> {
  const uname = username.trim().toLowerCase();
  const state = (await fetchSiteState()) ?? {};
  const buckets = ((state.rateLimits as Record<string, RateBucket>) ?? {});
  const key = `login:${uname}`;
  const rl = checkRate(buckets, key, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(rl.retryInSec / 60)} min.` };
  }
  const admins = ((state.admins as AdminAccount[]) ?? []);
  const account = admins.find((a) => a.username.toLowerCase() === uname);
  const valid = account && hashPassword(password, account.salt) === account.hash;
  if (!valid) {
    await saveSiteState({ rateLimits: rl.next });
    return { ok: false, message: "Invalid credentials. Failed attempts are rate-limited." };
  }
  return { ok: true, username: account.username };
}

export async function changeAdminPassword(
  username: string,
  current: string,
  next: string
): Promise<{ ok: boolean; message: string }> {
  if (next.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
  const state = (await fetchSiteState()) ?? {};
  const admins = ((state.admins as AdminAccount[]) ?? []).map((a) => ({ ...a }));
  const account = admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
  if (!account) return { ok: false, message: "Account not found." };
  if (hashPassword(current, account.salt) !== account.hash) {
    return { ok: false, message: "Current password is incorrect." };
  }
  account.salt = newSalt();
  account.hash = hashPassword(next, account.salt);
  await saveSiteState({ admins });
  return { ok: true, message: "Password updated." };
}

/* ---------------- applications (esports only) ---------------- */

const makeRef = () =>
  `FUR-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;

export async function submitApplication(
  program: string,
  raw: ApplicationData
): Promise<{ ok: true; ref: string } | { ok: false; message: string }> {
  const errors = validateApplication(raw);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: Object.values(errors)[0] };
  }
  const state = (await fetchSiteState()) ?? {};
  let buckets = (state.rateLimits as Record<string, RateBucket>) ?? {};
  const per = checkRate(buckets, `app:${program}`, 3, 10 * 60 * 1000);
  if (!per.ok) return { ok: false, message: `Submission limit reached for this program. Retry in ${Math.ceil(per.retryInSec / 60)} min.` };
  buckets = per.next;
  const global = checkRate(buckets, "app:global", 10, 30 * 60 * 1000);
  if (!global.ok) return { ok: false, message: `Too many submissions. Retry in ${Math.ceil(global.retryInSec / 60)} min.` };
  buckets = global.next;

  const data: ApplicationData = {
    fullName: sanitize(raw.fullName, 80),
    discordUsername: sanitize(raw.discordUsername, 60),
    discordId: sanitize(raw.discordId, 22),
    age: sanitize(raw.age, 3),
    country: sanitize(raw.country, 80),
    platform: sanitize(raw.platform, 60),
    playerId: sanitize(raw.playerId, 80),
    currentRank: sanitize(raw.currentRank, 60),
    peakRank: sanitize(raw.peakRank, 60),
    mainRole: sanitize(raw.mainRole, 120),
    previousTeams: sanitize(raw.previousTeams, 300),
    compExperience: sanitize(raw.compExperience, 1200),
    tournamentExperience: sanitize(raw.tournamentExperience, 1200),
    availability: sanitize(raw.availability, 300),
    whyFursan: sanitize(raw.whyFursan, 1600),
    additionalInfo: sanitize(raw.additionalInfo, 1200),
  };
  const row = {
    id: crypto.randomUUID(),
    ref: makeRef(),
    type: "esports",
    program,
    status: "pending",
    data,
    notes: "",
    discord: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("applications").insert(row);
  if (error) return { ok: false, message: "Database error — please try again shortly." };
  await saveSiteState({ rateLimits: buckets });
  return { ok: true, ref: row.ref };
}

export async function listApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .neq("id", cacheNonce()) // cache-bust: never serve a stale applications list
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[fursan] applications read failed:", error.message);
    return [];
  }
  return (data as Application[]) ?? [];
}

export async function updateApplication(id: string, patch: Partial<Application>): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------------- Discord API v10 ---------------- */

async function discordRequest(
  token: string,
  path: string,
  method = "GET",
  body?: unknown
): Promise<{ ok: boolean; status: number; message: string }> {
  try {
    const res = await fetch(`https://discord.com/api/v10${path}`, {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return { ok: true, status: res.status, message: "Discord confirmed." };
    let detail = `Discord responded ${res.status}.`;
    try {
      const j = await res.json();
      if (j?.message) detail = `Discord: ${j.message}`;
    } catch { /* non-json */ }
    return { ok: false, status: res.status, message: detail };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Discord could not be reached from this environment (network/CORS). The applicant was left unapproved for safety.",
    };
  }
}

export const testDiscordConnection = (token: string) => discordRequest(token, "/users/@me");

export const assignDiscordRole = (token: string, guildId: string, userId: string, roleId: string) =>
  discordRequest(token, `/guilds/${guildId}/members/${userId}/roles/${roleId}`, "PUT", {});

/* Opens a DM channel with the user, then posts the message. */
export async function sendDiscordDM(
  token: string,
  userId: string,
  content: string
): Promise<{ ok: boolean; status: number; message: string }> {
  try {
    const chRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: userId }),
    });
    if (!chRes.ok) {
      const detail = chRes.status === 403 || chRes.status === 400
        ? "The user does not accept DMs from this bot (or the ID is invalid)."
        : `Discord responded ${chRes.status} while opening the DM channel.`;
      return { ok: false, status: chRes.status, message: detail };
    }
    const ch = (await chRes.json()) as { id?: string };
    if (!ch.id) return { ok: false, status: 0, message: "Discord returned no DM channel id." };
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${ch.id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    });
    if (msgRes.ok) return { ok: true, status: msgRes.status, message: "DM delivered." };
    let detail = `Discord responded ${msgRes.status} while sending the DM.`;
    try {
      const j = await msgRes.json();
      if (j?.message) detail = `Discord: ${j.message}`;
    } catch { /* non-json */ }
    return { ok: false, status: msgRes.status, message: detail };
  } catch {
    return { ok: false, status: 0, message: "Discord could not be reached (network/CORS). DM not sent." };
  }
}

export interface TemplateVars { name: string; program: string; ref: string; discord: string; community: string; }

export const DM_PLACEHOLDERS: { key: string; label: string }[] = [
  { key: "{name}", label: "applicant full name" },
  { key: "{program}", label: "program title (e.g. VALORANT)" },
  { key: "{ref}", label: "application reference (FUR-2026-…)" },
  { key: "{discord}", label: "Discord username" },
  { key: "{community}", label: "community name" },
];

export function fillTemplate(template: string, vars: TemplateVars): string {
  const rep = (s: string, k: string, v: string) => s.split(k).join(v);
  let out = template;
  out = rep(out, "{name}", vars.name);
  out = rep(out, "{program}", vars.program);
  out = rep(out, "{ref}", vars.ref);
  out = rep(out, "{discord}", vars.discord);
  out = rep(out, "{community}", vars.community);
  return out;
}

/* ---------------- image upload ---------------- */

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only PNG, JPG, WebP or GIF files are allowed.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 1.5 MB or smaller.";
  return null;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

export const uid = () => crypto.randomUUID();
