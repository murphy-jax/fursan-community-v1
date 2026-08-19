import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import * as api from "../../lib/api";
import { Btn, Field, IconArrow, IconLock, IconShield, TextInput } from "../../components/ui";

export default function AdminLogin() {
  const { db, session, sessionChecked, refreshSession } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (sessionChecked && session) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.login(username, password);
      await refreshSession();
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src={db.images.homeHero} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/90 to-ink" />
      </div>
      <div className="absolute inset-0 texture-grid" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] glow-red opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src={db.images.logo} alt="FURSAN logo" className="h-24 w-24 object-contain mx-auto mix-blend-screen" />
          <h1 className="font-display text-4xl tracking-[0.1em] mt-2">COMMAND CENTER</h1>
          <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold/80 mt-1">Restricted · Staff Only</p>
        </div>

        <div className="gold-frame cut scanline relative overflow-hidden p-8">
          {error && (
            <div className="cut-sm mb-6 px-4 py-3 border border-red-500/50 bg-red-950/40 text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <Field label="Username" required>
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
              />
            </Field>
            <Field label="Password" required>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••"
              />
            </Field>
            <Btn type="submit" busy={busy} className="w-full">
              <IconLock className="w-4 h-4" /> Authenticate
            </Btn>
          </form>

          <div className="mt-6 pt-6 border-t border-bone/10 flex items-center justify-between text-xs text-ash">
            <span className="flex items-center gap-2">
              <IconShield className="w-4 h-4 text-gold" />
              Protected route · rate-limited · bcrypt-hashed
            </span>
          </div>
        </div>

        <Link to="/" className="mt-6 inline-flex items-center gap-2 font-cond uppercase tracking-[0.2em] text-xs text-ash hover:text-gold transition-colors">
          <IconArrow className="w-4 h-4 rotate-180" /> Back to website
        </Link>
        <p className="mt-3 text-[11px] text-ash/60">
          First launch uses the credentials from <code className="text-gold/70">.env</code> (see README). Change the password in Settings after login.
        </p>
      </div>
    </div>
  );
}
