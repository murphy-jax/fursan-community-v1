import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon, Monogram } from "../../components/ui";
import { useSite } from "../../state/SiteContext";
import { readFileAsDataURL, validateImageFile } from "../../lib/backend";
import type { Founder } from "../../lib/backend";
import { useAdmin } from "./adminCtx";

const IMAGE_SLOTS: { key: string; label: string }[] = [
  { key: "logo", label: "LOGO / EMBLEM (transparent PNG blends over dark)" },
  { key: "homeHero", label: "HOME HERO BACKDROP" },
  { key: "communityHero", label: "COMMUNITY HERO BACKDROP" },
  { key: "esportsHero", label: "ESPORTS HERO BACKDROP" },
];

export default function ContentTab() {
  const { state, update } = useSite();
  const { toast } = useAdmin();
  const [content, setContent] = useState(() => structuredClone(state.content));
  const [founders, setFounders] = useState<Founder[]>(() => structuredClone(state.founders));
  const [features, setFeatures] = useState(() => structuredClone(state.features));
  const [images, setImages] = useState<Record<string, string>>(() => ({ ...state.images }));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setContent(structuredClone(state.content));
      setFounders(structuredClone(state.founders));
      setFeatures(structuredClone(state.features));
      setImages({ ...state.images });
    }
  }, [state, dirty]);

  const P = <K extends keyof typeof content>(section: K, key: string, value: string) => {
    setDirty(true);
    setContent((c) => ({ ...c, [section]: { ...(c[section] as Record<string, unknown>), [key]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await update({ content, founders, features, images });
      setDirty(false);
      toast("Content published — every visitor sees it now (realtime).");
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setContent(structuredClone(state.content));
    setFounders(structuredClone(state.founders));
    setFeatures(structuredClone(state.features));
    setImages({ ...state.images });
    setDirty(false);
    toast("Draft discarded — reverted to live version.", "info");
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">WEBSITE CONTENT MANAGER</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Everything the public sees. Publish once — synced to all visitors instantly.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={discard} className="clip-btn border border-ink-600 text-fog-300 hover:text-fog-100 px-4 py-2.5 font-display text-[11.5px] font-bold tracking-[0.14em] transition-colors">
            DISCARD
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className={`clip-btn inline-flex items-center gap-2 px-5 py-2.5 font-display text-[11.5px] font-bold tracking-[0.14em] transition-all disabled:opacity-50 ${
              dirty ? "bg-brand-500 text-ink-950 hover:bg-brand-300 shadow-[0_0_24px_rgba(227,178,60,0.35)]" : "border border-ink-600 text-fog-400"
            }`}
          >
            <Icon name={saving ? "refresh" : "save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "PUBLISHING…" : dirty ? "PUBLISH CHANGES" : "NO CHANGES"}
          </button>
        </div>
      </div>

      {/* ---------- IMAGES ---------- */}
      <Section title="IMAGE VAULT" subtitle="PNG · JPG · WebP · GIF — max 1.5 MB. Stored in the cloud database as optimised data.">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {IMAGE_SLOTS.map((slot) => (
            <ImageSlot
              key={slot.key}
              label={slot.label}
              value={images[slot.key] ?? ""}
              onChange={(v) => { setDirty(true); setImages((im) => ({ ...im, [slot.key]: v })); }}
              onFail={(msg) => toast(msg, "error")}
            />
          ))}
        </div>
      </Section>

      {/* ---------- HOME ---------- */}
      <Section title="HOME PAGE" subtitle="Hero, labels and section eyebrows.">
        <div className="grid sm:grid-cols-2 gap-4">
          <T label="HERO EYEBROW" value={content.home.eyebrow} onChange={(v) => P("home", "eyebrow", v)} />
          <T label="HERO TITLE" value={content.home.title} onChange={(v) => P("home", "title", v)} />
          <T label="TAGLINE" value={content.home.tagline} onChange={(v) => P("home", "tagline", v)} />
          <T label="ONLINE LABEL" value={content.home.onlineLabel} onChange={(v) => P("home", "onlineLabel", v)} />
          <T label="OFFLINE LABEL" value={content.home.offlineLabel} onChange={(v) => P("home", "offlineLabel", v)} />
          <T label="EXPLORE BUTTON" value={content.home.exploreLabel} onChange={(v) => P("home", "exploreLabel", v)} />
          <T label="DISCORD BUTTON" value={content.home.discordLabel} onChange={(v) => P("home", "discordLabel", v)} />
          <T label="STATS EYEBROW" value={content.home.statsEyebrow} onChange={(v) => P("home", "statsEyebrow", v)} />
          <T label="FEATURES EYEBROW" value={content.home.featuresEyebrow} onChange={(v) => P("home", "featuresEyebrow", v)} />
          <T label="FEATURES TITLE" value={content.home.featuresTitle} onChange={(v) => P("home", "featuresTitle", v)} />
          <T label="GAMES EYEBROW" value={content.home.gamesEyebrow} onChange={(v) => P("home", "gamesEyebrow", v)} />
          <T label="GAMES TITLE" value={content.home.gamesTitle} onChange={(v) => P("home", "gamesTitle", v)} />
        </div>
        <T area label="HERO DESCRIPTION" value={content.home.description} onChange={(v) => P("home", "description", v)} />

        <p className="mt-6 mb-3 font-mono text-[10.5px] tracking-[0.26em] text-brand-400">FEATURE CARDS (6)</p>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={f.id} className="clip-card border border-ink-600 bg-ink-850 p-4 grid gap-3">
              <p className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CARD 0{i + 1}</p>
              <T label="TITLE" value={f.title} onChange={(v) => { setDirty(true); setFeatures((fs) => fs.map((x, j) => (j === i ? { ...x, title: v } : x))); }} />
              <T area label="DESCRIPTION" value={f.desc} onChange={(v) => { setDirty(true); setFeatures((fs) => fs.map((x, j) => (j === i ? { ...x, desc: v } : x))); }} />
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- COMMUNITY ---------- */}
      <Section title="COMMUNITY PAGE" subtitle="Story, mission, values and quote.">
        <div className="grid sm:grid-cols-2 gap-4">
          <T label="EYEBROW" value={content.community.eyebrow} onChange={(v) => P("community", "eyebrow", v)} />
          <T label="TITLE" value={content.community.title} onChange={(v) => P("community", "title", v)} />
        </div>
        <T area label="HERO DESCRIPTION" value={content.community.desc} onChange={(v) => P("community", "desc", v)} />
        <T label="STORY TITLE" value={content.community.storyTitle} onChange={(v) => P("community", "storyTitle", v)} />
        {content.community.story.map((p, i) => (
          <T key={i} area label={`STORY PARAGRAPH ${i + 1}`} value={p} onChange={(v) => {
            setDirty(true);
            setContent((c) => ({ ...c, community: { ...c.community, story: c.community.story.map((x, j) => (j === i ? v : x)) } }));
          }} />
        ))}
        <div className="grid sm:grid-cols-2 gap-4">
          <T label="MISSION TITLE" value={content.community.missionTitle} onChange={(v) => P("community", "missionTitle", v)} />
          <T area label="MISSION TEXT" value={content.community.mission} onChange={(v) => P("community", "mission", v)} />
        </div>
        <p className="mt-4 mb-2 font-mono text-[10.5px] tracking-[0.26em] text-brand-400">VALUES (4)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {content.community.values.map((v, i) => (
            <div key={i} className="clip-card border border-ink-600 bg-ink-850 p-4 grid gap-3">
              <T label={`VALUE ${i + 1} — TITLE`} value={v.title} onChange={(nv) => {
                setDirty(true);
                setContent((c) => ({ ...c, community: { ...c.community, values: c.community.values.map((x, j) => (j === i ? { ...x, title: nv } : x)) } }));
              }} />
              <T area label="DESCRIPTION" value={v.desc} onChange={(nv) => {
                setDirty(true);
                setContent((c) => ({ ...c, community: { ...c.community, values: c.community.values.map((x, j) => (j === i ? { ...x, desc: nv } : x)) } }));
              }} />
            </div>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <T area label="QUOTE" value={content.community.quote} onChange={(v) => P("community", "quote", v)} />
          <div className="grid gap-4 content-start">
            <T label="QUOTE ATTRIBUTION" value={content.community.quoteBy} onChange={(v) => P("community", "quoteBy", v)} />
            <T label="CTA TITLE" value={content.community.ctaTitle} onChange={(v) => P("community", "ctaTitle", v)} />
            <T label="CTA BUTTON" value={content.community.ctaBtn} onChange={(v) => P("community", "ctaBtn", v)} />
          </div>
        </div>
        <T area label="CTA BODY" value={content.community.ctaBody} onChange={(v) => P("community", "ctaBody", v)} />
      </Section>

      {/* ---------- ESPORTS ---------- */}
      <Section title="ESPORTS PAGE" subtitle="Hero copy, status notes and the application journey.">
        <div className="grid sm:grid-cols-2 gap-4">
          <T label="EYEBROW" value={content.esports.eyebrow} onChange={(v) => P("esports", "eyebrow", v)} />
          <T label="TITLE" value={content.esports.title} onChange={(v) => P("esports", "title", v)} />
        </div>
        <T area label="HERO DESCRIPTION" value={content.esports.desc} onChange={(v) => P("esports", "desc", v)} />
        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          <T area label="NOTE — OPEN STATUS" value={content.esports.openNote} onChange={(v) => P("esports", "openNote", v)} />
          <T area label="NOTE — PAUSED STATUS" value={content.esports.temporaryNote} onChange={(v) => P("esports", "temporaryNote", v)} />
          <T area label="NOTE — CLOSED STATUS" value={content.esports.closedNote} onChange={(v) => P("esports", "closedNote", v)} />
        </div>
        <T label="JOURNEY TITLE" value={content.esports.journeyTitle} onChange={(v) => P("esports", "journeyTitle", v)} />
        <div className="grid sm:grid-cols-2 gap-4">
          {content.esports.journey.map((j, i) => (
            <div key={i} className="clip-card border border-ink-600 bg-ink-850 p-4 grid gap-3">
              <T label={`PHASE ${i + 1} — NAME`} value={j.step} onChange={(nv) => {
                setDirty(true);
                setContent((c) => ({ ...c, esports: { ...c.esports, journey: c.esports.journey.map((x, k) => (k === i ? { ...x, step: nv } : x)) } }));
              }} />
              <T area label="DESCRIPTION" value={j.desc} onChange={(nv) => {
                setDirty(true);
                setContent((c) => ({ ...c, esports: { ...c.esports, journey: c.esports.journey.map((x, k) => (k === i ? { ...x, desc: nv } : x)) } }));
              }} />
            </div>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <T label="FOUNDERS SECTION EYEBROW" value={content.home.foundersEyebrow} onChange={(v) => P("home", "foundersEyebrow", v)} />
          <T label="FOUNDERS TITLE" value={content.foundersTitle} onChange={(v) => patchFoundersTitle(v)} />
        </div>
        <T label="FOUNDERS SUBTITLE" value={content.foundersSub} onChange={(v) => patchFoundersTitleSub(v)} />
      </Section>

      {/* ---------- FOUNDERS ---------- */}
      <Section title="FOUNDING COUNCIL" subtitle="Names, tags and optional portraits (transparent PNG recommended).">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {founders.map((f, i) => (
            <div key={f.id} className="clip-card border border-ink-600 bg-ink-850 p-4 grid gap-3">
              <div className="flex items-center gap-3">
                {f.image ? <img src={f.image} alt="" className="w-12 h-12 clip-tag object-cover border border-brand-500/30" /> : <Monogram name={f.name} className="w-12 h-12 text-sm" />}
                <div>
                  <p className="font-display font-bold text-fog-100 tracking-[0.08em]">{f.name || `FOUNDER 0${i + 1}`}</p>
                  <p className="font-mono text-[9.5px] text-fog-500 tracking-wider">SEAT 0{i + 1}</p>
                </div>
              </div>
              <T label="NAME" value={f.name} onChange={(v) => { setDirty(true); setFounders((fs) => fs.map((x, j) => (j === i ? { ...x, name: v } : x))); }} />
              <T label="TAG LINE" value={f.tag} onChange={(v) => { setDirty(true); setFounders((fs) => fs.map((x, j) => (j === i ? { ...x, tag: v } : x))); }} />
              <UploadRow
                value={f.image ?? ""}
                onChange={(v) => { setDirty(true); setFounders((fs) => fs.map((x, j) => (j === i ? { ...x, image: v || undefined } : x))); }}
                onFail={(msg) => toast(msg, "error")}
                compact
              />
            </div>
          ))}
        </div>
      </Section>

      {/* sticky save bar */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 backdrop-blur border-t border-brand-500/30 lg:pl-60">
          <div className="mx-auto max-w-[80rem] px-6 py-3.5 flex items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-wider text-amberx-400 inline-flex items-center gap-2">
              <Icon name="alert" className="w-4 h-4" /> UNPUBLISHED CHANGES — visitors still see the old version
            </p>
            <button onClick={() => void save()} disabled={saving} className="clip-btn bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] px-6 py-2.5 hover:bg-brand-300 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              <Icon name={saving ? "refresh" : "save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> PUBLISH NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function patchFoundersTitle(v: string) { setDirty(true); setContent((c) => ({ ...c, foundersTitle: v })); }
  function patchFoundersTitleSub(v: string) { setDirty(true); setContent((c) => ({ ...c, foundersSub: v })); }
}

/* ================= building blocks ================= */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mt-8 hud-corners clip-card border border-ink-600 bg-ink-900 p-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display font-bold tracking-[0.14em] text-fog-100">{title}</h2>
        {subtitle && <p className="font-mono text-[10px] text-fog-500 tracking-wider">{subtitle}</p>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function T({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <label className="block mt-3 first:mt-0">
      <span className="block font-mono text-[9.5px] tracking-[0.24em] text-fog-500 mb-1.5">{label}</span>
      {area ? (
        <textarea className="hud-input min-h-20 resize-y text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="hud-input text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ImageSlot({ label, value, onChange, onFail }: { label: string; value: string; onChange: (v: string) => void; onFail: (msg: string) => void }) {
  return (
    <div className="clip-card border border-ink-600 bg-ink-850 p-4">
      <p className="font-mono text-[9.5px] tracking-[0.22em] text-fog-500 mb-3">{label}</p>
      <div className="relative h-32 grid place-items-center border border-ink-700 bg-[repeating-conic-gradient(#15100a_0%_25%,#1c1610_0%_50%)] bg-[length:16px_16px] overflow-hidden">
        {value ? (
          <img src={value} alt="" className="max-h-full max-w-full object-contain mix-blend-screen" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <span className="font-mono text-[10px] text-fog-500 tracking-widest">EMPTY</span>
        )}
      </div>
      <UploadRow value={value} onChange={onChange} onFail={onFail} />
    </div>
  );
}

function UploadRow({ value, onChange, onFail, compact }: { value: string; onChange: (v: string) => void; onFail: (msg: string) => void; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { onFail(err); return; }
    setBusy(true);
    try {
      const url = await readFileAsDataURL(file);
      onChange(url);
    } catch (e) {
      onFail((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={`flex gap-2 ${compact ? "mt-1" : "mt-3"}`}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
      <button onClick={() => inputRef.current?.click()} disabled={busy} className="clip-btn flex-1 border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 font-mono text-[10.5px] tracking-[0.16em] px-3 py-2 inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
        <Icon name={busy ? "refresh" : "upload"} className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} /> {busy ? "READING…" : "UPLOAD"}
      </button>
      {value && (
        <button onClick={() => onChange("")} className="clip-btn border border-ink-600 text-fog-500 hover:text-blood-400 hover:border-blood-500/50 font-mono text-[10.5px] tracking-[0.16em] px-3 py-2 transition-colors">
          CLEAR
        </button>
      )}
    </div>
  );
}
