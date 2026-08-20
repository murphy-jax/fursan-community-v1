import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/ui";
import { useSite } from "../../state/SiteContext";
import {
  changeAdminPassword, encryptToken, decryptToken, maskToken,
  testDiscordConnection, uid, fillTemplate, sendDiscordDM, DM_PLACEHOLDERS,
} from "../../lib/backend";
import type { Application, Program, ProgramStatus, StaffMember } from "../../lib/backend";
import type { Tournament } from "../../state/SiteContext";
import { useAdmin } from "./adminCtx";

const inputCls = "hud-input text-sm";

/* ================= DASHBOARD ================= */

export function DashboardTab({ go }: { go: (id: string) => void }) {
  const { state, apps, appsReady } = useSite();
  const loading = !appsReady;

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">COMMAND DASHBOARD</h1>
      <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Live overview — synced in realtime for every operator and visitor.</p>

      <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3">
        {([
          ["TOTAL APPLICATIONS", stats.total, "text-fog-100", "doc"],
          ["PENDING REVIEW", stats.pending, "text-amberx-400", "clock"],
          ["APPROVED", stats.approved, "text-mint-400", "check"],
          ["REJECTED", stats.rejected, "text-blood-400", "x"],
        ] as const).map(([label, val, tone, icon]) => (
          <button key={label} onClick={() => go("applications")} className="clip-card border border-ink-600 bg-ink-900 p-5 text-left hover:border-brand-500/40 transition-colors group">
            <div className="flex items-center justify-between">
              <Icon name={icon} className="w-5 h-5 text-fog-500 group-hover:text-brand-400 transition-colors" />
              <Icon name="chevronRight" className="w-4 h-4 text-fog-600 group-hover:text-brand-400 transition-colors" />
            </div>
            <p className={`mt-3 font-display font-bold text-4xl ${tone}`}>{loading ? "—" : val}</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.24em] text-fog-400">{label}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* recent */}
        <div className="clip-card border border-ink-600 bg-ink-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">RECENT APPLICATIONS</h2>
            <button onClick={() => go("applications")} className="font-mono text-[10px] tracking-[0.2em] text-brand-400 hover:text-brand-300 transition-colors">VIEW ALL →</button>
          </div>
          <div className="mt-4 space-y-2.5">
            {loading ? (
              <p className="font-mono text-[11px] text-fog-500 py-8 text-center"><Icon name="refresh" className="inline w-4 h-4 animate-spin mr-2" />LOADING QUEUE…</p>
            ) : apps.length === 0 ? (
              <p className="font-mono text-[11px] text-fog-500 py-8 text-center">NO APPLICATIONS YET — they will appear here the moment someone submits.</p>
            ) : (
              apps.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 border border-ink-700 bg-ink-850 px-4 py-3 hover:border-brand-500/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-fog-100 truncate">{a.data.fullName} <span className="text-fog-500 font-mono text-[10.5px]">@{a.data.discordUsername}</span></p>
                    <p className="font-mono text-[10px] text-fog-500 tracking-wider">{a.ref} · {a.program.toUpperCase()} · {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`clip-tag border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.18em] uppercase shrink-0 ${
                    a.status === "pending" ? "border-amberx-500/50 text-amberx-400" : a.status === "approved" ? "border-mint-500/50 text-mint-400" : "border-blood-500/50 text-blood-400"
                  }`}>{a.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* recruitment overview */}
        <div className="clip-card border border-ink-600 bg-ink-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">RECRUITMENT OVERVIEW</h2>
            <button onClick={() => go("esports")} className="font-mono text-[10px] tracking-[0.2em] text-brand-400 hover:text-brand-300 transition-colors">MANAGE →</button>
          </div>
          <div className="mt-4 space-y-3">
            {state.programs.map((p) => {
              const count = apps.filter((a) => a.program === p.id).length;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-[13px] tracking-[0.1em] text-fog-200">{p.title}</p>
                    <span className={`font-mono text-[9.5px] tracking-[0.18em] ${p.status === "open" ? "text-mint-400" : p.status === "temporary" ? "text-amberx-400" : "text-blood-400"}`}>
                      {p.status === "open" ? "● OPEN" : p.status === "temporary" ? "● PAUSED" : "● CLOSED"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-ink-700 overflow-hidden">
                    <div className={`h-full bar-grow ${p.status === "open" ? "bg-mint-500" : p.status === "temporary" ? "bg-amberx-500" : "bg-blood-500"}`} style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-fog-500">{count} application{count === 1 ? "" : "s"} · {pct}% of queue</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-ink-700 grid grid-cols-2 gap-3">
            <div className="clip-tag border border-ink-600 bg-ink-850 p-3 text-center">
              <p className="font-display font-bold text-2xl text-brand-300">{state.staff.length}</p>
              <p className="font-mono text-[9px] tracking-[0.22em] text-fog-500 mt-1">STAFF MEMBERS</p>
            </div>
            <div className="clip-tag border border-ink-600 bg-ink-850 p-3 text-center">
              <p className="font-display font-bold text-2xl text-brand-300">{state.settings.memberCount.toLocaleString()}</p>
              <p className="font-mono text-[9px] tracking-[0.22em] text-fog-500 mt-1">MEMBER COUNT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ESPORTS MANAGEMENT ================= */

export function EsportsTab() {
  const { state, update } = useSite();
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<Program[]>(() => structuredClone(state.programs));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!dirty) setDraft(structuredClone(state.programs)); }, [state.programs, dirty]);

  const patch = (i: number, key: keyof Program, value: string) => {
    setDirty(true);
    setDraft((d) => d.map((p, j) => (j === i ? { ...p, [key]: value } : p)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await update({ programs: draft });
      setDirty(false);
      toast("Programs published — statuses are live on the public pages now.");
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">ESPORTS MANAGEMENT</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Titles, descriptions and recruitment gates. Status changes broadcast instantly.</p>
        </div>
        <button
          onClick={() => void save()}
          disabled={saving || !dirty}
          className={`clip-btn inline-flex items-center gap-2 px-5 py-2.5 font-display text-[11.5px] font-bold tracking-[0.14em] transition-all disabled:opacity-40 ${dirty ? "bg-brand-500 text-ink-950 hover:bg-brand-300" : "border border-ink-600 text-fog-400"}`}
        >
          <Icon name={saving ? "refresh" : "save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> {saving ? "PUBLISHING…" : "PUBLISH"}
        </button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        {draft.map((p, i) => (
          <div key={p.id} className="hud-corners clip-card border border-ink-600 bg-ink-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500">DIV-{String(i + 1).padStart(2, "0")} / {p.id.toUpperCase()}</p>
              <select
                value={p.status}
                onChange={(e) => patch(i, "status", e.target.value)}
                className={`clip-tag border px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] bg-ink-850 cursor-pointer ${
                  p.status === "open" ? "border-mint-500/60 text-mint-400" : p.status === "temporary" ? "border-amberx-500/60 text-amberx-400" : "border-blood-500/60 text-blood-400"
                }`}
              >
                <option value="open">OPEN — RECRUITING</option>
                <option value="temporary">TEMPORARILY CLOSED</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="block">
                <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PROGRAM TITLE</span>
                <input className={`${inputCls} mt-1.5`} value={p.title} onChange={(e) => patch(i, "title", e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">GAME</span>
                  <input className={`${inputCls} mt-1.5`} value={p.game} onChange={(e) => patch(i, "game", e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PLATFORMS (· separated)</span>
                  <input className={`${inputCls} mt-1.5`} value={p.platform} onChange={(e) => patch(i, "platform", e.target.value)} />
                </label>
              </div>
              <label className="block">
                <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DESCRIPTION</span>
                <textarea className={`${inputCls} mt-1.5 min-h-24 resize-y`} value={p.description} onChange={(e) => patch(i, "description", e.target.value)} />
              </label>
            </div>
            <p className={`mt-3 font-mono text-[10px] tracking-wider ${p.status === "open" ? "text-mint-400" : "text-fog-500"}`}>
              {p.status === "open" ? "▸ Public site shows APPLY NOW for this program." : "▸ Apply button hidden on the public site."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= TOURNAMENTS ================= */

const EMPTY_TOURNAMENT: Omit<Tournament, "id"> = {
  title: "", game: "fifa", date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
  time: "20:00", prize: 1000, currency: "MAD", format: "1v1 · Single Elimination",
  slots: 32, registered: 0, entry: "Free — members only", status: "upcoming" as const, champion: "", description: "",
};

export function TournamentsTab() {
  const { state, update } = useSite();
  const { toast } = useAdmin();
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const list = state.tournaments ?? [];

  const persist = async (next: Tournament[], msg: string) => {
    setBusy(true);
    try {
      await update({ tournaments: next });
      toast(msg);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const quickStatus = (t: Tournament, status: Tournament["status"]) => {
    void persist(list.map((x) => (x.id === t.id ? { ...x, status } : x)), `“${t.title}” marked ${status.toUpperCase()} — live everywhere.`);
  };

  const saveEditing = (t: Tournament) => {
    if (!t.title.trim() || !t.date) { toast("Title and date are required.", "error"); return; }
    const clean = { ...t, champion: t.status === "completed" ? t.champion : undefined };
    const exists = list.some((x) => x.id === t.id);
    void persist(exists ? list.map((x) => (x.id === t.id ? clean : x)) : [...list, clean],
      exists ? `“${t.title}” updated — visitors see it now.` : `“${t.title}” published to the public circuit.`);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">TOURNAMENT CIRCUIT</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Create a battle here — it appears on the public page for every visitor instantly.</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_TOURNAMENT, id: uid() })}
          className="clip-btn bg-brand-500 text-ink-950 font-display font-bold text-[11.5px] tracking-[0.14em] px-5 py-2.5 hover:bg-brand-300 transition-colors inline-flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" /> NEW TOURNAMENT
        </button>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 hud-corners clip-card border border-ink-600 bg-ink-900 p-12 text-center">
          <Icon name="trophy" className="w-10 h-10 text-fog-500 mx-auto" />
          <p className="mt-4 font-display font-bold text-lg text-fog-200 tracking-[0.08em]">NO TOURNAMENTS YET</p>
          <p className="mt-2 text-fog-400 text-sm">Publish your first cup — it goes live on the site in realtime.</p>
        </div>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((t) => (
            <div key={t.id} className={`clip-card border bg-ink-900 p-5 flex flex-col ${t.status === "live" ? "border-blood-500/50" : "border-ink-600"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`clip-tag border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] uppercase ${
                  t.status === "upcoming" ? "border-brand-500/50 text-brand-300" : t.status === "live" ? "border-blood-500/50 text-blood-300" : "border-ink-600 text-fog-500"
                }`}>{t.status}</span>
                <span className="font-mono text-[10px] text-fog-500 tracking-wider">{t.game.toUpperCase()}</span>
              </div>
              <h3 className="mt-3 font-display font-bold text-lg text-fog-100 tracking-tight leading-tight">{t.title}</h3>
              <p className="mt-1.5 font-mono text-[10.5px] text-fog-400">{t.date} · {t.time} · {t.format}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-display font-bold text-xl text-brand-300 tracking-tight">{(t.prize || 0).toLocaleString()} {t.currency}</p>
                <p className="font-mono text-[10px] text-fog-500">{t.slots} slots</p>
              </div>
              <div className="mt-4 pt-3.5 border-t border-ink-700 flex items-center gap-2 flex-wrap">
                <button onClick={() => setEditing(t)} className="clip-btn border border-ink-600 p-2 text-fog-400 hover:text-brand-300 hover:border-brand-500/50 transition-colors" aria-label="Edit tournament">
                  <Icon name="edit" className="w-4 h-4" />
                </button>
                {t.status === "upcoming" && (
                  <button onClick={() => quickStatus(t, "live")} className="clip-btn border border-blood-500/50 text-blood-300 hover:bg-blood-500/10 font-mono text-[9.5px] tracking-[0.16em] px-3 py-2 transition-colors">GO LIVE</button>
                )}
                {t.status !== "completed" && (
                  <button onClick={() => quickStatus(t, "completed")} className="clip-btn border border-ink-600 text-fog-400 hover:text-fog-200 font-mono text-[9.5px] tracking-[0.16em] px-3 py-2 transition-colors">COMPLETE</button>
                )}
                <div className="flex-1" />
                {deleting === t.id ? (
                  <button onClick={() => { void persist(list.filter((x) => x.id !== t.id), `“${t.title}” removed.`); setDeleting(null); }} className="clip-btn bg-blood-500 text-white px-3 py-2 font-mono text-[10px] tracking-wider hover:bg-blood-400 transition-colors">CONFIRM</button>
                ) : (
                  <button onClick={() => setDeleting(t.id)} className="clip-btn border border-ink-600 p-2 text-fog-400 hover:text-blood-400 hover:border-blood-500/50 transition-colors" aria-label="Delete tournament">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {busy && <p className="mt-3 font-mono text-[10.5px] text-fog-500 inline-flex items-center gap-2"><Icon name="refresh" className="w-3.5 h-3.5 animate-spin text-brand-400" /> SYNCING…</p>}

      {editing && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-4">
          <button className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" onClick={() => setEditing(null)} aria-label="Close" />
          <div className="modal-in relative w-full max-w-2xl hud-corners clip-card border border-brand-500/30 bg-ink-900 p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold tracking-[0.1em] text-fog-100">{list.some((x) => x.id === editing.id) ? "EDIT BATTLE" : "NEW BATTLE"}</h2>
              <button onClick={() => setEditing(null)} className="clip-tag grid place-items-center w-9 h-9 border border-ink-600 text-fog-400 hover:text-blood-400 transition-colors" aria-label="Close">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">TOURNAMENT TITLE *</span>
                <input className={`${inputCls} mt-1.5`} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. FURSAN CUP VIII" />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">GAME</span>
                <select className={`${inputCls} mt-1.5`} value={state.programs.some((p) => p.id === editing.game) ? editing.game : "__custom"} onChange={(e) => { const v = e.target.value; setEditing({ ...editing, game: v === "__custom" ? "custom" : v }); }}>
                  {state.programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  <option value="__custom">Other / custom…</option>
                </select>
              </label>
              {!state.programs.some((p) => p.id === editing.game) && (
                <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CUSTOM GAME NAME</span>
                  <input className={`${inputCls} mt-1.5`} value={editing.game} onChange={(e) => setEditing({ ...editing, game: e.target.value })} placeholder="e.g. Rocket League" />
                </label>
              )}
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DATE *</span>
                <input type="date" className={`${inputCls} mt-1.5 font-mono`} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">START TIME</span>
                <input type="time" className={`${inputCls} mt-1.5 font-mono`} value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PRIZE AMOUNT</span>
                <input type="number" min={0} className={`${inputCls} mt-1.5 font-mono`} value={editing.prize} onChange={(e) => setEditing({ ...editing, prize: Number(e.target.value) || 0 })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CURRENCY</span>
                <select className={`${inputCls} mt-1.5`} value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })}>
                  {["MAD", "USD", "EUR", "DH", "$"].map((cu) => <option key={cu} value={cu}>{cu}</option>)}
                </select>
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">FORMAT</span>
                <input className={`${inputCls} mt-1.5`} value={editing.format} onChange={(e) => setEditing({ ...editing, format: e.target.value })} placeholder="e.g. 1v1 · Single Elimination" />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">SLOTS</span>
                <input type="number" min={2} className={`${inputCls} mt-1.5 font-mono`} value={editing.slots} onChange={(e) => setEditing({ ...editing, slots: Number(e.target.value) || 2 })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">REGISTERED (progress bar)</span>
                <input type="number" min={0} className={`${inputCls} mt-1.5 font-mono`} value={editing.registered ?? 0} onChange={(e) => setEditing({ ...editing, registered: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
              <label className="block sm:col-span-2"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">ENTRY NOTE</span>
                <input className={`${inputCls} mt-1.5`} value={editing.entry} onChange={(e) => setEditing({ ...editing, entry: e.target.value })} placeholder="e.g. Free — members only" />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">STATUS</span>
                <select className={`${inputCls} mt-1.5`} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Tournament["status"] })}>
                  <option value="upcoming">UPCOMING</option>
                  <option value="live">LIVE</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </label>
              {editing.status === "completed" && (
                <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CHAMPION</span>
                  <input className={`${inputCls} mt-1.5`} value={editing.champion ?? ""} onChange={(e) => setEditing({ ...editing, champion: e.target.value })} placeholder="Winner name" />
                </label>
              )}
              <label className="block sm:col-span-2"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DESCRIPTION</span>
                <textarea className={`${inputCls} mt-1.5 min-h-20 resize-y`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => saveEditing(editing)} className="clip-btn flex-1 bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] py-3 hover:bg-brand-300 transition-colors">
                {list.some((x) => x.id === editing.id) ? "SAVE CHANGES" : "PUBLISH TOURNAMENT"}
              </button>
              <button onClick={() => setEditing(null)} className="clip-btn border border-ink-600 text-fog-300 font-display font-bold text-xs tracking-[0.16em] px-5 transition-colors">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STAFF ================= */

const PERMISSIONS = ["applications", "content", "staff", "discord", "settings"];
const DEPARTMENTS = ["Management", "Esports", "Events", "Moderation"];

export function StaffTab() {
  const { state, update } = useSite();
  const { toast } = useAdmin();
  const [draft, setDraft] = useState<StaffMember[]>(() => structuredClone(state.staff));
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(structuredClone(state.staff)); }, [state.staff]);

  const persist = async (next: StaffMember[], msg: string) => {
    setSaving(true);
    try {
      await update({ staff: next });
      setDraft(next);
      toast(msg);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const saveEditing = (member: StaffMember) => {
    if (!member.username.trim() || !member.role.trim()) { toast("Username and role are required.", "error"); return; }
    const exists = draft.some((s) => s.id === member.id);
    const next = exists ? draft.map((s) => (s.id === member.id ? member : s)) : [...draft, member];
    void persist(next, exists ? `Staff ${member.username} updated.` : `Staff ${member.username} added to the roster.`);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">STAFF ROSTER</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Shown nowhere publicly unless you publish it — internal command structure.</p>
        </div>
        <button
          onClick={() => setEditing({ id: uid(), username: "", discord: "", role: "", department: "Esports", permissions: ["applications"] })}
          className="clip-btn bg-brand-500 text-ink-950 font-display font-bold text-[11.5px] tracking-[0.14em] px-5 py-2.5 hover:bg-brand-300 transition-colors inline-flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" /> ADD STAFF
        </button>
      </div>

      <div className="mt-6 clip-card border border-ink-600 bg-ink-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left">
              {["USERNAME", "DISCORD", "ROLE", "DEPARTMENT", "PERMISSIONS", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 font-mono text-[10px] tracking-[0.22em] text-fog-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center font-mono text-[11px] text-fog-500">ROSTER EMPTY — add your first operator.</td></tr>
            )}
            {draft.map((s) => (
              <tr key={s.id} className="border-b border-ink-800 hover:bg-ink-850 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-display font-bold tracking-[0.08em] text-fog-100">{s.username}</p>
                </td>
                <td className="px-5 py-4 font-mono text-[11.5px] text-fog-400">@{s.discord || "—"}</td>
                <td className="px-5 py-4 text-fog-300">{s.role}</td>
                <td className="px-5 py-4">
                  <span className="clip-tag border border-brand-500/30 bg-brand-500/5 text-brand-300 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.18em]">{s.department.toUpperCase()}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {s.permissions.map((p) => (
                      <span key={p} className="font-mono text-[9px] tracking-wider text-fog-500 border border-ink-600 px-1.5 py-0.5">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(s)} className="clip-btn border border-ink-600 p-2 text-fog-400 hover:text-brand-300 hover:border-brand-500/50 transition-colors" aria-label="Edit staff">
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                  {deleting === s.id ? (
                    <button onClick={() => { void persist(draft.filter((x) => x.id !== s.id), `${s.username} removed from roster.`, ); setDeleting(null); }} className="ml-2 clip-btn bg-blood-500 text-white px-3 py-2 font-mono text-[10px] tracking-wider hover:bg-blood-400 transition-colors">
                      CONFIRM
                    </button>
                  ) : (
                    <button onClick={() => setDeleting(s.id)} className="ml-2 clip-btn border border-ink-600 p-2 text-fog-400 hover:text-blood-400 hover:border-blood-500/50 transition-colors" aria-label="Delete staff">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {saving && <p className="mt-3 font-mono text-[10.5px] text-fog-500 inline-flex items-center gap-2"><Icon name="refresh" className="w-3.5 h-3.5 animate-spin text-brand-400" /> SYNCING…</p>}

      {editing && (
        <div className="fixed inset-0 z-[95] grid place-items-center p-4">
          <button className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" onClick={() => setEditing(null)} aria-label="Close" />
          <div className="modal-in relative w-full max-w-lg hud-corners clip-card border border-brand-500/30 bg-ink-900 p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold tracking-[0.1em] text-fog-100">{draft.some((s) => s.id === editing.id) ? "EDIT OPERATOR" : "NEW OPERATOR"}</h2>
              <button onClick={() => setEditing(null)} className="clip-tag grid place-items-center w-9 h-9 border border-ink-600 text-fog-400 hover:text-blood-400 transition-colors" aria-label="Close">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">USERNAME *</span>
                <input className={`${inputCls} mt-1.5`} value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DISCORD</span>
                <input className={`${inputCls} mt-1.5`} value={editing.discord} onChange={(e) => setEditing({ ...editing, discord: e.target.value })} />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">ROLE *</span>
                <input className={`${inputCls} mt-1.5`} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. Events Lead" />
              </label>
              <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DEPARTMENT</span>
                <select className={`${inputCls} mt-1.5`} value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-5 font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PANEL PERMISSIONS</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PERMISSIONS.map((p) => {
                const on = editing.permissions.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setEditing({ ...editing, permissions: on ? editing.permissions.filter((x) => x !== p) : [...editing.permissions, p] })}
                    className={`clip-btn px-3.5 py-2 font-mono text-[10.5px] tracking-[0.14em] border transition-all ${on ? "border-brand-400 bg-brand-500/15 text-brand-300" : "border-ink-600 text-fog-500 hover:border-brand-500/40"}`}
                  >
                    {on ? "✓ " : ""}{p.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <div className="mt-7 flex gap-3">
              <button onClick={() => saveEditing(editing)} className="clip-btn flex-1 bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] py-3 hover:bg-brand-300 transition-colors">
                SAVE OPERATOR
              </button>
              <button onClick={() => setEditing(null)} className="clip-btn border border-ink-600 text-fog-300 font-display font-bold text-xs tracking-[0.16em] px-5 transition-colors">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= DISCORD ================= */

export function DiscordTab() {
  const { state, update } = useSite();
  const { toast } = useAdmin();
  const d = state.discord;
  const [enabled, setEnabled] = useState(d.enabled);
  const [guildId, setGuildId] = useState(d.guildId);
  const [roles, setRoles] = useState<Record<string, string>>({ ...d.roles });
  const [newToken, setNewToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dmEnabled, setDmEnabled] = useState(d.dmEnabled);
  const [dmTemplate, setDmTemplate] = useState(d.dmTemplate);
  const [testDmId, setTestDmId] = useState("");
  const [sendingDm, setSendingDm] = useState(false);

  useEffect(() => {
    setEnabled(d.enabled); setGuildId(d.guildId); setRoles({ ...d.roles });
    setDmEnabled(d.dmEnabled); setDmTemplate(d.dmTemplate);
  }, [d]);

  const save = async () => {
    setSaving(true);
    try {
      const patch: typeof d = { ...d, enabled, guildId: guildId.trim(), roles, dmEnabled, dmTemplate };
      if (newToken.trim()) {
        patch.tokenEnc = encryptToken(newToken.trim());
        patch.tokenSavedAt = new Date().toISOString();
      }
      await update({ discord: patch });
      setNewToken("");
      toast(`Discord settings saved${newToken.trim() ? " — bot token encrypted at rest" : ""}.`);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      const token = newToken.trim() || (d.tokenEnc ? decryptToken(d.tokenEnc) : "");
      if (!token) { toast("Enter a bot token first (or save one).", "error"); return; }
      const res = await testDiscordConnection(token);
      const log = [{ at: new Date().toISOString(), ok: res.ok, msg: res.ok ? "Test connection OK — bot identity verified." : res.message }, ...d.log].slice(0, 30);
      await update({ discord: { ...d, log } });
      if (res.ok) toast("Discord handshake successful — bot is valid.");
      else toast(res.message, "error");
    } catch {
      toast("Could not decrypt the stored token.", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">DISCORD INTEGRATION</h1>
      <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Automated role assignment on approval via Discord API v10. Token stored encrypted; never returned to the browser.</p>

      <div className="mt-6 hud-corners clip-card border border-ink-600 bg-ink-900 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display font-bold tracking-[0.12em] text-fog-100">AUTOMATION</h2>
            <p className="mt-1 text-sm text-fog-400">When ON, approving an application assigns the matching program role before marking it approved.</p>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`relative clip-btn w-16 h-8 border transition-colors ${enabled ? "bg-mint-500/20 border-mint-500/60" : "bg-ink-800 border-ink-600"}`}
            aria-label="Toggle Discord automation"
          >
            <span className={`absolute top-1 w-6 h-6 transition-all duration-200 ${enabled ? "left-9 bg-mint-400" : "left-1 bg-fog-500"}`} />
          </button>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">GUILD (SERVER) ID</span>
            <input className={`${inputCls} mt-1.5 font-mono`} value={guildId} onChange={(e) => setGuildId(e.target.value)} placeholder="e.g. 1122334455667788990" />
          </label>
          <div className="block">
            <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">BOT TOKEN</span>
            <div className="mt-1.5 flex gap-2">
              <input type="password" className={`${inputCls} font-mono`} value={newToken} onChange={(e) => setNewToken(e.target.value)} placeholder={d.tokenEnc ? "Stored — enter to replace" : "Paste bot token"} autoComplete="off" />
            </div>
            {d.tokenEnc && <p className="mt-1.5 font-mono text-[10px] text-mint-400/80">✓ Encrypted token on file {maskToken(d.tokenEnc.ct)} {d.tokenSavedAt && `· saved ${new Date(d.tokenSavedAt).toLocaleDateString()}`}</p>}
          </div>
        </div>

        <p className="mt-6 mb-2 font-mono text-[9.5px] tracking-[0.24em] text-fog-500">ROLE ID PER PROGRAM</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {state.programs.map((p) => (
            <label key={p.id} className="block">
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-fog-400">{p.title}</span>
              <input className={`${inputCls} mt-1.5 font-mono`} value={roles[p.id] ?? ""} onChange={(e) => setRoles((r) => ({ ...r, [p.id]: e.target.value }))} placeholder="Discord role ID" />
            </label>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => void save()} disabled={saving} className="clip-btn bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] px-6 py-3 hover:bg-brand-300 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            <Icon name={saving ? "refresh" : "save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> SAVE INTEGRATION
          </button>
          <button onClick={() => void test()} disabled={testing} className="clip-btn border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 font-display font-bold text-xs tracking-[0.16em] px-6 py-3 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            <Icon name={testing ? "refresh" : "radio"} className={`w-4 h-4 ${testing ? "animate-spin" : ""}`} /> TEST CONNECTION
          </button>
        </div>

        {/* welcome DM on approval */}
        <div className="mt-7 clip-tag border border-ink-600 bg-ink-850 p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">WELCOME DM ON APPROVAL</p>
              <p className="text-xs text-fog-500 mt-1">The bot DMs the applicant the moment you approve — roles + message in one strike.</p>
            </div>
            <button
              onClick={() => setDmEnabled((v) => !v)}
              className={`relative clip-btn w-16 h-8 border transition-colors ${dmEnabled ? "bg-mint-500/20 border-mint-500/60" : "bg-ink-800 border-ink-600"}`}
              aria-label="Toggle welcome DM"
            >
              <span className={`absolute top-1 w-6 h-6 transition-all duration-200 ${dmEnabled ? "left-9 bg-mint-400" : "left-1 bg-fog-500"}`} />
            </button>
          </div>

          {dmEnabled && (
            <>
              <textarea
                className={`${inputCls} mt-4 min-h-32 font-mono resize-y`}
                value={dmTemplate}
                onChange={(e) => setDmTemplate(e.target.value)}
                placeholder="Welcome to the knights, {name}! Your {program} application is approved…"
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] tracking-[0.2em] text-fog-500 mr-1">INSERT:</span>
                {DM_PLACEHOLDERS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setDmTemplate((t) => `${t}${t.endsWith(" ") || t.length === 0 ? "" : " "}${p.key}`)}
                    title={p.label}
                    className="clip-btn border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 font-mono text-[10px] tracking-wider px-2.5 py-1.5 transition-colors"
                  >
                    {p.key}
                  </button>
                ))}
              </div>
              {/* live preview */}
              <div className="mt-4 border border-ink-600 bg-ink-900 p-4">
                <p className="font-mono text-[9px] tracking-[0.24em] text-fog-500 mb-2">PREVIEW (sample applicant)</p>
                <p className="font-mono text-[11.5px] text-fog-300 whitespace-pre-wrap leading-relaxed">
                  {fillTemplate(dmTemplate || "(empty template)", {
                    name: "Yassine", program: "VALORANT", ref: "FUR-2026-482913",
                    discord: "yassine_knight", community: state.settings.communityName,
                  })}
                </p>
              </div>
              {/* test DM */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  className={`${inputCls} font-mono`}
                  value={testDmId}
                  onChange={(e) => setTestDmId(e.target.value)}
                  placeholder="Discord User ID to receive a test DM (your own)"
                />
                <button
                  onClick={() => {
                    if (!/^\d{16,22}$/.test(testDmId.trim())) { toast("Enter a valid Discord User ID (16–22 digits).", "error"); return; }
                    setSendingDm(true);
                    const token = newToken.trim() || (d.tokenEnc ? (() => { try { return decryptToken(d.tokenEnc!); } catch { return ""; } })() : "");
                    if (!token) { toast("Save a bot token first.", "error"); setSendingDm(false); return; }
                    void sendDiscordDM(token, testDmId.trim(), fillTemplate(dmTemplate, {
                      name: "TEST KNIGHT", program: "TEST PROGRAM", ref: "FUR-TEST",
                      discord: "test", community: state.settings.communityName,
                    })).then(async (res) => {
                      const log = [{ at: new Date().toISOString(), ok: res.ok, msg: res.ok ? `Test DM delivered to ${testDmId.trim()}.` : `Test DM failed: ${res.message}` }, ...d.log].slice(0, 30);
                      await update({ discord: { ...d, log } });
                      toast(res.ok ? "Test DM delivered — check your Discord inbox." : res.message, res.ok ? "success" : "error");
                      setSendingDm(false);
                    });
                  }}
                  disabled={sendingDm}
                  className="clip-btn border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 font-display font-bold text-[11px] tracking-[0.16em] px-5 py-2.5 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <Icon name={sendingDm ? "refresh" : "radio"} className={`w-4 h-4 ${sendingDm ? "animate-spin" : ""}`} /> SEND TEST DM
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 clip-tag border border-amberx-500/30 bg-amberx-500/5 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-amberx-400 mb-2">SAFETY DOCTRINE</p>
          <ul className="text-sm text-fog-300 space-y-1.5 leading-relaxed">
            <li>▸ Approve = assign role → only mark approved after Discord confirms (HTTP 2xx).</li>
            <li>▸ Any Discord/network failure keeps the applicant <span className="text-amberx-400">unapproved</span> and logs the error.</li>
            <li>▸ Rejection never removes Discord roles.</li>
            <li>▸ The token is encrypted with a keyed cipher before storage; only a masked hint is shown here.</li>
          </ul>
        </div>
      </div>

      {/* log */}
      <div className="mt-6 clip-card border border-ink-600 bg-ink-900 p-6">
        <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">DISCORD EVENT LOG</h2>
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {d.log.length === 0 ? (
            <p className="font-mono text-[11px] text-fog-500 py-4 text-center">No Discord events recorded yet.</p>
          ) : (
            d.log.map((l, i) => (
              <div key={i} className={`clip-tag border px-3.5 py-2.5 font-mono text-[11px] leading-relaxed ${l.ok ? "border-mint-500/30 text-mint-400/90 bg-mint-500/5" : "border-blood-500/30 text-blood-300 bg-blood-500/5"}`}>
                <span className="text-fog-500 mr-2">[{new Date(l.at).toLocaleString()}]</span>{l.msg}
              </div>
            ))
          )}
        </div>
      </div>

      {/* setup */}
      <div className="mt-6 clip-card border border-ink-600 bg-ink-900 p-6">
        <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">BOT SETUP INSTRUCTIONS</h2>
        <ol className="mt-4 space-y-2.5 text-sm text-fog-300 leading-relaxed list-decimal list-inside">
          <li>In the <span className="text-brand-300">Discord Developer Portal</span>, create an application → Bot → reset and copy the token.</li>
          <li>Enable the <span className="text-brand-300">Server Members Intent</span> under Bot settings.</li>
          <li>Invite the bot with scopes <span className="font-mono text-brand-300">bot</span> + <span className="font-mono text-brand-300">applications.commands</span> and permission <span className="font-mono text-brand-300">Manage Roles</span>.</li>
          <li>Move the FURSAN bot role <span className="text-amberx-400">above</span> the program roles in the role hierarchy.</li>
          <li>Enable Developer Mode in Discord → right-click server/roles → Copy IDs into the fields above.</li>
          <li>Save, then hit Test Connection.</li>
        </ol>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */

export function SettingsTab() {
  const { state, update } = useSite();
  const { toast, logout } = useAdmin();
  const s = state.settings;
  const [draft, setDraft] = useState(() => structuredClone(s));
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => { setDraft(structuredClone(s)); }, [s]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await update({ settings: { ...draft, memberCount: Math.max(0, Number(draft.memberCount) || 0), activePlayers: Math.max(0, Number(draft.activePlayers) || 0), teams: Math.max(0, Number(draft.teams) || 0), tournamentsWon: Math.max(0, Number(draft.tournamentsWon) || 0) } });
      toast("Settings published across the whole site.");
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast("New passwords do not match.", "error"); return; }
    const account = state.admins[0];
    if (!account) { toast("No admin account found in the database.", "error"); return; }
    setPwBusy(true);
    const res = await changeAdminPassword(account.username, pw.current, pw.next);
    setPwBusy(false);
    if (res.ok) {
      toast(res.message);
      setPw({ current: "", next: "", confirm: "" });
    } else {
      toast(res.message, "error");
    }
  };

  const num = (k: "memberCount" | "activePlayers" | "teams" | "tournamentsWon", label: string) => (
    <label className="block">
      <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">{label}</span>
      <input type="number" min={0} className={`${inputCls} mt-1.5 font-mono`} value={draft[k]} onChange={(e) => set(k, Number(e.target.value))} />
    </label>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">SITE SETTINGS</h1>
      <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Identity, numbers, links and security.</p>

      <div className="mt-6 hud-corners clip-card border border-ink-600 bg-ink-900 p-6">
        <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">IDENTITY & NUMBERS</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">COMMUNITY NAME</span>
            <input className={`${inputCls} mt-1.5`} value={draft.communityName} onChange={(e) => set("communityName", e.target.value)} />
          </label>
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">DISCORD INVITE URL</span>
            <input className={`${inputCls} mt-1.5 font-mono`} value={draft.discordInvite} onChange={(e) => set("discordInvite", e.target.value)} placeholder="https://discord.gg/…" />
          </label>
          {num("memberCount", "MEMBER COUNT")}
          {num("activePlayers", "ACTIVE PLAYERS")}
          {num("teams", "ESPORTS TEAMS")}
          {num("tournamentsWon", "TOURNAMENTS WON")}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 clip-tag border border-ink-600 bg-ink-850 px-4 py-3.5">
          <div>
            <p className="font-display font-bold text-sm tracking-[0.1em] text-fog-100">SERVER ONLINE INDICATOR</p>
            <p className="text-xs text-fog-500 mt-0.5">Shown as the live status dot in the hero and header areas.</p>
          </div>
          <button
            onClick={() => set("serverOnline", !draft.serverOnline)}
            className={`relative clip-btn w-16 h-8 border transition-colors shrink-0 ${draft.serverOnline ? "bg-mint-500/20 border-mint-500/60" : "bg-ink-800 border-ink-600"}`}
            aria-label="Toggle server online"
          >
            <span className={`absolute top-1 w-6 h-6 transition-all duration-200 ${draft.serverOnline ? "left-9 bg-mint-400" : "left-1 bg-fog-500"}`} />
          </button>
        </div>
      </div>

      <div className="mt-6 clip-card border border-ink-600 bg-ink-900 p-6">
        <h2 className="font-display font-bold tracking-[0.12em] text-fog-100 text-sm">SOCIAL LINKS</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {(Object.keys(draft.socials) as (keyof typeof draft.socials)[]).map((k) => (
            <label key={k} className="block">
              <span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">{k.toUpperCase()}</span>
              <input className={`${inputCls} mt-1.5 font-mono`} value={draft.socials[k]} onChange={(e) => set("socials", { ...draft.socials, [k]: e.target.value })} placeholder="https://…" />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">FOOTER ABOUT TEXT</span>
            <textarea className={`${inputCls} mt-1.5 min-h-20 resize-y`} value={draft.footerAbout} onChange={(e) => set("footerAbout", e.target.value)} />
          </label>
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">FOOTER TAGLINE</span>
            <input className={`${inputCls} mt-1.5`} value={draft.footerBuilt} onChange={(e) => set("footerBuilt", e.target.value)} />
          </label>
        </div>
        <button onClick={() => void save()} disabled={saving} className="mt-6 clip-btn bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] px-6 py-3 hover:bg-brand-300 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
          <Icon name={saving ? "refresh" : "save"} className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} /> PUBLISH SETTINGS
        </button>
      </div>

      <div className="mt-6 clip-card border border-blood-500/30 bg-ink-900 p-6">
        <h2 className="font-display font-bold tracking-[0.12em] text-blood-400 text-sm inline-flex items-center gap-2"><Icon name="lock" className="w-4 h-4" /> CHANGE ADMIN PASSWORD</h2>
        <form onSubmit={(e) => void changePw(e)} className="mt-4 grid sm:grid-cols-3 gap-4">
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CURRENT</span>
            <input type="password" className={`${inputCls} mt-1.5 font-mono`} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </label>
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">NEW (min 8)</span>
            <input type="password" className={`${inputCls} mt-1.5 font-mono`} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </label>
          <label className="block"><span className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">CONFIRM NEW</span>
            <input type="password" className={`${inputCls} mt-1.5 font-mono`} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          </label>
          <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={pwBusy || !pw.current || !pw.next} className="clip-btn bg-blood-500 text-white font-display font-bold text-xs tracking-[0.16em] px-6 py-3 hover:bg-blood-400 transition-colors disabled:opacity-40 inline-flex items-center gap-2">
              <Icon name={pwBusy ? "refresh" : "lock"} className={`w-4 h-4 ${pwBusy ? "animate-spin" : ""}`} /> ROTATE CREDENTIALS
            </button>
            <button type="button" onClick={logout} className="font-mono text-[10.5px] tracking-[0.18em] text-fog-500 hover:text-blood-300 transition-colors">END SESSION →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
