import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Btn, CountUp, IconArrow, IconCalendar, IconChat, IconCrosshair, IconDiscord, IconGamepad,
  IconMask, IconMedical, IconBadge, IconShield, IconSignal, IconSwords, IconTrophy, LinkBtn,
  parseStat, Reveal, SectionHead, StatusPill,
} from "../components/ui";

const FEATURE_ICONS = [IconSwords, IconTrophy, IconMask, IconCalendar, IconShield, IconChat];

export default function Home() {
  const { db } = useApp();
  const c = db.content.home;
  const s = db.settings;

  const previewMeta = [
    { icon: IconTrophy, to: "/esports", status: db.games.find((g) => g.id === "fifa")?.status ?? "closed" },
    { icon: IconGamepad, to: "/esports", status: db.games.find((g) => g.id === "efootball")?.status ?? "closed" },
    { icon: IconCrosshair, to: "/esports", status: db.games.find((g) => g.id === "valorant")?.status ?? "closed" },
    { icon: IconSwords, to: "/esports", status: db.games.find((g) => g.id === "cs")?.status ?? "closed" },
    { icon: IconMedical, to: "/ems", status: db.departments.find((d) => d.id === "ems")?.status ?? "closed" },
    { icon: IconBadge, to: "/lspd", status: db.departments.find((d) => d.id === "lspd")?.status ?? "closed" },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          <img src={db.images.homeHero} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        </div>
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-40 right-[-10%] w-[700px] h-[700px] glow-red" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] glow-gold" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center w-full">
          <div>
            <Reveal>
              <img
                src={db.images.logo}
                alt="FURSAN crest"
                className="lg:hidden w-36 h-36 object-contain mix-blend-screen animate-floaty mb-4 -ml-2"
              />
              <div className="flex flex-wrap items-center gap-4 mb-7">
                <span className="cut-sm inline-flex items-center gap-2.5 px-4 py-2 border border-gold/40 bg-ink/60 backdrop-blur-sm">
                  {s.serverOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                      <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-emerald-300">{c.serverLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-red-300">Server Maintenance</span>
                    </>
                  )}
                  <span className="text-bone/30">|</span>
                  <span className="font-cond uppercase tracking-[0.2em] text-[11px] text-ash">{s.memberCount.toLocaleString()}+ members</span>
                </span>
              </div>
              <p className="font-cond uppercase tracking-[0.34em] text-gold text-xs sm:text-sm mb-4 flex items-center gap-3">
                <span className="h-px w-12 bg-gold/70" />
                {c.eyebrow}
              </p>
              <h1 className="font-display leading-[0.88] tracking-wide text-[17vw] sm:text-7xl lg:text-8xl xl:text-[7.2rem]">
                {c.title.split(" ")[0]}
                <br />
                <span className="metal-text">{c.title.split(" ").slice(1).join(" ") || "COMMUNITY"}</span>
              </h1>
              <p className="mt-5 font-cond uppercase tracking-[0.22em] text-base sm:text-lg text-bloodbright font-semibold">
                {c.tagline}
              </p>
              <p className="mt-6 text-ash text-lg leading-relaxed max-w-xl">{c.description}</p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link to="/community">
                  <Btn className="min-w-[200px]">{c.ctaExplore} <IconArrow className="w-4 h-4" /></Btn>
                </Link>
                <LinkBtn href={s.discordInvite} external variant="outline">
                  <IconDiscord className="w-4 h-4" /> {c.ctaDiscord}
                </LinkBtn>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="hidden lg:block relative">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[480px] h-[480px] glow-red rounded-full blur-2xl" />
              <div className="absolute w-[430px] h-[430px] rounded-full border border-gold/20 animate-spin-slow" style={{ borderStyle: "dashed" }} />
              <div className="absolute w-[360px] h-[360px] rounded-full border border-blood/40" />
              <img
                src={db.images.logo}
                alt="FURSAN crest"
                className="relative w-[400px] h-[400px] object-contain mix-blend-screen animate-floaty drop-shadow-[0_30px_60px_rgba(143,29,24,0.5)]"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gold/70">
                <IconSignal className="w-4 h-4" />
                <span className="font-cond uppercase tracking-[0.3em] text-[10px]">The Knights of Moroccan Gaming</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/50 animate-bounce" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 9l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="relative border-y border-gold/15 bg-navy/80 overflow-hidden py-4">
        <div className="ticker-track">
          {[...c.ticker, ...c.ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-display text-2xl tracking-[0.14em] text-bone/60">
              {t}
              <span className="text-gold/70 text-base">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ STATS ============ */}
      <section className="relative border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4">
          {c.stats.map((st, i) => {
            const { num, suffix } = parseStat(st.value);
            return (
              <Reveal key={st.label} delay={i * 90} className={`px-6 py-10 ${i > 0 ? "border-l border-bone/8" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-bone/8" : ""}`}>
                <p className="font-display text-5xl sm:text-6xl metal-text leading-none">
                  <CountUp target={num} suffix={suffix} />
                </p>
                <p className="mt-3 font-cond uppercase tracking-[0.24em] text-[11px] text-ash">{st.label}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="What We Do" title={c.featuresTitle} sub={c.featuresSub} />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal key={f.title} delay={(i % 3) * 110}>
                  <article className="panel panel-hover hud cut p-7 h-full group">
                    <div className={`cut-sm w-13 h-13 p-3 flex items-center justify-center mb-6 border ${i % 2 === 0 ? "border-gold/40 text-gold bg-gold/8" : "border-blood/50 text-bloodbright bg-blood/10"}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-2xl tracking-wide mb-2.5 group-hover:text-goldsoft transition-colors">{f.title}</h3>
                    <p className="text-ash leading-relaxed text-[15px]">{f.description}</p>
                    <span className="mt-5 block font-cond uppercase tracking-[0.24em] text-[10px] text-gold/50">
                      0{i + 1} / FURSAN STANDARD
                    </span>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PREVIEWS ============ */}
      <section className="relative py-24 bg-navy/60 border-y border-gold/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-red opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Programs & Departments" title={c.previewsTitle} sub={c.previewsSub} />
          <div className="mt-12 divide-y divide-bone/8 border-y border-bone/8">
            {c.previews.map((p, i) => {
              const meta = previewMeta[i];
              const Icon = meta.icon;
              return (
                <Reveal key={p.title} delay={i * 60}>
                  <Link
                    to={meta.to}
                    className="group grid sm:grid-cols-[64px_1.1fr_1.6fr_auto] items-center gap-5 py-6 px-3 transition-all duration-300 hover:bg-gold/[0.04] hover:pl-6"
                  >
                    <span className="cut-sm w-14 h-14 flex items-center justify-center border border-gold/30 text-gold bg-ink group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                      <Icon className="w-7 h-7" />
                    </span>
                    <span>
                      <span className="block font-display text-2xl tracking-wide group-hover:text-goldsoft transition-colors leading-tight">{p.title}</span>
                      <span className="font-cond uppercase tracking-[0.26em] text-[10px] text-gold/70">{p.tag}</span>
                    </span>
                    <span className="text-ash text-[15px] leading-relaxed hidden sm:block">{p.description}</span>
                    <span className="flex items-center gap-4">
                      <StatusPill status={meta.status} />
                      <IconArrow className="w-5 h-5 text-gold/50 group-hover:text-gold group-hover:translate-x-1.5 transition-all" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FOUNDERS ============ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={db.images.founders} alt="" className="w-full h-full object-cover opacity-[0.16]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-red" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="EST. 2020" title={c.foundersTitle} sub={c.foundersSub} center />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {c.founders.map((f, i) => {
              const initials = f.name.slice(0, 2);
              return (
                <Reveal key={f.name + i} delay={i * 100}>
                  <article className="gold-frame cut p-6 h-full flex flex-col items-center text-center group panel-hover relative overflow-hidden">
                    <span className="absolute top-3 left-4 font-display text-4xl text-outline opacity-70">0{i + 1}</span>
                    <div className="mt-8 w-20 h-20 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gradient-to-b from-steel to-ink group-hover:border-gold transition-all duration-500 group-hover:shadow-[0_0_35px_-5px_rgba(213,169,79,0.55)]">
                      <span className="font-display text-3xl metal-text tracking-wider">{initials}</span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl tracking-[0.1em]">{f.name}</h3>
                    <p className="font-cond uppercase tracking-[0.18em] text-[10px] text-gold/80 mt-1">
                      Founder · {s.communityName}
                    </p>
                    <span className="my-4 h-px w-10 bg-gold/40 group-hover:w-16 transition-all duration-500" />
                    <p className="text-ash text-[13px] leading-relaxed">{f.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative border-t border-gold/15 overflow-hidden">
        <div className="absolute inset-0 glow-red opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.3em] text-xs text-gold mb-4">The Gate Is Open</p>
            <h2 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.92]">
              {c.ctaTitle.split(" ").slice(0, -1).join(" ")} <span className="metal-text">{c.ctaTitle.split(" ").slice(-1)}</span>
            </h2>
            <p className="mt-5 text-ash text-lg max-w-2xl mx-auto">{c.ctaSub}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/community"><Btn className="min-w-[210px]">{c.ctaButton}</Btn></Link>
              <LinkBtn href={s.discordInvite} external variant="outline"><IconDiscord className="w-4 h-4" /> {c.ctaDiscord}</LinkBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
