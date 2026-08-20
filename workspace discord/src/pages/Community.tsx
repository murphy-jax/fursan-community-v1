import CanvasHero from "../components/CanvasHero";
import { AngularButton, FursanLogo, Icon, Reveal, SectionHead, TiltCard } from "../components/ui";
import { useSite } from "../state/SiteContext";

const VALUE_ICONS = ["shield", "target", "users", "ladder"];
const LIFE_ICONS = ["headset", "calendar", "trophy", "globe", "radio", "controller"];

export default function Community() {
  const { state } = useSite();
  const c = state.content.community;
  const s = state.settings;

  const lifeCards = [
    { icon: LIFE_ICONS[0], title: "NIGHTLY SCRIM BLOCKS", desc: "Booked slots every evening — show up, get matched, play structured games with feedback." },
    { icon: LIFE_ICONS[1], title: "COMMUNITY CUPS", desc: "Monthly brackets across all four titles with prize pools funded by the community treasury." },
    { icon: LIFE_ICONS[2], title: "WATCH PARTIES", desc: "Big-stage finals in voice with the whole server. Loud, biased, and proudly Moroccan." },
    { icon: LIFE_ICONS[3], title: "REGIONAL MEETUPS", desc: "From Casa to Marrakech — IRL meetups and LAN gatherings when the season allows." },
    { icon: LIFE_ICONS[4], title: "CONTENT PIPELINE", desc: "Clip channels, highlight reels and creator collabs that put FURSAN players on the map." },
    { icon: LIFE_ICONS[5], title: "LFG THAT WORKS", desc: "Dedicated looking-for-group channels with rank filters, so the squad finds you." },
  ];

  return (
    <div className="relative">
      {/* hero */}
      <section className="relative min-h-[72vh] flex items-end overflow-hidden scanlines border-b border-ink-700">
        <CanvasHero />
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
          <img src={state.images.communityHero} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/80 pointer-events-none" />
        <div className="absolute right-4 top-24 w-72 opacity-[0.14] hidden lg:block floaty pointer-events-none">
          <FursanLogo src={state.images.logo} className="w-full h-auto aspect-square" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16 pt-40">
          <Reveal variant="clip">
            <p className="font-mono text-[11px] tracking-[0.32em] text-brand-400">// {c.eyebrow}</p>
          </Reveal>
          <h1 className="mt-4 font-display font-bold uppercase leading-[0.92] text-fog-100 text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl">
            {c.title.split(".")[0]}<span className="text-brand-400">.</span>
            <span className="block text-outline">{c.title.split(".").slice(1).join(".").trim() || "A STANDARD."}</span>
          </h1>
          <Reveal delay={200}>
            <p className="mt-6 max-w-2xl text-fog-300 text-lg leading-relaxed">{c.desc}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap gap-3">
              {[`${s.memberCount.toLocaleString()} MEMBERS`, "EST. 2020", "4 DIVISIONS", "1 STANDARD"].map((chip) => (
                <span key={chip} className="clip-tag border border-ink-600 bg-ink-900/70 px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-fog-300">
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* story + mission */}
      <section className="relative py-24">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1.4fr_1fr] gap-14">
          <div>
            <SectionHead eyebrow="TRANSMISSION LOG" title={c.storyTitle} />
            <div className="mt-8 space-y-5">
              {c.story.map((p, i) => (
                <Reveal key={i} delay={i * 100} variant="left">
                  <p className="relative pl-6 text-fog-300 leading-relaxed border-l-2 border-ink-600 hover:border-brand-500/60 transition-colors">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rotate-45 bg-brand-500" />
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="lg:pt-16">
            <Reveal variant="right">
              <div className="hud-corners clip-card relative border border-brand-500/25 bg-gradient-to-b from-ink-850 to-ink-900 p-8 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <Icon name="sword" className="w-8 h-8 text-brand-400" />
                <p className="mt-5 font-mono text-[10.5px] tracking-[0.3em] text-brand-400">{c.missionTitle}</p>
                <p className="mt-4 font-display font-semibold text-xl leading-snug text-fog-100">{c.mission}</p>
                <div className="mt-6 metal-line" />
                <p className="mt-4 font-mono text-[10px] tracking-[0.24em] text-fog-500">SIGNED — THE FOUNDING COUNCIL</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="relative py-24 border-y border-ink-700 bg-ink-900/60 overflow-hidden">
        <div className="absolute -top-20 left-10 font-display font-bold text-[9rem] leading-none text-outline-faint select-none pointer-events-none hidden xl:block">CODE</div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead align="center" eyebrow="THE KNIGHT'S CODE" title="FOUR PILLARS. ZERO EXCEPTIONS." />
          <div className="mt-14 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {c.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <TiltCard className="h-full">
                  <div className="group relative h-full clip-card border border-ink-600 bg-ink-900 p-7 hover:border-brand-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="clip-tag grid place-items-center w-11 h-11 border border-brand-500/30 bg-brand-500/5 text-brand-400 group-hover:bg-brand-500 group-hover:text-ink-950 transition-all duration-300">
                        <Icon name={VALUE_ICONS[i % VALUE_ICONS.length]} className="w-5 h-5" />
                      </span>
                      <span className="font-display font-bold text-4xl text-outline-faint">0{i + 1}</span>
                    </div>
                    <h3 className="mt-6 font-display font-bold text-lg tracking-[0.1em] text-fog-100">{v.title}</h3>
                    <p className="mt-2.5 text-sm text-fog-300 leading-relaxed">{v.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* quote */}
      <section className="relative py-28 overflow-hidden scanlines">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(227,178,60,0.07),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Reveal variant="clip">
            <Icon name="radio" className="w-8 h-8 text-brand-400 mx-auto" />
          </Reveal>
          <Reveal delay={120}>
            <blockquote className="mt-8 font-display font-semibold text-2xl sm:text-4xl leading-snug text-fog-100">
              “{c.quote}”
            </blockquote>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-8 font-mono text-[11px] tracking-[0.34em] text-brand-400">— {c.quoteBy} —</p>
          </Reveal>
        </div>
      </section>

      {/* life inside fursan */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="SERVER ACTIVITY" title={c.featuresTitle} desc={c.featuresSub} />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lifeCards.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="group relative clip-card border border-ink-600 bg-ink-900/80 p-6 flex gap-5 hover:border-brand-500/40 hover:bg-ink-850 transition-all">
                  <span className="shrink-0 clip-tag grid place-items-center w-11 h-11 border border-ink-600 text-fog-400 group-hover:text-brand-400 group-hover:border-brand-500/40 transition-colors">
                    <Icon name={f.icon} className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold tracking-[0.08em] text-fog-100">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-fog-300 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 border-t border-ink-700 bg-ink-900/70 overflow-hidden">
        <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center text-center">
          <Reveal>
            <h2 className="font-display font-bold uppercase text-3xl sm:text-5xl text-fog-100 leading-[0.95] max-w-3xl">{c.ctaTitle}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 max-w-xl text-fog-300">{c.ctaBody}</p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <AngularButton href={s.discordInvite} size="lg"><Icon name="discord" className="w-5 h-5" /> {c.ctaBtn}</AngularButton>
              <AngularButton to="/esports" variant="outline" size="lg">SEE ESPORTS PROGRAMS <Icon name="arrowRight" className="w-4 h-4" /></AngularButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
