import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import CanvasHero from "../components/CanvasHero";
import { AngularButton, CountUp, Countdown, FursanLogo, Icon, Monogram, Reveal, ScrambleText, SectionHead, StatusBadge, TiltCard } from "../components/ui";
import { useSite, gameMeta } from "../state/SiteContext";

export default function Home() {
  const { state } = useSite();
  const c = state.content.home;
  const s = state.settings;
  const nextBattle = (state.tournaments ?? [])
    .filter((t) => t.status === "upcoming")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  return (
    <div className="relative">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden scanlines">
        <CanvasHero />
        {/* arena backdrop */}
        <div className="absolute inset-0 opacity-[0.16] pointer-events-none">
          <img src={state.images.homeHero} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-ink-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,5,5,0.88)_100%)] pointer-events-none" />

        {/* giant emblem */}
        <div className="absolute right-[-6%] top-1/2 -translate-y-1/2 w-[46rem] max-w-[70vw] opacity-[0.2] hidden md:block floaty pointer-events-none">
          <FursanLogo src={state.images.logo} className="w-full h-auto aspect-square" eager />
        </div>

        {/* side rail */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-5">
          <span className="w-px h-16 bg-gradient-to-b from-transparent via-brand-500/60 to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-fog-400 [writing-mode:vertical-rl] rotate-180">
            MOROCCAN GAMING COLLECTIVE — DIMA FURSAN
          </span>
          <span className="w-px h-16 bg-gradient-to-b from-transparent via-brand-500/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-36 sm:pt-44 pb-16 flex-1 flex flex-col justify-center">
          <div className="max-w-3xl">
            <Reveal variant="clip">
              <div className="inline-flex items-center gap-3 clip-tag border border-brand-500/40 bg-brand-500/5 px-4 py-2">
                <Icon name="sword" className="w-4 h-4 text-brand-400" />
                <span className="font-mono text-[11px] tracking-[0.32em] text-brand-300">{c.eyebrow}</span>
              </div>
            </Reveal>

            <h1 className="mt-7 font-display font-bold uppercase leading-[0.88] tracking-tight">
              <ScrambleText text={c.title.split(" ")[0]} className="block text-[17vw] sm:text-8xl lg:text-[7.2rem] text-fog-100 flicker-in" />
              <ScrambleText
                text={c.title.split(" ").slice(1).join(" ") || "COMMUNITY"}
                className="block text-[17vw] sm:text-8xl lg:text-[7.2rem] text-outline"
                speed={34}
              />
            </h1>

            <Reveal delay={200}>
              <p className="mt-6 font-mono text-xs sm:text-sm tracking-[0.3em] text-brand-400">
                ▸ {c.tagline}<span className="blink-cursor text-brand-400">_</span>
              </p>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-5 max-w-xl text-fog-300 text-base sm:text-lg leading-relaxed">{c.description}</p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <AngularButton to="/esports" size="lg">
                  {c.exploreLabel} <Icon name="arrowRight" className="w-4 h-4" />
                </AngularButton>
                <AngularButton href={s.discordInvite} variant="outline" size="lg">
                  <Icon name="discord" className="w-5 h-5" /> {c.discordLabel}
                </AngularButton>
                <span
                  className={`clip-tag inline-flex items-center gap-2.5 px-4 py-2.5 border font-mono text-[11px] tracking-[0.2em] ${
                    s.serverOnline ? "border-mint-500/40 text-mint-400 bg-mint-500/5" : "border-blood-500/40 text-blood-400 bg-blood-500/5"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.serverOnline ? "bg-mint-400 pulse-dot" : "bg-blood-400 pulse-dot-red"}`} />
                  {s.serverOnline ? c.onlineLabel : c.offlineLabel}
                  <span className="text-fog-500">· {s.memberCount.toLocaleString()} KNIGHTS</span>
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ticker */}
        <div className="relative z-10 border-y border-ink-700 bg-ink-900/80 backdrop-blur-sm overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap py-3">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {["DIMA FURSAN", "EST. 2020", "COMPETE · CONQUER · CONNECT", "الفرسان", "4 ESPORTS PROGRAMS", "WEEKLY SCRIMS", "COMMUNITY CUPS", "MOROCCO → MENA → WORLD"].map((t, i) => (
                  <span key={i} className="flex items-center gap-6 px-6 font-mono text-[11px] tracking-[0.34em] text-fog-400">
                    {t} <span className="text-brand-500">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative border-b border-ink-700 bg-ink-900">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal variant="clip">
            <p className="pt-8 font-mono text-[10.5px] tracking-[0.34em] text-brand-400">// {c.statsEyebrow}</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700 my-8 clip-card overflow-hidden border border-ink-700">
            {[
              { label: "COMMUNITY MEMBERS", value: s.memberCount, icon: "users" },
              { label: "ACTIVE PLAYERS", value: s.activePlayers, icon: "controller" },
              { label: "ESPORTS TEAMS", value: s.teams, icon: "shield" },
              { label: "TOURNAMENTS WON", value: s.tournamentsWon, icon: "trophy" },
            ].map((st, i) => (
              <div key={st.label} className="group relative bg-ink-900 hover:bg-ink-850 transition-colors px-6 py-8 sm:px-8 sm:py-10">
                <div className="absolute top-0 left-0 h-[2px] w-0 bg-brand-500 transition-all duration-500 group-hover:w-full" />
                <Icon name={st.icon} className="w-6 h-6 text-fog-500 group-hover:text-brand-400 transition-colors" />
                <p className="mt-4 font-display font-bold text-4xl sm:text-5xl text-fog-100 tracking-tight">
                  <CountUp to={st.value} duration={1600 + i * 200} />
                  <span className="text-brand-400">+</span>
                </p>
                <p className="mt-2 font-mono text-[10.5px] tracking-[0.26em] text-fog-400">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEXT BATTLE ============ */}
      {nextBattle && (
        <section className="relative border-b border-ink-700 bg-ink-900/60 overflow-hidden">
          <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(227,178,60,0.08),transparent_60%)] pointer-events-none" />
          <Reveal>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <span className="clip-tag grid place-items-center w-12 h-12 border border-brand-500/40 bg-brand-500/10 text-brand-300 shrink-0">
                  <Icon name="trophy" className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.28em] text-brand-400">NEXT BATTLE · SYNCED LIVE</p>
                  <p className="font-display font-bold text-xl text-fog-100 tracking-[0.05em] truncate">
                    {nextBattle.title}
                    <span className="text-fog-500 font-mono text-[10.5px] tracking-[0.16em] ml-3">{nextBattle.game.toUpperCase()} · {nextBattle.format}</span>
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-6 flex-wrap">
                <Countdown date={nextBattle.date} time={nextBattle.time} />
                <div>
                  <p className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PRIZE</p>
                  <p className="font-display font-bold text-2xl text-brand-300 tracking-tight leading-tight">{nextBattle.prize.toLocaleString()} {nextBattle.currency}</p>
                </div>
                <Link to="/tournaments" className="clip-btn border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 font-display font-bold text-[11px] tracking-[0.16em] px-5 py-2.5 inline-flex items-center gap-2 transition-colors shrink-0">
                  FULL CIRCUIT <Icon name="arrowRight" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ============ FEATURES ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="absolute -top-40 right-0 w-[34rem] h-[34rem] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead eyebrow={c.featuresEyebrow} title={c.featuresTitle} />
            <Reveal delay={200}>
              <p className="font-mono text-[11px] text-fog-500 tracking-[0.2em]">SYS.MODULES // 06 ACTIVE</p>
            </Reveal>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {state.features.map((f, i) => (
              <Reveal key={f.id} delay={i * 80}>
                <TiltCard className="h-full">
                  <div className="hud-corners group relative h-full clip-card border border-ink-600 bg-ink-900/80 p-7 transition-colors duration-300 hover:border-brand-500/40 hover:bg-ink-850">
                    <div className="flex items-start justify-between">
                      <span className="clip-tag grid place-items-center w-12 h-12 border border-brand-500/30 bg-brand-500/5 text-brand-400 transition-all duration-300 group-hover:bg-brand-500 group-hover:text-ink-950 group-hover:shadow-[0_0_24px_rgba(227,178,60,0.45)]">
                        <Icon name={f.icon} className="w-6 h-6" />
                      </span>
                      <span className="font-mono text-[11px] text-fog-500 tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-6 font-display font-bold tracking-[0.08em] text-fog-100 text-lg">{f.title}</h3>
                    <p className="mt-2.5 text-sm text-fog-300 leading-relaxed">{f.desc}</p>
                    <div className="mt-5 h-px w-full bg-ink-700 relative overflow-hidden">
                      <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-brand-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[tickerScroll_1.4s_linear_infinite]" />
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROGRAM PREVIEW ============ */}
      <section className="relative py-24 border-y border-ink-700 bg-ink-900/60 overflow-hidden">
        <div className="absolute left-0 top-10 font-display font-bold text-[11rem] leading-none text-outline-faint pointer-events-none select-none hidden lg:block">
          ARENA
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead eyebrow={c.gamesEyebrow} title={c.gamesTitle} desc="Four battlegrounds, one badge. Recruitment status updates live from the command centre." />
            <Reveal delay={150}>
              <AngularButton to="/esports" variant="outline">ALL PROGRAMS <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
            </Reveal>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {state.programs.map((p, i) => {
              const m = gameMeta(p.id);
              return (
                <Reveal key={p.id} delay={i * 90}>
                  <TiltCard max={6} className="h-full">
                    <div
                      className="group relative h-full rounded-xl overflow-hidden bg-ink-900 border border-ink-600 hover-lift flex flex-col"
                      style={{ "--gm": m.accent, boxShadow: `inset 0 3px 0 ${m.accent}` } as CSSProperties}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={m.art}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                        <div className="absolute top-3 right-3"><StatusBadge status={p.status} /></div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display font-bold text-xl tracking-tight text-fog-100 transition-colors group-hover:text-(--gm)">{p.title}</h3>
                        <p className="mt-1 font-mono text-[11px] tracking-[0.14em]" style={{ color: m.accent }}>{p.platform}</p>
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium bg-blue-950/70 text-blue-400 border border-blue-800/50">{m.players} Players</span>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium bg-ink-800 text-fog-300 border border-ink-600">{m.teams} Teams</span>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium bg-yellow-950/60 text-yellow-500 border border-yellow-700/50">{m.cups} Cups</span>
                        </div>
                        <div className="mt-4 pt-3.5 border-t border-ink-700 flex items-center justify-between mt-auto">
                          <Link to="/esports" className="font-mono text-[11px] tracking-[0.2em] text-fog-400 hover:text-(--gm) transition-colors inline-flex items-center gap-1.5">
                            DETAILS <Icon name="chevronRight" className="w-3.5 h-3.5" />
                          </Link>
                          {p.status === "open" ? (
                            <Link
                              to={`/apply/esports?program=${p.id}`}
                              className="clip-btn font-display font-bold text-[11px] tracking-[0.14em] px-3.5 py-2 text-ink-950 transition-all hover:brightness-110"
                              style={{ background: m.accent, boxShadow: `0 0 20px ${m.accent}40` }}
                            >
                              APPLY NOW
                            </Link>
                          ) : (
                            <span className="font-mono text-[10px] tracking-[0.18em] text-fog-500">STANDBY</span>
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

      {/* ============ FOUNDING COUNCIL ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="absolute -bottom-44 left-1/4 w-[30rem] h-[30rem] bg-blood-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead align="center" eyebrow={c.foundersEyebrow} title={state.content.foundersTitle} desc={state.content.foundersSub} />

          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
            {state.founders.map((f, i) => (
              <Reveal key={f.id} delay={i * 90}>
                <TiltCard max={8} className="h-full">
                  <div className="hud-corners hud-corners-blood group relative clip-card border border-ink-600 bg-ink-900/90 p-6 text-center overflow-hidden transition-colors hover:border-blood-500/40">
                    <span className="absolute -top-5 -right-2 font-display font-bold text-[5.2rem] leading-none text-outline-faint pointer-events-none select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative mx-auto w-fit">
                      {f.image ? (
                        <img src={f.image} alt={f.name} className="w-20 h-20 clip-tag object-cover border border-brand-500/30" />
                      ) : (
                        <Monogram name={f.name} className="w-20 h-20 text-2xl" />
                      )}
                      <span className="absolute -bottom-1 -right-1 clip-tag bg-blood-500 text-white font-mono text-[9px] px-1.5 py-0.5 tracking-widest">0{i + 1}</span>
                    </div>
                    <h3 className="relative mt-5 font-display font-bold tracking-[0.1em] text-fog-100 text-lg leading-tight">{f.name}</h3>
                    <p className="relative mt-1.5 font-mono text-[10px] tracking-[0.16em] text-brand-400">{f.tag}</p>
                    <div className="relative mt-4 metal-line opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-24 overflow-hidden scanlines">
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <img src={state.images.homeHero} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <Reveal variant="clip">
              <p className="font-mono text-[11px] tracking-[0.3em] text-brand-400">// FINAL TRANSMISSION</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-4 font-display font-bold uppercase text-4xl sm:text-5xl text-fog-100 leading-[0.95]">
                THE GATE IS OPEN.<br /><span className="text-outline">RIDE WITH US.</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 text-fog-300 leading-relaxed">{state.content.community.ctaBody}</p>
            </Reveal>
          </div>
          <Reveal delay={250} variant="right">
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-44 h-44 grid place-items-center">
                <span className="absolute inset-0 border border-brand-500/30 rounded-full spin-slow" style={{ borderTopColor: "rgba(240,195,86,0.95)" }} />
                <span className="absolute inset-4 border border-ink-600 rounded-full spin-slow" style={{ animationDirection: "reverse", borderBottomColor: "rgba(217,30,46,0.85)" }} />
                <FursanLogo src={state.images.logo} className="w-24 h-24" />
              </div>
              <AngularButton href={s.discordInvite} size="lg">
                <Icon name="discord" className="w-5 h-5" /> {state.content.community.ctaBtn}
              </AngularButton>
              <AngularButton to="/community" variant="ghost" size="sm">READ OUR STORY <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
