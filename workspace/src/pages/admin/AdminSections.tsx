import { useEffect, useMemo, useState } from "react";
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
            push("success", `${title} saved — the public Esports page is already updated.`);
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
            push("success", `${name} saved — the public ${dep.id.toUpperCase()} page is already updated.`);
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
      <PanelTitle title="Staff Management" sub={`${db.staff.length} staff members on record`} />
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
                        className={`flex items-center gap-2 px-3 py-2.5 border text-left text-sm transition-colors ${on ? "border-gold/60 bg-gold/10 text-goldsoft" : "border-bone/15 text-ash hover:border-bone/30"}`}
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
              className={`relative w-14 h-7 cut-sm border transition-colors ${draft.enabled ? "bg-gold/30 border-gold" : "bg-ink border-bone/20"}`}
              aria-label="Toggle automation"
            >
              <span
                className={`absolute top-[3px] transition-all duration-300 ${draft.enabled ? "left-[30px] bg-gold" : "left-[3px] bg-ash"}`}
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
            <div className={`cut-sm px-4 py-3 border text-sm ${draft.lastTest.ok ? "border-emerald-400/40 bg-emerald-950/40 text-emerald-200" : "border-red-500/50 bg-red-950/40 text-red-200"}`}>
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
                className={`cut-sm w-full px-4 py-3 border font-cond uppercase tracking-[0.16em] text-xs transition-colors ${draft.serverOnline ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-red-500/50 bg-red-500/10 text-red-300"}`}
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
                  <TextInput value={draft.socials[k]} onChange={(e) => setDraft({ ...draft, socials: { ...draft.socials, [k]: e.target.value } })} placeholder={`https://${k}.com/fursan`} />
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
                  push("success", `${res.name} saved — ${res.files} files.`);
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
