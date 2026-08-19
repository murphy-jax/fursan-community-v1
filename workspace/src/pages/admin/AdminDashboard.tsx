import { useCallback, useEffect, useState } from "react";
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 mb-1 font-cond uppercase tracking-[0.16em] text-[12px] transition-all border-l-2 ${
                tab === n.id
                  ? "text-goldsoft border-gold bg-gold/8"
                  : "text-ash border-transparent hover:text-bone hover:bg-bone/[0.03]"
              }`}
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
      <PanelTitle title="Dashboard" sub={`Operational overview · ${db.settings.communityName} · ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="panel cut p-5">
            <c.icon className={`w-6 h-6 ${c.tone.split(" ")[0]} mb-4`} />
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
                    <p className="text-xs text-ash font-mono">{a.ref} · {TYPE_LABEL[a.type]}{a.program ? ` · ${a.program}` : ""}</p>
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
      <PanelTitle title="Applications" sub={`${result.total} record${result.total === 1 ? "" : "s"} · search, filter, review and decide`} />

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
                  <span className="text-xs text-ash">{TYPE_LABEL[selected.type]}{selected.program ? ` · ${selected.program}` : ""}</span>
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
