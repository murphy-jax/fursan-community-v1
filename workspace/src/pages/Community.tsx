import { useApp } from "../context/AppContext";
import { IconDiscord, LinkBtn, Reveal, SectionHead } from "../components/ui";

const ROMAN = ["I", "II", "III", "IV"];

export default function Community() {
  const { db } = useApp();
  const c = db.content.community;
  const s = db.settings;

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-end overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.communityHero} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute top-10 right-0 w-[560px] h-[560px] glow-red" />
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

      {/* STORY + MISSION */}
      <section className="relative py-24">
        <div className="absolute inset-0 texture-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-start">
          <Reveal>
            <SectionHead eyebrow="Since 2020" title={c.storyTitle} />
            <div className="mt-8 space-y-5">
              {c.storyBody.split("\n\n").map((p, i) => (
                <p key={i} className={`leading-relaxed text-lg ${i === 0 ? "text-bone first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8] first-letter:text-gold" : "text-ash"}`}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="gold-frame cut p-8 lg:sticky lg:top-28">
              <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold mb-4">{c.missionTitle}</p>
              <p className="font-display text-3xl leading-[1.05] tracking-wide text-bone">{c.missionBody}</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={db.images.logo} alt="" className="w-12 h-12 object-contain mix-blend-screen" />
                <span className="font-cond uppercase tracking-[0.24em] text-[11px] text-ash">FURSAN · الفُرسان</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10 overflow-hidden">
        <div className="absolute -top-20 left-0 w-[500px] h-[500px] glow-gold" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="The Code" title={c.valuesTitle} sub={c.valuesSub} />
          <div className="mt-14 grid md:grid-cols-2 gap-x-16 gap-y-12">
            {c.values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 120} className={i % 2 === 1 ? "md:translate-y-10" : ""}>
                <div className="flex gap-6 group">
                  <span className="font-display text-7xl leading-none text-outline group-hover:text-gold/30 transition-colors select-none">
                    {ROMAN[i]}
                  </span>
                  <div className="border-l-2 border-gold/30 group-hover:border-gold transition-colors pl-6">
                    <h3 className="font-display text-3xl tracking-wide group-hover:text-goldsoft transition-colors">{v.title}</h3>
                    <p className="mt-2.5 text-ash leading-relaxed">{v.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-50" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="font-display text-[9rem] leading-[0.4] metal-text block mb-8 select-none" aria-hidden="true">“</span>
          <blockquote className="font-display text-4xl sm:text-6xl leading-[1.02] tracking-wide">
            {c.quote}
          </blockquote>
          <p className="mt-8 font-cond uppercase tracking-[0.3em] text-sm text-gold">— {c.quoteAuthor}</p>
        </Reveal>
      </section>

      {/* FEATURE CARDS */}
      <section className="relative py-24 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Member Life" title={c.featuresTitle} />
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {c.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 100}>
                <article className="panel panel-hover hud cut p-8 flex gap-6 items-start h-full">
                  <span className="font-display text-5xl metal-text leading-none">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl tracking-wide mb-2">{f.title}</h3>
                    <p className="text-ash leading-relaxed">{f.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-navy border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] glow-red" />
        <Reveal className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">{c.ctaTitle}</h2>
          <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">{c.ctaDescription}</p>
          <LinkBtn href={s.discordInvite} external className="mt-9 min-w-[230px]">
            <IconDiscord className="w-4 h-4" /> {c.ctaButton}
          </LinkBtn>
        </Reveal>
      </section>
    </div>
  );
}
