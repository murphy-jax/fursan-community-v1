import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApplicationModal } from "../components/ApplicationForm";
import {
  Btn, IconArrow, IconBadge, IconBook, IconGauge, IconHeartline, IconMedical, IconScales,
  IconUsers, Reveal, SectionHead, StatusPill,
} from "../components/ui";

const ICONS: Record<string, Record<number, (p: { className?: string }) => JSX.Element>> = {
  ems: { 0: IconHeartline, 1: IconUsers, 2: IconMedical },
  lspd: { 0: IconScales, 1: IconGauge, 2: IconBook },
};

export default function Department({ slug }: { slug: "ems" | "lspd" }) {
  const { db } = useApp();
  const c = db.content[slug];
  const dep = db.departments.find((d) => d.id === slug)!;
  const heroImg = slug === "ems" ? db.images.emsHero : db.images.lspdHero;
  const CrestIcon = slug === "ems" ? IconMedical : IconBadge;
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/25" />
          <div className={`absolute inset-0 bg-gradient-to-r ${slug === "ems" ? "from-ink/85" : "from-ink/85"} to-transparent`} />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className={`absolute top-10 right-0 w-[600px] h-[600px] ${slug === "ems" ? "glow-gold" : "glow-red"}`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-16 w-full">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> {c.heroEyebrow}
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-wide max-w-4xl">
              {c.heroTitle}
            </h1>
            <p className="mt-6 text-ash text-lg max-w-2xl leading-relaxed">{c.heroDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StatusPill status={dep.status} />
              {dep.status === "open" ? (
                <Btn onClick={() => setApplyOpen(true)} className="min-w-[210px]">{c.applyCta}</Btn>
              ) : (
                <span className="font-cond uppercase tracking-[0.18em] text-xs text-ash">
                  Intake paused — openings announced on Discord
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <Reveal>
            <SectionHead eyebrow="Department Briefing" title={c.introTitle} />
            <div className="mt-8 space-y-5">
              {c.introBody.split("\n\n").map((p, i) => (
                <p key={i} className="text-ash text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="gold-frame cut p-8 lg:sticky lg:top-28">
              <span className="cut-sm w-14 h-14 p-3 flex items-center justify-center border border-gold/40 text-gold bg-gold/8 mb-6">
                <CrestIcon className="w-8 h-8" />
              </span>
              <p className="font-display text-4xl tracking-wide leading-none">{dep.name}</p>
              <p className="mt-2 font-cond uppercase tracking-[0.24em] text-xs text-gold/90">{dep.tagline}</p>
              <div className="mt-6 pt-6 border-t border-bone/10 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ash">Chain of ranks</span><span className="text-bone font-semibold">{dep.ranks.length}</span></div>
                <div className="flex justify-between"><span className="text-ash">Entry requirements</span><span className="text-bone font-semibold">{dep.requirements.length}</span></div>
                <div className="flex justify-between"><span className="text-ash">Intake</span><span className={`font-semibold ${dep.status === "open" ? "text-emerald-300" : "text-red-300"}`}>{dep.status === "open" ? "Open" : dep.status === "temp" ? "Paused" : "Closed"}</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] glow-red opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Doctrine" title={c.principlesTitle} />
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {c.principles.map((p, i) => {
              const Icon = ICONS[slug][i] ?? IconScales;
              return (
                <Reveal key={p.title} delay={i * 120}>
                  <article className="panel panel-hover hud cut p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`cut-sm w-13 h-13 p-3 flex items-center justify-center border ${slug === "ems" ? "border-gold/40 text-gold bg-gold/8" : "border-blood/50 text-bloodbright bg-blood/10"}`}>
                        <Icon className="w-7 h-7" />
                      </span>
                      <span className="font-display text-5xl text-outline">0{i + 1}</span>
                    </div>
                    <h3 className="font-display text-3xl tracking-wide mb-3">{p.title}</h3>
                    <p className="text-ash leading-relaxed">{p.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS + RANKS */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-14">
          <Reveal>
            <SectionHead eyebrow="Before You Apply" title={c.requirementsTitle} />
            <ul className="mt-9 space-y-4">
              {dep.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <span className="cut-sm shrink-0 w-7 h-7 mt-0.5 flex items-center justify-center border border-gold/40 text-gold bg-gold/8 group-hover:bg-gold group-hover:text-ink transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 12.5 9.5 18 20 6.5" /></svg>
                  </span>
                  <span className="text-bone/90 leading-relaxed pt-0.5">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <SectionHead eyebrow="Career Path" title={c.ranksTitle} />
            <ol className="mt-9 relative border-l border-gold/25 ml-3 space-y-7">
              {dep.ranks.map((r, i) => (
                <li key={r.title} className="relative pl-8 group">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 cut-sm bg-ink border border-gold/60 group-hover:bg-gold transition-colors" />
                  <p className="font-display text-2xl tracking-wide group-hover:text-goldsoft transition-colors">
                    <span className="text-gold/60 text-base mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {r.title}
                  </p>
                  <p className="mt-1 text-ash text-[15px] leading-relaxed">{r.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-navy border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-40" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">
            {slug === "ems" ? "THE CITY NEEDS ITS MEDICS" : "THE CITY NEEDS ITS FINEST"}
          </h2>
          <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">
            Applications go straight to {dep.name} command. Bring discipline — the academy handles the rest.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {dep.status === "open" ? (
              <Btn onClick={() => setApplyOpen(true)} className="min-w-[230px]">
                {c.applyCta} <IconArrow className="w-4 h-4" />
              </Btn>
            ) : (
              <span className="font-cond uppercase tracking-[0.2em] text-sm text-ash border border-bone/15 px-6 py-3 cut-sm">
                Recruitment {dep.status === "temp" ? "temporarily " : ""}closed
              </span>
            )}
          </div>
        </Reveal>
      </section>

      <ApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} kind={slug} />
    </div>
  );
}
