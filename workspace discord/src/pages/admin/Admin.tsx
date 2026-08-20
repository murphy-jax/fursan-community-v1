import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FursanLogo, Icon } from "../../components/ui";
import { useSite } from "../../state/SiteContext";
import { loginAdmin } from "../../lib/backend";
import { AdminContext } from "./adminCtx";
import type { ToastMsg } from "./adminCtx";
import ApplicationsTab from "./ApplicationsTab";
import ContentTab from "./ContentTab";
import { DashboardTab, DiscordTab, EsportsTab, SettingsTab, StaffTab, TournamentsTab } from "./ManageTabs";

const SESSION_KEY = "fursan_admin_session";

interface Session { username: string; token: string; exp: number; }

function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.token || Date.now() > s.exp) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch { return null; }
}

const TABS = [
  { id: "dashboard", label: "DASHBOARD", icon: "server" },
  { id: "applications", label: "APPLICATIONS", icon: "doc" },
  { id: "esports", label: "ESPORTS MGMT", icon: "trophy" },
  { id: "tournaments", label: "TOURNAMENTS", icon: "bracket" },
  { id: "content", label: "CONTENT", icon: "edit" },
  { id: "staff", label: "STAFF", icon: "users" },
  { id: "discord", label: "DISCORD", icon: "discord" },
  { id: "settings", label: "SETTINGS", icon: "gear" },
];

export default function Admin() {
  const { state, dbOnline, refresh, ready, syncStatus, lastSyncAt } = useSite();
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [tab, setTab] = useSearchParams();
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const active = tab.get("tab") ?? "dashboard";
  const go = (id: string) => setTab(id === "dashboard" ? {} : { tab: id }, { replace: true });

  const toast = useCallback((text: string, kind: ToastMsg["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    toast("Session terminated. Stay sharp, knight.", "info");
  }, [toast]);

  const ctx = useMemo(() => ({ toast, logout }), [toast, logout]);

  if (!session) {
    return (
      <AdminContext.Provider value={ctx}>
        <LoginScreen onLogin={(username) => {
          const s: Session = { username, token: crypto.randomUUID(), exp: Date.now() + 12 * 3600 * 1000 };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
          setSession(s);
          toast(`Access granted. Welcome back, ${username.toUpperCase()}.`);
        }} />
        <ToastStack toasts={toasts} />
      </AdminContext.Provider>
    );
  }

  return (
    <AdminContext.Provider value={ctx}>
      <div className="min-h-screen bg-ink-950 pt-16">
        <div className="mx-auto max-w-[90rem] flex">
          {/* sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-ink-700 bg-ink-900/60 min-h-[calc(100vh-4rem)] sticky top-16 self-start">
            <div className="p-5 border-b border-ink-700">
              <p className="font-mono text-[10px] tracking-[0.3em] text-brand-400">COMMAND CENTRE</p>
              <p className="mt-1 font-display font-bold text-fog-100 tracking-[0.1em]">{state.settings.communityName}</p>
              <p className="mt-2 flex items-center gap-2 font-mono text-[10px] text-fog-500">
                <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === "live" ? "bg-mint-400 pulse-dot" : syncStatus === "polling" ? "bg-amberx-400 pulse-dot" : "bg-blood-400"}`} />
                {syncStatus === "live" ? "REALTIME · LIVE FOR ALL" : syncStatus === "polling" ? "POLLING FALLBACK" : "DB OFFLINE"}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <p className="font-mono text-[9px] text-fog-500">
                  {lastSyncAt ? `SYNCED ${new Date(lastSyncAt).toLocaleTimeString()}` : "SYNCING…"}
                </p>
                <button onClick={() => void refresh()} className="font-mono text-[9px] tracking-[0.18em] text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1">
                  <Icon name="refresh" className="w-3 h-3" /> FORCE SYNC
                </button>
              </div>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 clip-btn font-display text-[12.5px] font-semibold tracking-[0.14em] transition-all ${
                    active === t.id
                      ? "bg-brand-500/12 text-brand-300 border border-brand-500/40 shadow-[inset_2px_0_0_rgba(227,178,60,0.85)]"
                      : "text-fog-400 border border-transparent hover:text-fog-100 hover:bg-ink-800"
                  }`}
                >
                  <Icon name={t.icon} className="w-4.5 h-4.5" /> {t.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-ink-700 space-y-1">
              <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 clip-btn font-display text-[12.5px] font-semibold tracking-[0.14em] text-fog-400 hover:text-fog-100 hover:bg-ink-800 transition-all">
                <Icon name="external" className="w-4.5 h-4.5" /> VIEW SITE
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 clip-btn font-display text-[12.5px] font-semibold tracking-[0.14em] text-blood-400 hover:bg-blood-500/10 transition-all">
                <Icon name="lock" className="w-4.5 h-4.5" /> LOGOUT
              </button>
            </div>
          </aside>

          {/* main */}
          <main className="flex-1 min-w-0">
            {/* mobile tabs */}
            <div className="lg:hidden sticky top-16 z-30 bg-ink-950/95 backdrop-blur border-b border-ink-700 overflow-x-auto">
              <div className="flex px-2 py-2 gap-1.5 min-w-max">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => go(t.id)}
                    className={`clip-btn px-3.5 py-2 font-display text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap border transition-colors ${
                      active === t.id ? "bg-brand-500/12 text-brand-300 border-brand-500/40" : "text-fog-400 border-ink-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <button onClick={logout} className="clip-btn px-3.5 py-2 font-display text-[11px] font-semibold tracking-[0.12em] text-blood-400 border border-ink-600">
                  LOGOUT
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {!ready && (
                <div className="mb-6 flex items-center gap-3 clip-tag border border-ink-600 bg-ink-900 px-4 py-3 font-mono text-[11px] tracking-wider text-fog-400">
                  <Icon name="refresh" className="w-4 h-4 animate-spin text-brand-400" /> SYNCING WITH CLOUD DATABASE…
                </div>
              )}
              {active === "dashboard" && <DashboardTab go={go} />}
              {active === "applications" && <ApplicationsTab />}
              {active === "esports" && <EsportsTab />}
              {active === "tournaments" && <TournamentsTab />}
              {active === "content" && <ContentTab />}
              {active === "staff" && <StaffTab />}
              {active === "discord" && <DiscordTab />}
              {active === "settings" && <SettingsTab />}
            </div>
          </main>
        </div>
      </div>
      <ToastStack toasts={toasts} />
    </AdminContext.Provider>
  );
}

/* ---------------- login ---------------- */

function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) { setError("Enter both username and password."); return; }
    setBusy(true);
    const res = await loginAdmin(username, password);
    setBusy(false);
    if (res.ok) onLogin(res.username);
    else setError(res.message);
  };

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-24 overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,178,60,0.07),transparent_55%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] max-w-[90vw] opacity-[0.07] pointer-events-none">
        <FursanLogo src="" className="w-full aspect-square" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="hud-corners clip-card border border-ink-600 bg-ink-900/95 p-8 sm:p-10 modal-in">
          <div className="absolute top-0 inset-x-0 metal-line" />
          <div className="flex items-center gap-4">
            <span className="clip-tag grid place-items-center w-12 h-12 border border-blood-500/50 bg-blood-500/10 text-blood-400">
              <Icon name="lock" className="w-6 h-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-blood-400">RESTRICTED ACCESS</p>
              <h1 className="font-display font-bold text-2xl text-fog-100 tracking-[0.06em]">ADMIN LOGIN</h1>
            </div>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block">
              <span className="font-mono text-[10.5px] tracking-[0.24em] text-fog-400">OPERATOR ID</span>
              <input
                className="hud-input mt-1.5 font-mono"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10.5px] tracking-[0.24em] text-fog-400">PASSKEY</span>
              <div className="relative mt-1.5">
                <input
                  type={show ? "text" : "password"}
                  className="hud-input font-mono pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-fog-500 hover:text-brand-300 transition-colors" aria-label="Toggle password visibility">
                  <Icon name={show ? "eyeOff" : "eye"} className="w-4.5 h-4.5" />
                </button>
              </div>
            </label>

            {error && (
              <div className="clip-tag border border-blood-500/50 bg-blood-500/10 px-4 py-3 text-sm text-blood-300 flex items-center gap-2.5">
                <Icon name="alert" className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="clip-btn w-full bg-blood-500 text-white font-display font-bold tracking-[0.18em] text-sm py-3.5 hover:bg-blood-400 transition-all disabled:opacity-50 shadow-[0_0_24px_rgba(217,30,46,0.3)]"
            >
              {busy ? "VERIFYING…" : "AUTHENTICATE"}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-ink-700 space-y-2">
            <p className="font-mono text-[10px] text-fog-500 leading-relaxed tracking-wider">
              ▸ Sessions are hashed (iterated SHA-256 + salt) and rate-limited after 5 failures.
            </p>
            <p className="font-mono text-[10px] text-fog-500 leading-relaxed tracking-wider">
              ▸ First run? Seed credentials live in <span className="text-brand-400">.env.example</span> / README — change them immediately in Settings.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center">
          <Link to="/" className="font-mono text-[11px] tracking-[0.2em] text-fog-400 hover:text-brand-300 transition-colors inline-flex items-center gap-2">
            <Icon name="chevronLeft" className="w-3.5 h-3.5" /> RETURN TO SITE
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ---------------- toasts ---------------- */

function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2.5 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in clip-btn flex items-start gap-3 px-4 py-3.5 border text-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
            t.kind === "success"
              ? "bg-ink-900 border-mint-500/50 text-mint-400"
              : t.kind === "error"
              ? "bg-ink-900 border-blood-500/50 text-blood-300"
              : "bg-ink-900 border-brand-500/50 text-brand-300"
          }`}
        >
          <Icon name={t.kind === "success" ? "check" : t.kind === "error" ? "alert" : "radio"} className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span className="text-fog-200 leading-snug">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
