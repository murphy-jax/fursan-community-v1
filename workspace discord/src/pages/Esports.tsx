import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import CanvasHero from "../components/CanvasHero";
import { AngularButton, Icon, Reveal, SectionHead, StatusBadge, TiltCard } from "../components/ui";
import { useSite, gameMeta } from "../state/SiteContext";
import type { Program } from "../lib/backend";

const GAME_ICONS: Record<string, string> = { fifa: "controller", efootball: "globe", valorant: "crosshair", csgo: "target" };
const JOURNEY_ICONS = ["doc", "crosshair", "users", "shield"];

export default function Esports() {
  const { state } = useSite();
  const c = state.content.esports;
  const [modal, setModal] = useState<Program | null>(null);
  const [platform, setPlatform] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
      setPlatform(modal.platform.split("·")[0].trim());
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const noteFor = (p: Program) =>
    p.status === "open" ? c.openNote : p.status === "temporary" ? c.temporaryNote : c.closedNote;

  const continueToForm = () => {
    if (!modal) return;
    const params = new URLSearchParams({ program: modal.id });
    if (platform) params.set("platform", platform);
    navigate(`/apply/esports?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden scanlines border-b border-ink-700">
        <CanvasHero />
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
          <img src={state.images.esportsHero} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/80 pointer-events-none" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16 pt-40">
          <Reveal variant="clip">
            <p className="font-mono text-[11px] tracking-[0.32em] text-brand-400">// {c.eyebrow}</p>
          </Reveal>
          <h1 className="mt-4 font-display font-bold uppercase leading-[0.92] text-fog-100 text-4xl sm:text-6xl lg:text-7xl tracking-tight">
            {c.title.split(" ")[0]} <span className="text-outline">{c.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <Reveal delay={200}>
            <p className="mt-6 max-w-2xl text-fog-300 text-lg leading-relaxed">{c.desc}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap gap-4">
              <AngularButton to="/apply/esports" size="lg">APPLY NOW <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
              <AngularButton href={state.settings.discordInvite} variant="outline" size="lg"><Icon name="discord" className="w-5 h-5" /> DISCORD</AngularButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* programs */}
      <section className="relative py-24">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <SectionHead eyebrow="ACTIVE DIVISIONS" title="FOUR PROGRAMS. ONE BADGE." desc="Recruitment status is managed live by FURSAN command — what you see here is the current truth." />
            <Reveal delay={150}>
              <div className="flex items-center gap-5 font-mono text-[10.5px] tracking-[0.2em]">
                <span className="flex items-center gap-2 text-mint-400"><span className="w-2 h-2 rounded-full bg-mint-400 pulse-dot" />OPEN</span>
                <span className="flex items-center gap-2 text-amberx-400"><span className="w-2 h-2 rounded-full bg-amberx-400" />PAUSED</span>
                <span className="flex items-center gap-2 text-blood-400"><span className="w-2 h-2 rounded-full bg-blood-400" />CLOSED</span>
              </div>
            </Reveal>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {state.programs.map((p, i) => {
              const m = gameMeta(p.id);
              return (
                <Reveal key={p.id} delay={i * 90}>
                  <TiltCard max={5} className="h-full">
                    <div
                      className="group relative h-full rounded-xl border border-ink-600 bg-ink-900 flex flex-col overflow-hidden hover-lift"
                      style={{ "--gm": m.accent, boxShadow: `inset 0 3px 0 ${m.accent}` } as CSSProperties}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img src={m.art} alt={p.title} loading="lazy" className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                        <div className="absolute top-3 left-3 clip-tag grid place-items-center w-11 h-11 border bg-ink-950/70 backdrop-blur-sm" style={{ borderColor: `${m.accent}66`, color: m.accent }}>
                          <Icon name={GAME_ICONS[p.id] ?? "target"} className="w-6 h-6" />
                        </div>
                        <div className="absolute top-3 right-3"><StatusBadge status={p.status} /></div>
                      </div>
                      <div className="p-7 flex flex-col flex-1">
                        <h3 className="font-display font-bold text-3xl text-fog-100 tracking-tight leading-none transition-colors group-hover:text-(--gm)">{p.title}</h3>
                        <p className="mt-2 font-mono text-[11px] tracking-[0.2em]" style={{ color: m.accent }}>{p.game.toUpperCase()} · {p.platform.toUpperCase()}</p>
                        <p className="mt-4 text-fog-300 leading-relaxed flex-1">{p.description}</p>
                        <p className={`mt-5 text-sm font-mono leading-relaxed ${p.status === "open" ? "text-mint-400/90" : "text-fog-500"}`}>▸ {noteFor(p)}</p>
                        <div className="mt-6 pt-5 border-t border-ink-700 flex items-center justify-between gap-3 mt-auto">
                          <span className="font-mono text-[10px] tracking-[0.24em] text-fog-500">DIV-{String(i + 1).padStart(2, "0")} / FURSAN ESPORTS</span>
                          {p.status === "open" ? (
                            <button
                              onClick={() => setModal(p)}
                              className="clip-btn font-display font-bold text-xs tracking-[0.16em] px-5 py-2.5 text-ink-950 transition-all hover:brightness-110"
                              style={{ background: m.accent, boxShadow: `0 0 22px ${m.accent}45` }}
                            >
                              APPLY NOW
                            </button>
                          ) : (
                            <span className="clip-btn border border-ink-600 text-fog-500 font-display font-bold text-xs tracking-[0.16em] px-5 py-2.5">
                              {p.status === "temporary" ? "ON HOLD" : "CLOSED"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* journey */}
      <section className="relative py-24 border-t border-ink-700 bg-ink-900/60 overflow-hidden">
        <div className="absolute -bottom-24 right-0 font-display font-bold text-[10rem] leading-none text-outline-faint select-none pointer-events-none hidden xl:block">PATH</div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead align="center" eyebrow="HOW IT WORKS" title={c.journeyTitle} desc="No pay-to-join. No boosters. Just a clear path from application to the badge." />
          <div className="mt-16 grid md:grid-cols-4 gap-5 relative">
            <div className="absolute hidden md:block top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand-500/10 via-brand-500/50 to-brand-500/10" />
            {c.journey.map((j, i) => (
              <Reveal key={j.step} delay={i * 120}>
                <div className="relative text-center group">
                  <div className="relative z-10 mx-auto w-16 h-16 clip-tag grid place-items-center border border-brand-500/40 bg-ink-900 text-brand-400 transition-all duration-300 group-hover:bg-brand-500 group-hover:text-ink-950 group-hover:shadow-[0_0_30px_rgba(227,178,60,0.5)]">
                    <Icon name={JOURNEY_ICONS[i % JOURNEY_ICONS.length]} className="w-7 h-7" />
                  </div>
                  <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-fog-500">PHASE 0{i + 1}</p>
                  <h3 className="mt-2 font-display font-bold text-xl tracking-[0.12em] text-fog-100">{j.step}</h3>
                  <p className="mt-3 text-sm text-fog-300 leading-relaxed max-w-[16rem] mx-auto">{j.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-16 text-center">
              <AngularButton to="/apply/esports" size="lg">START YOUR APPLICATION <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* apply modal */}
      {modal && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" onClick={() => setModal(null)} aria-label="Close" />
          <div className="modal-in relative w-full max-w-lg hud-corners clip-card border border-brand-500/30 bg-ink-900 p-8">
            <div className="absolute top-0 left-0 right-0 metal-line" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-brand-400">RECRUITMENT TERMINAL</p>
                <h3 className="mt-2 font-display font-bold text-2xl text-fog-100 tracking-tight">{modal.title}</h3>
                <p className="mt-1 font-mono text-[11px] text-fog-500 tracking-[0.16em]">{modal.platform.toUpperCase()}</p>
              </div>
              <button onClick={() => setModal(null)} className="clip-tag grid place-items-center w-9 h-9 border border-ink-600 text-fog-400 hover:text-blood-400 hover:border-blood-500/50 transition-colors" aria-label="Close dialog">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 clip-tag border border-ink-600 bg-ink-850 p-4">
              <p className="font-mono text-[10.5px] tracking-[0.22em] text-fog-400 mb-2.5">SELECT PLATFORM</p>
              <div className="flex flex-wrap gap-2">
                {modal.platform.split("·").map((pl) => {
                  const v = pl.trim();
                  return (
                    <button
                      key={v}
                      onClick={() => setPlatform(v)}
                      className={`clip-btn px-4 py-2 font-mono text-[11px] tracking-[0.14em] border transition-all ${
                        platform === v ? "border-brand-400 bg-brand-500/15 text-brand-300" : "border-ink-600 text-fog-400 hover:border-brand-500/40"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="mt-6 space-y-2.5">
              {[
                "Full application takes ~5 minutes — have your ranks ready.",
                "You will receive a private reference (FUR-2026-XXXXXX) to track status.",
                "Staff review every application personally. Discord User ID is required.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-fog-300">
                  <Icon name="check" className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-3">
              <AngularButton onClick={continueToForm} className="flex-1">
                CONTINUE TO APPLICATION <Icon name="arrowRight" className="w-4 h-4" />
              </AngularButton>
              <AngularButton onClick={() => setModal(null)} variant="dark">CANCEL</AngularButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
