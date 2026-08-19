/**
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
      "FURSAN started in 2020 as five friends grinding FIFA ladders from Casablanca to Oujda. The name means “knights” — and the idea was simple: play like one unit, win or lose.\n\nWhat began as scrims became rosters. Rosters became tournaments. Then came the FiveM server, where the same discipline found a new stage — medics who treat every call seriously, officers who police with a story in mind, and citizens who keep the city alive.\n\nToday FURSAN is a full organisation: four competitive programs, two roleplay departments, an events team and a staff structure that treats community work like a craft.",
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
      "San Andreas EMS keeps the city breathing. Our medics run realistic triage, hospital intake and inter-facility transport inside a serious RP framework. Every member passes the EMS Academy — medical knowledge, radio discipline and scene safety — before their first shift.\n\nWe do not chase call volume. We chase the moment a player says “that was the best medical RP I've had on this server.”",
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
      "The LSPD is the backbone of serious roleplay on the FURSAN server. Our officers train through a full academy — penal code basics, pursuit discipline, firearms safety and de-escalation — before pinning the badge.\n\nWe measure ourselves by the calls people remember: the traffic stop that ended in laughter, the pursuit that ended fairly, the standoff that ended with a story, not a respawn.",
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
