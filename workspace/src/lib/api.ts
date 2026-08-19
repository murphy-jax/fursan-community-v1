/**
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
  const wait = hitRateLimit(d, `login:${uname.toLowerCase()}`, 5, 10 * 60 * 1000);
  if (wait > 0) throw new ApiError(`Too many failed attempts. Try again in ${wait}s.`, 429);
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
  return `FUR-${new Date().getFullYear()}-${n}`;
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

  const rlKey = `apply:${type}:${result.data.discordId}`;
  const wait = mutate((db) => hitRateLimit(db, rlKey, 3, 10 * 60 * 1000));
  if (wait > 0) throw new ApiError(`Rate limit: you can submit again in ${wait}s.`, 429);

  const game = type === "esports" ? games.find((g) => g.title === result.data.program) : undefined;
  if (type === "esports" && game && game.status !== "open") {
    throw new ApiError(`${game.title} recruitment is not open right now.`, 409);
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
      const hay = `${a.ref} ${a.data.fullName} ${a.data.discordUsername} ${a.data.discordId} ${a.program ?? ""}`.toLowerCase();
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
        throw new ApiError(`No Discord role is configured for “${app.program ?? app.type.toUpperCase()}”. Configure it in Discord Integration.`, 409);
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
        throw new ApiError(`Discord role assignment failed — application kept unapproved. ${res.message}`, 502);
      }
      mutate((db) => {
        const a = db.applications.find((x) => x.id === id);
        if (a) {
          a.status = "approved";
          a.discord = { roleId, assignedAt: new Date().toISOString(), lastError: undefined };
          a.updatedAt = new Date().toISOString();
        }
      });
      return { discord: `Role ${roleId} assigned via Discord API v10.` };
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

const DISCORD_API = (import.meta.env.VITE_DISCORD_API_BASE ?? "https://discord.com/api/v10").replace(/\/$/, "");

function mapDiscordFailure(status: number): string {
  switch (status) {
    case 401: return "Invalid bot token (401).";
    case 403: return "Forbidden (403). The bot needs the Manage Roles permission and its role must sit above the role being assigned.";
    case 404: return "Not found (404). Check the Guild ID, member's User ID and Role ID.";
    case 429: return "Discord rate limit hit (429). Try again shortly.";
    default: return `Discord API error (HTTP ${status}).`;
  }
}

async function discordRequest(method: string, path: string, token: string): Promise<{ ok: boolean; status: number; body?: unknown }> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    method,
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
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
      `Could not reach the Discord API (${msg}). Browsers may block cross-origin bot requests — set VITE_DISCORD_API_BASE to a server-side relay, or deploy the API layer server-side (see README).`,
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
  if (guildId && !/^\d{15,22}$/.test(guildId)) throw new ApiError("Guild ID must be 15–22 digits.", 422);
  const roles: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.roles)) roles[sanitize(k, 30)] = sanitize(v, 30);

  if (input.token && input.token.trim()) {
    const cleanToken = input.token.trim();
    if (!/^[\w-]{20,}\.[\w-]{4,}\.[\w-]{20,}$/.test(cleanToken)) {
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
    const res = await discordRequest("GET", d.guildId ? `/guilds/${d.guildId}` : "/users/@me", token);
    if (res.ok) {
      const name = (res.body as { name?: string; username?: string })?.name ?? (res.body as { username?: string })?.username ?? "connected";
      return { ok: true, message: d.guildId ? `Connected — guild “${name}” reachable.` : `Connected — bot authenticated as “${name}”.` };
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
    const res = await discordRequest("PUT", `/guilds/${guildId}/members/${userId}/roles/${roleId}`, token);
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
