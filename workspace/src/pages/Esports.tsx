import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApplicationModal } from "../components/ApplicationForm";
import { Btn, IconCrosshair, IconGamepad, IconSwords, IconTrophy, Reveal, SectionHead, StatusPill } from "../components/ui";

const GAME_ICONS: Record<string, (p: { className?: string }) => JSX.Element> = {
  fifa: IconTrophy,
  efootball: IconGamepad,
  valorant: IconCrosshair,
  cs: IconSwords,
};

export default function Esports() {
  const { db } = useApp();
  const c = db.content.esports;
  const [applyFor, setApplyFor] = useState<string | null>(null);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[74vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.esportsHero} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute top-0 right-1/4 w-[560px] h-[560px] glow-red" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> {c.heroEyebrow}
            </p>
            <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.88] tracking-wide">
              {c.heroTitle.split(" ").slice(0, -2).join(" ")} <span className="metal-text">{c.heroTitle.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{c.heroDescription}</p>
          </Reveal>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Live Status" title={c.introTitle} sub={c.introBody} />
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {db.games.map((g, i) => {
              const Icon = GAME_ICONS[g.id] ?? IconTrophy;
              return (
                <Reveal key={g.id} delay={(i % 2) * 110}>
                  <article className="panel panel-hover hud cut p-8 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-[0.06] group-hover:opacity-10">
                      <Icon className="w-44 h-44" />
                    </div>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <span className="cut-sm w-14 h-14 p-3 flex items-center justify-center border border-gold/40 text-gold bg-gold/8">
                        <Icon className="w-8 h-8" />
                      </span>
                      <StatusPill status={g.status} />
                    </div>
                    <h3 className="font-display text-4xl tracking-wide mb-3">{g.title}</h3>
                    <p className="text-ash leading-relaxed flex-1">{g.description}</p>
                    <div className="mt-7 pt-6 border-t border-bone/8 flex items-center justify-between gap-4">
                      <span className="font-cond uppercase tracking-[0.22em] text-[10px] text-gold/60">
                        Program 0{i + 1} · FURSAN Esports
                      </span>
                      {g.status === "open" ? (
                        <Btn onClick={() => setApplyFor(g.title)} className="!px-5 !py-2.5">Apply Now</Btn>
                      ) : (
                        <span className="font-cond uppercase tracking-[0.18em] text-[11px] text-ash/70">
                          {g.status === "temp" ? "Opens soon — stay tuned" : "Roster locked"}
                        </span>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <p className="mt-8 text-sm text-ash/80 border-l-2 border-gold/50 pl-4 max-w-3xl">{c.applyNote}</p>
          </Reveal>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] glow-red opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="The Road" title={c.journeyTitle} sub={c.journeySub} center />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-[26px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            {c.journey.map((j, i) => (
              <Reveal key={j.title} delay={i * 130}>
                <div className="relative text-center group">
                  <div className="relative z-10 mx-auto w-[52px] h-[52px] cut-sm bg-ink border border-gold/50 flex items-center justify-center font-display text-xl text-gold group-hover:bg-gold group-hover:text-ink transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_rgba(213,169,79,0.7)]">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 font-display text-3xl tracking-[0.08em]">{j.title}</h3>
                  <p className="mt-3 text-ash text-[15px] leading-relaxed max-w-[280px] mx-auto">{j.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ApplicationModal
        open={applyFor !== null}
        onClose={() => setApplyFor(null)}
        kind="esports"
        presetProgram={applyFor ?? undefined}
      />
    </div>
  );
}
