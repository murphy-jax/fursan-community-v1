import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  supabase, fetchSiteState, saveSiteState, ensureSeedAdmin, deepMerge,
} from "../lib/backend";
import type {
  Program, Founder, FeatureItem, StaffMember, RateBucket, TokenEnvelope, AdminAccount,
} from "../lib/backend";

/* ---------------- full site state shape ---------------- */

export interface SettingsState {
  communityName: string;
  discordInvite: string;
  memberCount: number;
  activePlayers: number;
  teams: number;
  tournamentsWon: number;
  serverOnline: boolean;
  socials: { youtube: string; twitch: string; instagram: string; twitter: string; tiktok: string; facebook: string };
  footerAbout: string;
  footerBuilt: string;
}

export interface ContentState {
  home: {
    eyebrow: string; title: string; tagline: string; description: string;
    exploreLabel: string; discordLabel: string; onlineLabel: string; offlineLabel: string;
    statsEyebrow: string; featuresEyebrow: string; featuresTitle: string;
    gamesEyebrow: string; gamesTitle: string; foundersEyebrow: string;
  };
  community: {
    eyebrow: string; title: string; desc: string;
    storyTitle: string; story: string[];
    missionTitle: string; mission: string;
    values: { title: string; desc: string }[];
    quote: string; quoteBy: string;
    featuresTitle: string; featuresSub: string;
    ctaTitle: string; ctaBody: string; ctaBtn: string;
  };
  esports: {
    eyebrow: string; title: string; desc: string;
    journeyTitle: string;
    journey: { step: string; desc: string }[];
    openNote: string; closedNote: string; temporaryNote: string;
  };
  foundersTitle: string;
  foundersSub: string;
}

export interface DiscordState {
  enabled: boolean;
  guildId: string;
  tokenEnc: TokenEnvelope | null;
  tokenSavedAt: string;
  roles: Record<string, string>;
  dmEnabled: boolean;
  dmTemplate: string;
  log: { at: string; ok: boolean; msg: string }[];
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  date: string;
  time: string;
  prize: number;
  currency: string;
  format: string;
  slots: number;
  registered: number;
  entry: string;
  status: "upcoming" | "live" | "completed";
  champion?: string;
  description: string;
}

export interface SiteState {
  version: number;
  settings: SettingsState;
  content: ContentState;
  programs: Program[];
  founders: Founder[];
  features: FeatureItem[];
  staff: StaffMember[];
  discord: DiscordState;
  images: Record<string, string>;
  tournaments: Tournament[];
  admins: AdminAccount[];
  rateLimits: Record<string, RateBucket>;
}

export const LOGO_URL = "https://image.qwenlm.ai/generated-images/4883dfc7-f883-41fa-a613-d59fef80a330/_result.png";
export const ARENA_URL = "https://image.qwenlm.ai/generated-images/9bf27d0f-bbb0-480e-acb5-a2ff64e88a4d/_result.png";

/* Per-game identity: accent color + key art + stat badges (players/teams/cups) */
export interface GameMeta {
  accent: string;
  art: string;
  players: string;
  teams: string;
  cups: string;
}
export const GAME_META: Record<string, GameMeta> = {
  fifa: {
    accent: "#34d399",
    art: "https://image.qwenlm.ai/generated-images/d7ee2d7e-27a4-4f15-b1ed-c60412e5dca4/_result.png",
    players: "5.8K", teams: "210", cups: "32",
  },
  efootball: {
    accent: "#22d3ee",
    art: "https://image.qwenlm.ai/generated-images/4a365b7d-b099-4330-baf3-9afca4878e84/_result.png",
    players: "3.1K", teams: "140", cups: "18",
  },
  valorant: {
    accent: "#ff4655",
    art: "https://image.qwenlm.ai/generated-images/07054c50-6372-4488-85bf-a2f3fbb24a01/_result.png",
    players: "4.2K", teams: "96", cups: "12",
  },
  csgo: {
    accent: "#fb923c",
    art: "https://image.qwenlm.ai/generated-images/2a0b4c23-08c4-49e2-a033-11ca89af4df8/_result.png",
    players: "4.5K", teams: "120", cups: "8",
  },
};
export const gameMeta = (id: string): GameMeta =>
  GAME_META[id] ?? { accent: "#e3b23c", art: ARENA_URL, players: "1K", teams: "40", cups: "4" };
export const GAME_ART: Record<string, string> = {
  fifa: "https://image.qwenlm.ai/generated-images/97ba0e8f-3823-4d71-86b2-2dea23b8c934/_result.png",
  efootball: "https://image.qwenlm.ai/generated-images/4a365b7d-b099-4330-baf3-9afca4878e84/_result.png",
  valorant: "https://image.qwenlm.ai/generated-images/07054c50-6372-4488-85bf-a2f3fbb24a01/_result.png",
  csgo: "https://image.qwenlm.ai/generated-images/2a0b4c23-08c4-49e2-a033-11ca89af4df8/_result.png",
};

/* ---------------- default content ---------------- */

const DEFAULT_STATE: SiteState = {
  version: 1,
  settings: {
    communityName: "FURSAN COMMUNITY",
    discordInvite: "https://discord.gg/fursan",
    memberCount: 1240,
    activePlayers: 380,
    teams: 6,
    tournamentsWon: 14,
    serverOnline: true,
    socials: {
      youtube: "https://youtube.com/@fursancommunity",
      twitch: "https://twitch.tv/fursancommunity",
      instagram: "https://instagram.com/fursancommunity",
      twitter: "https://x.com/fursanesports",
      tiktok: "https://tiktok.com/@fursancommunity",
      facebook: "https://facebook.com/fursancommunity",
    },
    footerAbout:
      "FURSAN (الفرسان — “The Knights”) is a Moroccan gaming & esports collective forged in 2020. We build competitors, run ladders and tournaments, and keep one of the most active Discord servers in the region.",
    footerBuilt: "BUILT FOR THE NEXT GENERATION",
  },
  content: {
    home: {
      eyebrow: "EST. 2020 · CASABLANCA — MOROCCO",
      title: "FURSAN COMMUNITY",
      tagline: "THE NEXT GENERATION OF GAMING & ESPORTS",
      description:
        "A brotherhood of Moroccan competitors. From EA FC ladders to Valorant scrims, FURSAN trains players, fields rosters and hosts the events that move the scene forward.",
      exploreLabel: "EXPLORE THE ARENA",
      discordLabel: "JOIN DISCORD",
      onlineLabel: "SERVER ONLINE",
      offlineLabel: "SERVER OFFLINE",
      statsEyebrow: "LIVE COMMUNITY METRICS",
      featuresEyebrow: "WHAT WE RUN",
      featuresTitle: "AN ECOSYSTEM BUILT TO COMPETE",
      gamesEyebrow: "ACTIVE PROGRAMS",
      gamesTitle: "CHOOSE YOUR BATTLEGROUND",
      foundersEyebrow: "THE FOUNDING COUNCIL",
    },
    community: {
      eyebrow: "THE COMMUNITY",
      title: "MORE THAN A SERVER. A STANDARD.",
      desc: "Since 2020, FURSAN has grown from a late-night FIFA crew into one of Morocco’s most disciplined gaming communities.",
      storyTitle: "OUR STORY",
      story: [
        "FURSAN started in 2020 with five friends, two controllers and a simple belief: Moroccan players deserved a serious home — a place where grinding ranked at 3AM meant something, and where talent from Casablanca to Agadir could be seen.",
        "What began as weekend FIFA tournaments in a voice channel became a full ecosystem: structured esports programs, weekly scrims, community cups with real stakes, and a staff team that treats the server like a sport organisation — because it is one.",
        "Today the knights ride across EA FC, eFootball, Valorant and Counter-Strike. The platforms change. The standard doesn’t: respect the game, respect the badge, and always show up ready.",
      ],
      missionTitle: "OUR MISSION",
      mission:
        "To turn raw Moroccan talent into recognised competitors — through structure, discipline and a community that never lets a player grind alone.",
      values: [
        { title: "RESPECT", desc: "Toxicity gets benched. We win with honour and lose without excuses — in scrims, ladders and chat." },
        { title: "DISCIPLINE", desc: "Rosters run on schedules, reviews and VODs. Showing up ready is a skill, and we train it like one." },
        { title: "BELONGING", desc: "From first-day members to council founders, everyone eats at the same table. The badge means family." },
        { title: "PROGRESS", desc: "Every season we level up: better events, better coaching, better pathways from community to competition." },
      ],
      quote: "الفرسان لا يتراجعون — Knights don’t retreat. We reload, regroup and ride again.",
      quoteBy: "THE FOUNDING COUNCIL",
      featuresTitle: "LIFE INSIDE FURSAN",
      featuresSub: "What members actually do here, every single week.",
      ctaTitle: "READY TO RIDE WITH THE KNIGHTS?",
      ctaBody: "The Discord is the heartbeat of FURSAN — announcements, scrims, LFG, memes and match nights. Pull up.",
      ctaBtn: "JOIN THE DISCORD",
    },
    esports: {
      eyebrow: "FURSAN ESPORTS",
      title: "WHERE KNIGHTS ARE FORGED",
      desc: "Four competitive programs. Real rosters, real scrims, real stakes. Check each program’s recruitment status and apply when the gates are open.",
      journeyTitle: "THE APPLICATION JOURNEY",
      journey: [
        { step: "APPLY", desc: "Submit the full application. Our staff reviews every single one — no bots, no shortcuts." },
        { step: "TRIAL", desc: "Shortlisted players enter a trial period: scrims, VOD review and attitude check." },
        { step: "INTEGRATE", desc: "Pass the trial and you join the program Discord, get your role and meet the squad." },
        { step: "REPRESENT", desc: "Wear the badge in ladders, cups and LANs. You are FURSAN now." },
      ],
      openNote: "Recruitment is OPEN — submit your application below.",
      closedNote: "Recruitment is CLOSED for this program right now. Stay tuned on Discord for the next window.",
      temporaryNote: "Recruitment is TEMPORARILY CLOSED while we finalise the current roster split.",
    },
    foundersTitle: "THE FOUNDING COUNCIL",
    foundersSub: "Five knights built the table everyone now sits at. Respect the architects.",
  },
  programs: [
    {
      id: "fifa",
      title: "EA SPORTS FC",
      game: "FIFA / EA FC",
      platform: "PlayStation · Xbox · PC",
      description:
        "The flagship program. 1v1 ladders, FUT Champs grind squads and LAN-ready competitors. FURSAN’s FC division has brought home more trophies than any other — and the standard stays ruthless.",
      status: "open",
    },
    {
      id: "efootball",
      title: "eFOOTBALL",
      game: "eFootball",
      platform: "PlayStation · PC · Mobile",
      description:
        "Konami’s arena, FURSAN’s rules. Weekly division matches, tactical reviews and a roster built for the eFootball Championship circuit across MENA.",
      status: "open",
    },
    {
      id: "valorant",
      title: "VALORANT",
      game: "Valorant",
      platform: "PC",
      description:
        "A five-stack with structure: IGL-calling scrims, agent pool standards and VOD nights. We field teams for VCT Challengers qualifiers and regional cups.",
      status: "temporary",
    },
    {
      id: "csgo",
      title: "COUNTER-STRIKE 2",
      game: "CS2",
      platform: "PC",
      description:
        "The classic. Utility lineups, anti-strat sessions and ESEA-style ladder play. The CS2 division rebuilds its core each split — watch Discord for the next call-up.",
      status: "closed",
    },
  ],
  founders: [
    { id: "jomali", name: "JOMALI", tag: "Founder · FURSAN Community" },
    { id: "ladrook", name: "LADROOK", tag: "Founder · FURSAN Community" },
    { id: "murphy", name: "MURPHY", tag: "Founder · FURSAN Community" },
    { id: "ogaming093", name: "OGAMING093", tag: "Founder · FURSAN Community" },
    { id: "ferda", name: "FERDA", tag: "Founder · FURSAN Community" },
  ],
  features: [
    { id: "competitive", icon: "crosshair", title: "COMPETITIVE GAMING", desc: "Ranked grind squads, weekly ladders and internal cups with real stakes — every game we touch gets a leaderboard." },
    { id: "teams", icon: "shield", title: "ESPORTS TEAMS", desc: "Curated rosters across four titles with coaches, analysts and a trial system that actually finds talent." },
    { id: "scrims", icon: "ladder", title: "SCRIMS & LADDERS", desc: "Booked scrims every night and seasonal ladders that feed directly into roster selection." },
    { id: "events", icon: "calendar", title: "COMMUNITY EVENTS", desc: "Tournaments, watch parties, game nights and charity streams — the calendar never sleeps." },
    { id: "staff", icon: "badge", title: "PROFESSIONAL STAFF", desc: "A trained staff team running moderation, events and player support like a real organisation." },
    { id: "discord", icon: "pulse", title: "ACTIVE DISCORD", desc: "The heartbeat of FURSAN: LFG channels, announcements, tickets and a community that answers." },
  ],
  staff: [
    { id: "s1", username: "JOMALI", discord: "jomali", role: "Head of Community", department: "Management", permissions: ["applications", "content", "staff", "discord", "settings"] },
    { id: "s2", username: "LADROOK", discord: "ladrook", role: "Esports Director", department: "Esports", permissions: ["applications", "content", "discord"] },
    { id: "s3", username: "MURPHY", discord: "murphy", role: "Events Lead", department: "Events", permissions: ["content", "applications"] },
    { id: "s4", username: "FERDA", discord: "ferda", role: "Head Moderator", department: "Moderation", permissions: ["staff", "settings"] },
  ],
  discord: {
    enabled: false,
    guildId: "",
    tokenEnc: null,
    tokenSavedAt: "",
    roles: { fifa: "", efootball: "", valorant: "", csgo: "" },
    dmEnabled: true,
    dmTemplate:
      "Welcome to the {community} knights, {name}!\n" +
      "Your {program} application ({ref}) has been APPROVED by the command team.\n" +
      "Your role is now active on our server. Check the announcements channel for your next steps and scrim schedule.\n" +
      "See you on the battlefield. Dima FURSAN!",
    log: [],
  },
  images: {
    logo: LOGO_URL,
    homeHero: ARENA_URL,
    communityHero: ARENA_URL,
    esportsHero: ARENA_URL,
    gameFifa: GAME_ART.fifa,
    gameEfootball: GAME_ART.efootball,
    gameValorant: GAME_ART.valorant,
    gameCsgo: GAME_ART.csgo,
  },
  tournaments: (() => {
    const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
    return [
      {
        id: "fursan-cup-vii", title: "FURSAN CUP VII", game: "fifa", date: inDays(9), time: "20:00",
        prize: 1500, currency: "MAD", format: "1v1 · Single Elimination", slots: 64, registered: 51, entry: "Free — members only",
        status: "upcoming",
        description: "The flagship monthly cup. Bracket drops 48h before start on Discord. Winner takes the crown and a permanent spot on the Cup Wall.",
      },
      {
        id: "knights-clash-3", title: "KNIGHTS CLASH III", game: "valorant", date: inDays(16), time: "19:00",
        prize: 3000, currency: "MAD", format: "5v5 · BO3 Swiss + Playoff", slots: 16, registered: 11, entry: "Full squad required",
        status: "upcoming",
        description: "Our biggest Valorant event of the split. Swiss rounds on Friday, playoffs on Saturday night with live casting.",
      },
      {
        id: "midnight-ladder", title: "MIDNIGHT LADDER FINALS", game: "csgo", date: inDays(23), time: "23:00",
        prize: 1000, currency: "MAD", format: "5v5 · Best of 1 bracket", slots: 8, registered: 8, entry: "Top-8 ladder qualifiers",
        status: "upcoming",
        description: "The monthly CS2 ladder closes with a single-night bracket. Only the top 8 qualifiers get the invite.",
      },
      {
        id: "ramadan-showdown", title: "RAMADAN SHOWDOWN", game: "efootball", date: inDays(-12), time: "21:30",
        prize: 800, currency: "MAD", format: "1v1 · Double Elimination", slots: 32, registered: 32, entry: "Free",
        status: "completed", champion: "LADROOK",
        description: "48 knights entered. One rode out on top after a five-game grand final that broke the viewership record.",
      },
    ];
  })(),
  admins: [],
  rateLimits: {},
};

/* ---------------- context ---------------- */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { cacheNonce, listApplications, readSiteStateStrict } from "../lib/backend";
import type { Application } from "../lib/backend";

type SyncStatus = "live" | "polling" | "offline";

/* ---------- last-known-good local cache (safety net across reloads) ---------- */
const CACHE_KEY = "fursan_state_cache_v1";

function readStateCache(): SiteState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteState;
    if (!parsed || parsed.version !== DEFAULT_STATE.version) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStateCache(s: SiteState) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    try {
      // quota exceeded (big images) — still cache everything except image payloads
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...s, images: DEFAULT_STATE.images }));
    } catch {
      /* cache unavailable — cloud stays the source of truth */
    }
  }
}

interface SiteCtx {
  state: SiteState;
  ready: boolean;
  dbOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  apps: Application[];
  appsReady: boolean;
  refreshApps: () => Promise<void>;
  update: (patch: Partial<SiteState>) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<SiteCtx | null>(null);

const SITE_POLL_MS = 12_000;
const APPS_POLL_MS = 20_000;

export function SiteProvider({ children }: { children: ReactNode }) {
  // hydrate instantly from the last-known-good cache so a reload never shows
  // "zero" while (or if) the cloud read is in flight / failing
  const [state, setState] = useState<SiteState>(() => readStateCache() ?? DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [dbOnline, setDbOnline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("polling");
  const [lastSyncAt, setLastSyncAt] = useState("");
  const [apps, setApps] = useState<Application[]>([]);
  const [appsReady, setAppsReady] = useState(false);

  const loadingRef = useRef(false);
  const stateRef = useRef<SiteState>(state);
  const siteUpdatedAtRef = useRef("");
  const appsSigRef = useRef("");
  const realtimeAliveRef = useRef(false);

  useEffect(() => { stateRef.current = state; }, [state]);

  /* ---------- site state: full refresh (strict read + retries + cache) ---------- */
  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      let res = await readSiteStateStrict();
      let attempt = 0;
      while (!res.ok && attempt < 2) {
        attempt++;
        await new Promise((r) => window.setTimeout(r, 700 * attempt));
        res = await readSiteStateStrict();
      }
      if (res.ok) {
        setDbOnline(true);
        const merged = deepMerge(DEFAULT_STATE, res.state ?? {});
        setState(merged);
        writeStateCache(merged);
        setLastSyncAt(new Date().toISOString());
      } else {
        // read genuinely failed — keep whatever we have (cache/defaults), flag offline
        setDbOnline(false);
        console.warn("[fursan] site_state refresh failed:", res.message);
      }
    } finally {
      loadingRef.current = false;
      setReady(true);
    }
  }, []);

  /* ---------- applications: refresh ---------- */
  const refreshApps = useCallback(async () => {
    try {
      const rows = await listApplications();
      setApps(rows.filter((a) => a.type === "esports"));
      setLastSyncAt(new Date().toISOString());
    } catch {
      /* keep current list */
    } finally {
      setAppsReady(true);
    }
  }, []);

  /* ---------- first load ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { await ensureSeedAdmin(); } catch { /* ignore */ }
      if (!mounted) return;
      await refresh();
      await refreshApps();
      // capture signatures so polling only reacts to real changes
      try {
        const { data } = await supabase.from("site_state").select("updated_at").eq("id", "default").neq("id", cacheNonce()).maybeSingle();
        if (data?.updated_at) siteUpdatedAtRef.current = data.updated_at as string;
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [refresh, refreshApps]);

  /* ---------- self-healing realtime channels ---------- */
  useEffect(() => {
    let disposed = false;
    const channelRefs: { current: RealtimeChannel | null }[] = [];

    const watch = (name: string, table: string, onChange: () => void) => {
      const ref: { current: RealtimeChannel | null } = { current: null };
      channelRefs.push(ref);
      const connect = () => {
        if (disposed) return;
        const channel = supabase
          .channel(name)
          .on("postgres_changes", { event: "*", schema: "public", table }, () => onChange())
          .subscribe((status) => {
            if (disposed) return;
            if (status === "SUBSCRIBED") {
              realtimeAliveRef.current = true;
              setSyncStatus("live");
            }
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              if (ref.current !== channel) return; // stale channel already replaced
              realtimeAliveRef.current = false;
              setSyncStatus((s) => (s === "offline" ? s : "polling"));
              ref.current = null;
              void supabase.removeChannel(channel);
              window.setTimeout(connect, 2500); // auto-heal
            }
          });
        ref.current = channel;
      };
      connect();
    };

    // site_state: apply the realtime payload immediately, then a busted read to be safe
    const siteRef: { current: RealtimeChannel | null } = { current: null };
    channelRefs.push(siteRef);
    const connectSite = () => {
      if (disposed) return;
      const channel = supabase
        .channel("fursan-site-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_state" },
          (payload) => {
            const row = (payload as { new?: { state?: Record<string, unknown>; updated_at?: string } }).new;
            if (row?.state) {
              const merged = deepMerge(DEFAULT_STATE, row.state);
              setState(merged);
              writeStateCache(merged);
              setDbOnline(true);
              setLastSyncAt(new Date().toISOString());
              if (row.updated_at) siteUpdatedAtRef.current = row.updated_at;
            } else {
              void refresh();
            }
          }
        )
        .subscribe((status) => {
          if (disposed) return;
          if (status === "SUBSCRIBED") { realtimeAliveRef.current = true; setSyncStatus("live"); }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            if (siteRef.current !== channel) return;
            realtimeAliveRef.current = false;
            setSyncStatus((s) => (s === "offline" ? s : "polling"));
            siteRef.current = null;
            void supabase.removeChannel(channel);
            window.setTimeout(connectSite, 2500);
          }
        });
      siteRef.current = channel;
    };
    connectSite();

    watch("fursan-apps-sync", "applications", () => { void refreshApps(); });

    return () => {
      disposed = true;
      channelRefs.forEach((ref) => { if (ref.current) void supabase.removeChannel(ref.current); });
    };
  }, [refresh, refreshApps]);

  /* ---------- fallback polling (works even if websockets are blocked) ---------- */
  useEffect(() => {
    const sitePoll = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.from("site_state").select("updated_at").eq("id", "default").neq("id", cacheNonce()).maybeSingle();
        if (error) throw new Error(error.message);
        setDbOnline(true);
        setSyncStatus(realtimeAliveRef.current ? "live" : "polling");
        const stamp = (data?.updated_at as string | undefined) ?? "";
        if (stamp && stamp !== siteUpdatedAtRef.current) {
          siteUpdatedAtRef.current = stamp;
          await refresh();
        }
      } catch {
        setDbOnline(false);
        setSyncStatus("offline");
      }
    }, SITE_POLL_MS);

    const appsPoll = window.setInterval(async () => {
      try {
        const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).neq("id", cacheNonce());
        const { data } = await supabase.from("applications").select("updated_at").neq("id", cacheNonce()).order("updated_at", { ascending: false }).limit(1).maybeSingle();
        const sig = `${count ?? 0}|${(data?.updated_at as string | undefined) ?? ""}`;
        if (sig && sig !== appsSigRef.current) {
          appsSigRef.current = sig;
          await refreshApps();
        }
      } catch { /* ignore — realtime/polling already reported */ }
    }, APPS_POLL_MS);

    return () => { window.clearInterval(sitePoll); window.clearInterval(appsPoll); };
  }, [refresh, refreshApps]);

  /* ---------- write: optimistic, reverts + throws on failure ---------- */
  const update = useCallback(async (patch: Partial<SiteState>) => {
    const prev = stateRef.current;
    setState((p) => deepMerge(p, patch));
    try {
      const merged = await saveSiteState(patch as Record<string, unknown>);
      const mergedState = deepMerge(DEFAULT_STATE, merged);
      setState(mergedState);
      writeStateCache(mergedState); // survives reloads even if the next cloud read fails
      setDbOnline(true);
      setLastSyncAt(new Date().toISOString());
      siteUpdatedAtRef.current = new Date().toISOString(); // don't re-trigger poll for our own write
    } catch (e) {
      setState(prev); // revert — the change is NOT live
      setDbOnline(false);
      console.warn("[fursan] save failed:", e);
      throw e;
    }
  }, []);

  const value = useMemo(
    () => ({ state, ready, dbOnline, syncStatus, lastSyncAt, apps, appsReady, refreshApps, update, refresh }),
    [state, ready, dbOnline, syncStatus, lastSyncAt, apps, appsReady, refreshApps, update, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite(): SiteCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
