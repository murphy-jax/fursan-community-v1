import CanvasHero from "./CanvasHero";
import { Depth3DText, FursanLogo, Icon } from "./ui";
import { useAuth } from "../state/AuthContext";
import { useSite } from "../state/SiteContext";

/* Mandatory entrance — the whole site sits behind a Discord connect. */

export default function Gate() {
  const { ready, connecting, error, signInWithDiscord } = useAuth();
  const { state } = useSite();
  const s = state.settings;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines py-16">
      <CanvasHero />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(7,5,5,0.92)_100%)] pointer-events-none" />
      <div className="absolute inset-0 grid-bg-faint pointer-events-none" />

      {/* corner HUD marks */}
      <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.34em] text-fog-500 hidden sm:block">
        FURSAN.SEC // GATE-01
      </div>
      <div className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.34em] text-fog-500 hidden sm:block inline-flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${s.serverOnline ? "bg-mint-400 pulse-dot" : "bg-blood-400"}`} />
        {s.serverOnline ? "KEEP ONLINE" : "KEEP OFFLINE"}
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-fog-500 hidden sm:block">
        EST. 2020 · MEMBERS ONLY
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 text-center">
        {/* rotating emblem */}
        <div className="relative mx-auto w-44 h-44 grid place-items-center">
          <span className="absolute inset-0 rounded-full border border-brand-500/30 spin-slow" style={{ borderTopColor: "rgba(240,195,86,0.95)" }} />
          <span className="absolute inset-4 rounded-full border border-ink-600 spin-slow" style={{ animationDirection: "reverse", borderBottomColor: "rgba(217,30,46,0.85)" }} />
          <span className="absolute inset-8 rounded-full border border-ink-700/60" />
          <span className="absolute inset-0 rounded-full animate-glow-pulse bg-brand-500/10 blur-2xl" />
          <FursanLogo src={state.images.logo} className="relative w-24 h-24 floaty" eager />
        </div>

        <p className="mt-9 font-mono text-[11px] tracking-[0.42em] text-brand-400">RESTRICTED KEEP · IDENTITY CHECKPOINT</p>

        <h1 className="mt-4 font-display font-black uppercase leading-[0.86] tracking-[-0.04em] text-6xl sm:text-8xl text-fog-100">
          <Depth3DText text="THE GATE" depth={70} />
        </h1>

        <p className="mt-3 font-display font-bold tracking-[0.3em] text-outline text-lg sm:text-xl uppercase">
          {s.communityName}
        </p>

        <p className="mt-6 text-fog-300 leading-relaxed max-w-lg mx-auto">
          This keep is for knights only. Connect your Discord account to enter —
          your <span className="text-brand-300 font-semibold">verified identity</span> is exactly what receives
          your team roles and battle messages when you are recruited.
        </p>

        {error && (
          <div className="mt-7 clip-card border border-blood-500/50 bg-blood-500/10 p-5 text-left max-w-lg mx-auto modal-in">
            <p className="font-mono text-[10px] tracking-[0.26em] text-blood-400 mb-2 inline-flex items-center gap-2">
              <Icon name="alert" className="w-4 h-4" /> GATE MALFUNCTION
            </p>
            <p className="text-sm text-blood-300 leading-relaxed">{error}</p>
            <p className="mt-3 text-xs text-fog-400 leading-relaxed">
              Operator fix: Supabase dashboard → Authentication → Providers → enable Discord,
              then add this site URL to Authentication → URL Configuration → Redirect URLs. Full steps in the README.
            </p>
          </div>
        )}

        <button
          onClick={() => void signInWithDiscord()}
          disabled={!ready || connecting}
          className="mt-9 clip-btn inline-flex items-center gap-3 bg-brand-500 text-ink-950 font-display font-bold tracking-[0.18em] text-sm px-10 py-4.5 hover:bg-brand-300 transition-all shadow-[0_0_34px_rgba(227,178,60,0.35)] hover:shadow-[0_0_54px_rgba(227,178,60,0.55)] active:translate-y-px disabled:opacity-50"
        >
          {connecting ? <Icon name="refresh" className="w-5 h-5 animate-spin" /> : <Icon name="discord" className="w-5 h-5" />}
          {connecting ? "RIDING TO DISCORD…" : ready ? "CONNECT DISCORD TO ENTER" : "VERIFYING CREDENTIALS…"}
        </button>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-mono text-[10px] tracking-[0.22em] text-fog-500">
          <span className="inline-flex items-center gap-2">
            <Icon name="shield" className="w-3.5 h-3.5 text-mint-400" /> VERIFIED IDENTITY
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="lock" className="w-3.5 h-3.5 text-brand-400" /> NO PASSWORDS NEEDED
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="radio" className="w-3.5 h-3.5 text-blood-400" /> AUTO ROLES + DM
          </span>
        </div>
      </div>
    </div>
  );
}
