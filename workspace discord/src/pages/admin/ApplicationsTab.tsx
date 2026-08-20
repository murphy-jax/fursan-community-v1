import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, StatusBadge } from "../../components/ui";
import { useSite } from "../../state/SiteContext";
import {
  assignDiscordRole, decryptToken, deleteApplication, fillTemplate, isValidDiscordId,
  sendDiscordDM, updateApplication,
} from "../../lib/backend";
import type { Application, AppStatus } from "../../lib/backend";
import { useAdmin } from "./adminCtx";

const PAGE_SIZE = 8;

const FIELD_LABELS: [keyof Application["data"], string][] = [
  ["fullName", "FULL NAME"],
  ["discordUsername", "DISCORD USERNAME"],
  ["discordId", "DISCORD USER ID"],
  ["age", "AGE"],
  ["country", "COUNTRY / TIMEZONE"],
  ["platform", "PLATFORM"],
  ["playerId", "PLAYER / GAME ID"],
  ["currentRank", "CURRENT RANK"],
  ["peakRank", "PEAK RANK"],
  ["mainRole", "MAIN ROLE / AGENTS"],
  ["previousTeams", "PREVIOUS TEAMS"],
  ["availability", "AVAILABILITY"],
];

export default function ApplicationsTab() {
  const { state, update, apps: liveApps, appsReady, refreshApps } = useSite();
  const { toast } = useAdmin();
  const apps = liveApps;
  const loading = !appsReady;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AppStatus>("all");
  const [program, setProgram] = useState("all");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => { await refreshApps(); }, [refreshApps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = apps.filter((a) => a.type === "esports");
    if (status !== "all") rows = rows.filter((a) => a.status === status);
    if (program !== "all") rows = rows.filter((a) => a.program === program);
    if (q) {
      rows = rows.filter((a) =>
        [a.ref, a.data.fullName, a.data.discordUsername, a.data.discordId, a.program]
          .some((v) => String(v ?? "").toLowerCase().includes(q))
      );
    }
    rows = [...rows].sort((a, b) =>
      sort === "new"
        ? +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(a.created_at) - +new Date(b.created_at)
    );
    return rows;
  }, [apps, query, status, program, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const selected = apps.find((a) => a.id === selectedId) ?? null;

  const counts = useMemo(() => ({
    all: apps.filter((a) => a.type === "esports").length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  const programTitle = (id: string) => state.programs.find((p) => p.id === id)?.title ?? id.toUpperCase();

  /* ---------- actions ---------- */

  const pushLog = (ok: boolean, msg: string) => {
    const log = [{ at: new Date().toISOString(), ok, msg }, ...state.discord.log].slice(0, 30);
    void update({ discord: { ...state.discord, log } });
  };

  const setStatusAction = async (app: Application, next: AppStatus) => {
    setBusy(true);
    try {
      if (next === "approved") {
        const d = state.discord;
        const roleId = d.roles[app.program];
        let token = "";
        if (d.tokenEnc) {
          try { token = decryptToken(d.tokenEnc); } catch { /* bad envelope */ }
        }

        /* 1) ROLE GATE — if automation is fully configured, Discord must confirm first */
        if (d.enabled && token && d.guildId && roleId) {
          const res = await assignDiscordRole(token, d.guildId, app.data.discordId, roleId);
          if (!res.ok) {
            await updateApplication(app.id, { discord: { ...app.discord, lastError: res.message, lastAttempt: new Date().toISOString() } });
            pushLog(false, `${app.ref}: role not assigned — ${res.message}`);
            toast(`Discord blocked approval: ${res.message}`, "error");
            setBusy(false);
            return;
          }
          pushLog(true, `Role assigned → ${app.ref} (${app.data.discordUsername})`);
        } else if (d.enabled && !token) {
          toast("Stored Discord token could not be decrypted. Applicant left unapproved.", "error");
          setBusy(false);
          return;
        }

        /* 2) WELCOME DM — best effort, never blocks the approval */
        let dmNote = "";
        if (d.dmEnabled && token && app.data.discordId) {
          const programTitle = state.programs.find((p) => p.id === app.program)?.title ?? app.program.toUpperCase();
          const content = fillTemplate(d.dmTemplate || "", {
            name: app.data.fullName || "knight",
            program: programTitle,
            ref: app.ref,
            discord: app.data.discordUsername,
            community: state.settings.communityName,
          });
          const dm = await sendDiscordDM(token, app.data.discordId, content);
          pushLog(dm.ok, dm.ok ? `Welcome DM sent → ${app.ref} (${app.data.discordUsername})` : `DM failed for ${app.ref}: ${dm.message}`);
          dmNote = dm.ok ? " · welcome DM delivered" : ` · DM failed: ${dm.message}`;
        }

        /* 3) MARK APPROVED */
        await updateApplication(app.id, {
          status: "approved",
          discord: { ...app.discord, roleId: roleId || undefined, synced: true, lastError: undefined, lastAttempt: new Date().toISOString() },
        });
        toast(`Approved — ${app.data.discordUsername}${dmNote}.`);
        setBusy(false);
        return;
      }
      await updateApplication(app.id, { status: next });
      if (next === "rejected") {
        toast(`Application ${app.ref} rejected. No Discord roles were touched.`);
      } else {
        toast(`Application ${app.ref} marked ${next}.`);
      }
    } catch (e) {
      toast(`Update failed: ${(e as Error).message}`, "error");
    } finally {
      setBusy(false);
      void load();
    }
  };

  const saveDiscordId = async (app: Application, newId: string) => {
    if (!isValidDiscordId(newId)) { toast("Discord User ID must be 16–22 digits.", "error"); return; }
    try {
      await updateApplication(app.id, { data: { ...app.data, discordId: newId.trim() } });
      toast("Discord User ID updated.");
      void load();
    } catch (e) { toast(`Save failed: ${(e as Error).message}`, "error"); }
  };

  const saveNotes = async (app: Application, notes: string) => {
    try {
      await updateApplication(app.id, { notes });
      toast("Internal notes saved (private — never public).");
      void load();
    } catch (e) { toast(`Save failed: ${(e as Error).message}`, "error"); }
  };

  const doDelete = async (app: Application) => {
    try {
      await deleteApplication(app.id);
      toast(`Application ${app.ref} deleted permanently.`, "info");
      setSelectedId(null);
      setConfirmDelete(false);
      void load();
    } catch (e) { toast(`Delete failed: ${(e as Error).message}`, "error"); }
  };

  /* ---------- render ---------- */

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">ESPORTS APPLICATIONS</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-fog-500">Pure esports pipeline — every submission syncs here live for all operators.</p>
        </div>
        <button onClick={() => { void load(); }} className="clip-btn border border-ink-600 text-fog-300 hover:text-brand-300 hover:border-brand-500/50 px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] inline-flex items-center gap-2 transition-colors">
          <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> REFRESH
        </button>
      </div>

      {/* summary chips */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([["all", "TOTAL", "fog"], ["pending", "PENDING", "amberx"], ["approved", "APPROVED", "mint"], ["rejected", "REJECTED", "blood"]] as const).map(([key, label, tone]) => (
          <button
            key={key}
            onClick={() => { setStatus(key as "all" | AppStatus); setPage(0); }}
            className={`clip-card border p-4 text-left transition-all ${status === key ? (tone === "blood" ? "border-blood-500/60 bg-blood-500/10" : tone === "mint" ? "border-mint-500/60 bg-mint-500/10" : tone === "amberx" ? "border-amberx-500/60 bg-amberx-500/10" : "border-brand-500/60 bg-brand-500/10") : "border-ink-600 bg-ink-900 hover:border-ink-500"}`}
          >
            <p className={`font-display font-bold text-3xl ${tone === "blood" ? "text-blood-400" : tone === "mint" ? "text-mint-400" : tone === "amberx" ? "text-amberx-400" : "text-fog-100"}`}>{counts[key as keyof typeof counts]}</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.24em] text-fog-400">{label}</p>
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="mt-5 clip-card border border-ink-600 bg-ink-900 p-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fog-500" />
          <input className="hud-input pl-10 font-mono text-sm" placeholder="Search ref, name, Discord…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
        </div>
        <select className="hud-input lg:w-44 font-mono text-sm" value={program} onChange={(e) => { setProgram(e.target.value); setPage(0); }}>
          <option value="all">ALL PROGRAMS</option>
          {state.programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select className="hud-input lg:w-40 font-mono text-sm" value={status} onChange={(e) => { setStatus(e.target.value as "all" | AppStatus); setPage(0); }}>
          <option value="all">ALL STATUS</option>
          <option value="pending">PENDING</option>
          <option value="approved">APPROVED</option>
          <option value="rejected">REJECTED</option>
        </select>
        <select className="hud-input lg:w-40 font-mono text-sm" value={sort} onChange={(e) => setSort(e.target.value as "new" | "old")}>
          <option value="new">NEWEST FIRST</option>
          <option value="old">OLDEST FIRST</option>
        </select>
      </div>

      {/* list */}
      <div className="mt-5 clip-card border border-ink-600 bg-ink-900 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-mono text-[12px] tracking-[0.2em] text-fog-400">
            <Icon name="refresh" className="w-6 h-6 animate-spin mx-auto text-brand-400" />
            <p className="mt-3">DECRYPTING QUEUE…</p>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-14 text-center">
            <Icon name="doc" className="w-10 h-10 mx-auto text-fog-500" />
            <p className="mt-4 font-display font-bold text-fog-200 tracking-[0.1em]">NO APPLICATIONS IN THIS VIEW</p>
            <p className="mt-2 font-mono text-[11px] text-fog-500">New submissions appear here instantly via realtime sync.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left">
                {["REFERENCE", "PLAYER", "PROGRAM", "STATUS", "SUBMITTED", ""].map((h) => (
                  <th key={h} className="px-4 sm:px-5 py-3.5 font-mono text-[10px] tracking-[0.22em] text-fog-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr key={a.id} className="border-b border-ink-800 hover:bg-ink-850 transition-colors cursor-pointer group" onClick={() => { setSelectedId(a.id); setConfirmDelete(false); }}>
                  <td className="px-4 sm:px-5 py-4 font-mono text-brand-300 text-xs">{a.ref}</td>
                  <td className="px-4 sm:px-5 py-4">
                    <p className="font-semibold text-fog-100">{a.data.fullName}</p>
                    <p className="font-mono text-[10.5px] text-fog-500">@{a.data.discordUsername}</p>
                  </td>
                  <td className="px-4 sm:px-5 py-4 font-mono text-[11px] text-fog-300 tracking-wider">{programTitle(a.program)}</td>
                  <td className="px-4 sm:px-5 py-4">
                    <StatusChip status={a.status} />
                  </td>
                  <td className="px-4 sm:px-5 py-4 font-mono text-[11px] text-fog-400">{new Date(a.created_at).toLocaleDateString()} {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 sm:px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.18em] text-fog-500 group-hover:text-brand-300 transition-colors">
                      OPEN <Icon name="chevronRight" className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[11px] text-fog-500 tracking-wider">
            PAGE {safePage + 1} / {pages} · {filtered.length} RECORDS
          </p>
          <div className="flex gap-2">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="clip-btn border border-ink-600 p-2.5 text-fog-300 hover:border-brand-500/50 hover:text-brand-300 disabled:opacity-30 transition-colors" aria-label="Previous page">
              <Icon name="chevronLeft" className="w-4 h-4" />
            </button>
            <button disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} className="clip-btn border border-ink-600 p-2.5 text-fog-300 hover:border-brand-500/50 hover:text-brand-300 disabled:opacity-30 transition-colors" aria-label="Next page">
              <Icon name="chevronRight" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* detail drawer */}
      {selected && (
        <DetailDrawer
          app={selected}
          programTitle={programTitle(selected.program)}
          busy={busy}
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          onClose={() => setSelectedId(null)}
          onStatus={(s) => void setStatusAction(selected, s)}
          onDiscordId={(v) => void saveDiscordId(selected, v)}
          onNotes={(v) => void saveNotes(selected, v)}
          onDelete={() => void doDelete(selected)}
          discordConfigured={Boolean(state.discord.enabled && state.discord.tokenEnc && state.discord.guildId && state.discord.roles[selected.program])}
          dmEnabled={state.discord.dmEnabled}
        />
      )}
    </div>
  );
}

function StatusChip({ status }: { status: AppStatus }) {
  const map = {
    pending: "border-amberx-500/50 text-amberx-400 bg-amberx-500/10",
    approved: "border-mint-500/50 text-mint-400 bg-mint-500/10",
    rejected: "border-blood-500/50 text-blood-400 bg-blood-500/10",
  } as const;
  return <span className={`clip-tag inline-block border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] uppercase ${map[status]}`}>{status}</span>;
}

function DetailDrawer(props: {
  app: Application;
  programTitle: string;
  busy: boolean;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  onClose: () => void;
  onStatus: (s: AppStatus) => void;
  onDiscordId: (v: string) => void;
  onNotes: (v: string) => void;
  onDelete: () => void;
  discordConfigured: boolean;
  dmEnabled: boolean;
}) {
  const { app } = props;
  const [discordId, setDiscordId] = useState(app.data.discordId);
  const [notes, setNotes] = useState(app.notes);

  useEffect(() => {
    setDiscordId(app.data.discordId);
    setNotes(app.notes);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [app]);

  return (
    <div className="fixed inset-0 z-[95] flex justify-end">
      <button className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={props.onClose} aria-label="Close details" />
      <div className="modal-in relative w-full max-w-xl bg-ink-900 border-l border-ink-600 h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur border-b border-ink-700 p-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-brand-400">APPLICATION DOSSIER</p>
            <div className="mt-1.5 flex items-center gap-3 flex-wrap">
              <h2 className="font-display font-bold text-xl text-fog-100">{app.data.fullName}</h2>
              <StatusChip status={app.status} />
            </div>
            <p className="mt-1 font-mono text-[11px] text-fog-500">{app.ref} · {props.programTitle} · {new Date(app.created_at).toLocaleString()}</p>
          </div>
          <button onClick={props.onClose} className="clip-tag grid place-items-center w-9 h-9 border border-ink-600 text-fog-400 hover:text-blood-400 hover:border-blood-500/50 transition-colors" aria-label="Close">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {app.discord.lastError && (
            <div className="clip-tag border border-blood-500/50 bg-blood-500/10 p-3.5 text-xs text-blood-300 leading-relaxed">
              <span className="font-mono tracking-[0.2em] block mb-1">DISCORD SYNC FAILED</span>
              {app.discord.lastError} · {app.discord.lastAttempt ? new Date(app.discord.lastAttempt).toLocaleString() : ""}
            </div>
          )}
          {app.discord.synced && (
            <div className="clip-tag border border-mint-500/50 bg-mint-500/10 p-3.5 text-xs text-mint-400 font-mono tracking-wider">
              ✓ DISCORD ROLE ASSIGNED & CONFIRMED
            </div>
          )}

          {/* status actions */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500 mb-2.5">DECISION</p>
            <div className="grid grid-cols-3 gap-2.5">
              <button disabled={props.busy || app.status === "approved"} onClick={() => props.onStatus("approved")} className="clip-btn border border-mint-500/50 text-mint-400 hover:bg-mint-500/10 disabled:opacity-30 py-3 font-display font-bold text-[11.5px] tracking-[0.14em] transition-colors">
                APPROVE
              </button>
              <button disabled={props.busy || app.status === "rejected"} onClick={() => props.onStatus("rejected")} className="clip-btn border border-blood-500/50 text-blood-400 hover:bg-blood-500/10 disabled:opacity-30 py-3 font-display font-bold text-[11.5px] tracking-[0.14em] transition-colors">
                REJECT
              </button>
              <button disabled={props.busy || app.status === "pending"} onClick={() => props.onStatus("pending")} className="clip-btn border border-amberx-500/50 text-amberx-400 hover:bg-amberx-500/10 disabled:opacity-30 py-3 font-display font-bold text-[11.5px] tracking-[0.14em] transition-colors">
                PENDING
              </button>
            </div>
            {props.discordConfigured && app.status !== "approved" && (
              <p className="mt-2.5 font-mono text-[10px] text-fog-500 leading-relaxed">
                ▸ Discord automation is ON — approving assigns the program role via Discord API v10 (approval only after Discord confirms)
                {props.dmEnabled && " and sends the configured welcome DM"}. Rejection never removes roles.
              </p>
            )}
          </div>

          {/* discord id */}
          <div className="clip-card border border-ink-600 bg-ink-850 p-4">
            <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500 mb-2">EDIT DISCORD USER ID</p>
            <div className="flex gap-2">
              <input className={`hud-input font-mono ${isValidDiscordId(discordId) ? "" : "invalid"}`} value={discordId} onChange={(e) => setDiscordId(e.target.value)} maxLength={22} />
              <button onClick={() => props.onDiscordId(discordId)} className="clip-btn bg-brand-500 text-ink-950 font-display font-bold text-[11px] tracking-[0.14em] px-4 hover:bg-brand-300 transition-colors shrink-0">
                SAVE
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-fog-500">16–22 digits. Used for Discord role automation.</p>
          </div>

          {/* notes */}
          <div className="clip-card border border-ink-600 bg-ink-850 p-4">
            <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500 mb-2">INTERNAL NOTES (PRIVATE)</p>
            <textarea className="hud-input min-h-24 resize-y font-mono text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Staff-only observations, trial results, VOD links…" maxLength={2000} />
            <div className="mt-2.5 text-right">
              <button onClick={() => props.onNotes(notes)} className="clip-btn border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 font-display font-bold text-[11px] tracking-[0.14em] px-4 py-2 transition-colors">
                SAVE NOTES
              </button>
            </div>
          </div>

          {/* full data */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500 mb-3">SUBMITTED DATA</p>
            <div className="grid sm:grid-cols-2 gap-px bg-ink-700 border border-ink-700">
              {FIELD_LABELS.map(([key, label]) => (
                <div key={key} className="bg-ink-900 p-3.5">
                  <p className="font-mono text-[9.5px] tracking-[0.22em] text-fog-500">{label}</p>
                  <p className="mt-1 text-sm text-fog-200 break-words">{app.data[key] || <span className="text-fog-500">—</span>}</p>
                </div>
              ))}
            </div>
            {[["COMPETITIVE EXPERIENCE", app.data.compExperience], ["TOURNAMENT EXPERIENCE", app.data.tournamentExperience], ["WHY FURSAN", app.data.whyFursan], ["ADDITIONAL INFO", app.data.additionalInfo]].map(([label, val]) => (
              <div key={label as string} className="mt-3 clip-card border border-ink-600 bg-ink-900 p-4">
                <p className="font-mono text-[9.5px] tracking-[0.22em] text-fog-500">{label}</p>
                <p className="mt-1.5 text-sm text-fog-200 leading-relaxed whitespace-pre-wrap">{val || <span className="text-fog-500">—</span>}</p>
              </div>
            ))}
          </div>

          {/* delete */}
          <div className="clip-card border border-blood-500/30 bg-blood-500/5 p-4">
            {!props.confirmDelete ? (
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] text-fog-400 tracking-wider">Permanently delete this record?</p>
                <button onClick={() => props.setConfirmDelete(true)} className="clip-btn border border-blood-500/50 text-blood-400 hover:bg-blood-500/10 font-display font-bold text-[11px] tracking-[0.14em] px-4 py-2 transition-colors inline-flex items-center gap-2">
                  <Icon name="trash" className="w-4 h-4" /> DELETE
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-blood-300 font-semibold">This cannot be undone. Delete {app.ref} forever?</p>
                <div className="mt-3 flex gap-2.5">
                  <button onClick={props.onDelete} className="clip-btn bg-blood-500 text-white font-display font-bold text-[11px] tracking-[0.14em] px-5 py-2.5 hover:bg-blood-400 transition-colors">
                    YES — ERASE RECORD
                  </button>
                  <button onClick={() => props.setConfirmDelete(false)} className="clip-btn border border-ink-600 text-fog-300 font-display font-bold text-[11px] tracking-[0.14em] px-5 py-2.5 transition-colors">
                    KEEP IT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { StatusBadge };
