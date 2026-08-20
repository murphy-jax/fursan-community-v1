import { Link } from "react-router-dom";
import { AngularButton, CountUp, Countdown, FursanLogo, Icon, Reveal, TiltCard } from "../components/ui";
import { useSite, gameMeta } from "../state/SiteContext";
import type { Tournament } from "../state/SiteContext";

function StatusChip({ t }: { t: Tournament }) {
  if (t.status === "live") {
    return (
      <span className="clip-tag inline-flex items-center gap-2 bg-blood-500/15 border border-blood-500/50 px-3 py-1 font-mono text-[10.5px] tracking-[0.2em] text-blood-300">
        <span className="w-1.5 h-1.5 rounded-full bg-blood-400 pulse-dot-red" /> LIVE NOW
      </span>
    );
  }
  if (t.status === "completed") {
    return (
      <span className="clip-tag inline-flex items-center gap-2 bg-ink-800 border border-ink-600 px-3 py-1 font-mono text-[10.5px] tracking-[0.2em] text-fog-400">
        <Icon name="check" className="w-3 h-3" /> COMPLETED
      </span>
    );
  }
  return (
    <span className="clip-tag inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/40 px-3 py-1 font-mono text-[10.5px] tracking-[0.2em] text-brand-300">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 pulse-dot" /> UPCOMING
    </span>
  );
}

function gameLabel(id: string): { id: string; name: string } {
  return { id, name: id.toUpperCase() };
}

export default function Tournaments() {
  const { state } = useSite();
  const list = state.tournaments ?? [];
  const s = state.settings;

  const next = list
    .filter((t) => t.status === "upcoming")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  const prizePool = list.filter((t) => t.status !== "completed").reduce((sum, t) => sum + (t.prize || 0), 0);

  const sorted = [
    ...list.filter((t) => t.status === "upcoming").sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    ...list.filter((t) => t.status === "live"),
    ...list.filter((t) => t.status === "completed").sort((a, b) => +new Date(b.date) - +new Date(a.date)),
  ];

  const programName = (id: string) => state.programs.find((p) => p.id === id)?.title ?? gameLabel(id).name;

  return (
    <div className="relative overflow-hidden">
      {/* hero — opens with the next battle, not a generic banner */}
      <section className="relative border-b border-ink-700 scanlines overflow-hidden">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(227,178,60,0.09),transparent_55%)] pointer-events-none" />
        <div className="absolute -right-10 top-6 font-display font-bold text-[9rem] sm:text-[13rem] leading-none text-outline-faint pointer-events-none select-none hidden md:block">
          CUP
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-32 sm:pt-36 pb-12">
          <Reveal variant="clip">
            <p className="font-mono text-[11px] tracking-[0.32em] text-brand-400">// FURSAN CIRCUIT · SYNCED LIVE FROM COMMAND</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 font-display font-bold uppercase leading-[0.9] tracking-tight text-4xl sm:text-6xl lg:text-7xl text-fog-100">
              TOURNAMENT <span className="text-outline">BATTLES</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-fog-300 leading-relaxed text-base sm:text-lg">
              Every cup below is created in the admin command centre and broadcast here in realtime.
              When staff publish a new battle, it appears for every knight on every device — instantly.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.28em] text-fog-500">ACTIVE PRIZE POOL</p>
                <p className="mt-1 font-display font-bold text-3xl sm:text-4xl text-brand-300 tracking-tight">
                  <CountUp to={prizePool} duration={1600} /> <span className="text-xl text-fog-400">MAD</span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.28em] text-fog-500">BATTLES SCHEDULED</p>
                <p className="mt-1 font-display font-bold text-3xl sm:text-4xl text-fog-100 tracking-tight">
                  <CountUp to={list.filter((t) => t.status === "upcoming").length} duration={1200} />
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.28em] text-fog-500">CUPS CONQUERED</p>
                <p className="mt-1 font-display font-bold text-3xl sm:text-4xl text-fog-100 tracking-tight">
                  <CountUp to={s.tournamentsWon} duration={1400} />
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* NEXT BATTLE strip */}
        {next && (
          <div className="relative border-t border-brand-500/25 bg-ink-900/85">
            <div className="absolute top-0 inset-x-0 metal-line opacity-70" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="clip-tag grid place-items-center w-12 h-12 border border-brand-500/40 bg-brand-500/10 text-brand-300 shrink-0">
                  <Icon name="trophy" className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.28em] text-brand-400">NEXT BATTLE</p>
                  <p className="font-display font-bold text-xl text-fog-100 tracking-[0.06em] leading-tight">
                    {next.title} <span className="text-fog-500 font-mono text-[11px] tracking-[0.16em] ml-2">{programName(next.game)}</span>
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-6 flex-wrap">
                <Countdown date={next.date} time={next.time} />
                <p className="font-display font-bold text-2xl text-brand-300 tracking-tight">
                  {next.prize.toLocaleString()} {next.currency}
                </p>
                <a href={s.discordInvite} target="_blank" rel="noreferrer noopener" className="clip-btn border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 font-display font-bold text-[11px] tracking-[0.16em] px-5 py-2.5 inline-flex items-center gap-2 transition-colors">
                  <Icon name="discord" className="w-4 h-4" /> REGISTER ON DISCORD
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* grid */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-brand-400">// THE CIRCUIT</p>
              <h2 className="mt-2 font-display font-bold uppercase text-3xl sm:text-4xl text-fog-100 tracking-tight">ALL BATTLES</h2>
            </div>
            <p className="font-mono text-[10.5px] text-fog-500 tracking-[0.2em]">
              {sorted.length} EVENT{sorted.length === 1 ? "" : "S"} · PUBLISHED BY COMMAND
            </p>
          </div>

          {sorted.length === 0 ? (
            <div className="mt-10 hud-corners clip-card border border-ink-600 bg-ink-900 p-12 text-center">
              <Icon name="trophy" className="w-10 h-10 text-fog-500 mx-auto" />
              <p className="mt-4 font-display font-bold text-xl text-fog-200 tracking-[0.08em]">NO BATTLES SCHEDULED YET</p>
              <p className="mt-2 text-fog-400 text-sm">The command centre will publish the next cup here — watch Discord.</p>
            </div>
          ) : (
            <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map((t, i) => {
                const day = new Date(`${t.date}T12:00:00`);
                const dayStr = Number.isNaN(day.getTime()) ? "--" : day.toLocaleDateString("en-GB", { day: "2-digit" });
                const monStr = Number.isNaN(day.getTime()) ? "---" : day.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                const m = gameMeta(t.game);
                return (
                  <Reveal key={t.id} delay={(i % 3) * 90}>
                    <TiltCard max={5} className="h-full">
                      <article
                        className={`hud-corners group relative h-full clip-card border bg-ink-900 flex flex-col transition-colors ${t.status === "live" ? "border-blood-500/50" : "border-ink-600 hover:border-brand-500/40"}`}
                        style={{ boxShadow: `inset 0 3px 0 ${m.accent}` }}
                      >
                        <div className="p-6 pb-5 flex items-start justify-between gap-4">
                          <div className="clip-tag border bg-ink-850 px-3 py-2 text-center shrink-0" style={{ borderColor: `${m.accent}55` }}>
                            <p className="font-display font-bold text-2xl leading-none" style={{ color: m.accent }}>{dayStr}</p>
                            <p className="font-mono text-[9px] tracking-[0.24em] text-fog-500 mt-1">{monStr}</p>
                          </div>
                          <div className="text-right">
                            <StatusChip t={t} />
                            <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-fog-500">{t.format}</p>
                          </div>
                        </div>

                        <div className="px-6 flex-1">
                          <p className="font-mono text-[10px] tracking-[0.26em]" style={{ color: m.accent }}>{programName(t.game)}</p>
                          <h3 className="mt-1.5 font-display font-bold text-2xl text-fog-100 tracking-tight leading-tight">{t.title}</h3>
                          <p className="mt-3 text-sm text-fog-300 leading-relaxed">{t.description}</p>
                        </div>

                        <div className="mt-5 px-6 pb-6">
                          {t.status === "completed" ? (
                            <div className="clip-tag border border-ink-600 bg-ink-850 px-4 py-3 flex items-center justify-between gap-3">
                              <span className="font-mono text-[10px] tracking-[0.22em] text-fog-500">CHAMPION</span>
                              <span className="font-display font-bold text-lg text-brand-300 tracking-[0.08em] inline-flex items-center gap-2">
                                <Icon name="trophy" className="w-4 h-4" /> {t.champion || "TBD"}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">PRIZE</p>
                                  <p className="font-display font-bold text-2xl tracking-tight leading-tight" style={{ color: m.accent }}>
                                    {(t.prize || 0).toLocaleString()} <span className="text-sm text-fog-400">{t.currency}</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono text-[9.5px] tracking-[0.24em] text-fog-500">SLOTS · {t.entry}</p>
                                  <p className="font-display font-bold text-xl text-fog-100 tracking-tight leading-tight">{Math.min(t.registered ?? 0, t.slots)}/{t.slots}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="h-1.5 w-full bg-ink-700 overflow-hidden rounded-full">
                                  <div
                                    className="h-full rounded-full bar-grow"
                                    style={{ width: `${t.slots ? Math.round((Math.min(t.registered ?? 0, t.slots) / t.slots) * 100) : 0}%`, background: m.accent }}
                                  />
                                </div>
                                <p className="mt-1.5 font-mono text-[9px] tracking-[0.2em] text-fog-500">
                                  {t.slots ? t.slots - Math.min(t.registered ?? 0, t.slots) : 0} SPOTS LEFT · {t.slots ? Math.round((Math.min(t.registered ?? 0, t.slots) / t.slots) * 100) : 0}% FULL
                                </p>
                              </div>
                            </div>
                          )}
                          {t.status === "upcoming" && (
                            <div className="mt-4 pt-4 border-t border-ink-700 flex items-center justify-between gap-3">
                              <Countdown date={t.date} time={t.time} compact />
                              <a href={s.discordInvite} target="_blank" rel="noreferrer noopener" className="font-mono text-[10.5px] tracking-[0.2em] text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1.5">
                                ENTER <Icon name="arrowUpRight" className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </article>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <Reveal>
            <div className="mt-14 clip-card border border-ink-600 bg-ink-900/80 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <FursanLogo src={state.images.logo} className="w-14 h-14 shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-xl text-fog-100 tracking-[0.06em]">WANT A SHOT AT THE CROWN?</h3>
                  <p className="mt-1 text-sm text-fog-300">Join the rosters that fight in these cups — recruitment is handled through the esports pipeline.</p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <AngularButton to="/esports" variant="outline" size="md">ESPORTS PROGRAMS</AngularButton>
                <AngularButton to="/apply/esports" size="md">APPLY NOW <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
