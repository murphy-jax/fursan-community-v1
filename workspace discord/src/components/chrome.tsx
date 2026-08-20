import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSite } from "../state/SiteContext";
import { useAuth } from "../state/AuthContext";
import { AngularButton, FursanLogo, Icon } from "./ui";

const NAV = [
  { to: "/", label: "HOME" },
  { to: "/community", label: "COMMUNITY" },
  { to: "/esports", label: "ESPORTS" },
  { to: "/tournaments", label: "TOURNAMENTS" },
];

/* Connected knight chip (Discord identity from the gate) */
function UserChip({ compact = false }: { compact?: boolean }) {
  const { identity, signOutUser } = useAuth();
  if (!identity) return null;
  return (
    <div
      className={`flex items-center gap-2.5 clip-tag border border-brand-500/30 bg-brand-500/5 ${
        compact ? "px-2 py-1.5" : "pl-1.5 pr-2 py-1"
      }`}
      title={`Verified Discord identity — ID ${identity.discordId}`}
    >
      {identity.avatar ? (
        <img src={identity.avatar} alt="" className="w-7 h-7 rounded-full ring-1 ring-brand-500/40" referrerPolicy="no-referrer" />
      ) : (
        <span className="w-7 h-7 rounded-full grid place-items-center bg-brand-500/20 text-brand-300">
          <Icon name="discord" className="w-4 h-4" />
        </span>
      )}
      <div className="leading-none">
        <p className="font-mono text-[11px] text-fog-100 max-w-28 truncate">@{identity.username}</p>
        <p className="mt-1 font-mono text-[8px] tracking-[0.2em] text-mint-400 inline-flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-mint-400 pulse-dot" /> VERIFIED
        </p>
      </div>
      <button
        onClick={() => void signOutUser()}
        className="ml-1 text-fog-500 hover:text-blood-400 transition-colors"
        aria-label="Disconnect Discord"
        title="Disconnect"
      >
        <Icon name="x" className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Header() {
  const { state } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? "bg-ink-950/90 backdrop-blur-md border-ink-600/70 shadow-[0_8px_30px_rgba(0,0,0,0.5)]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[72px]">
        {/* brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative">
            <FursanLogo src={state.images.logo} className="w-10 h-10 sm:w-11 sm:h-11 transition-transform duration-300 group-hover:scale-110" eager />
          </span>
          <span className="leading-none">
            <span className="block font-display font-bold tracking-[0.18em] text-fog-100 text-sm sm:text-base">
              FURSAN<span className="text-brand-400">.</span>
            </span>
            <span className="block font-mono text-[9px] tracking-[0.34em] text-fog-400 mt-1">COMMUNITY · EST. 2020</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `link-underline font-display text-[13px] font-semibold tracking-[0.16em] transition-colors ${
                  isActive ? "text-brand-300 active" : "text-fog-300 hover:text-fog-100"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <UserChip />
          <Link
            to="/admin"
            className="clip-btn inline-flex items-center gap-2 border border-blood-500/50 text-blood-300 hover:bg-blood-500/10 hover:border-blood-400 px-4 py-2 font-display text-xs font-semibold tracking-[0.16em] transition-all"
          >
            <Icon name="lock" className="w-3.5 h-3.5" /> ADMIN LOGIN
          </Link>
          <AngularButton href={state.settings.discordInvite} size="sm">
            <Icon name="discord" className="w-4 h-4" /> JOIN DISCORD
          </AngularButton>
        </div>

        {/* mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/admin"
            className="clip-btn inline-flex items-center gap-1.5 border border-blood-500/50 text-blood-300 px-3 py-2 font-display text-[11px] font-semibold tracking-[0.12em]"
          >
            <Icon name="lock" className="w-3.5 h-3.5" /> ADMIN
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="clip-btn grid place-items-center w-10 h-10 border border-ink-600 text-fog-200 hover:border-brand-500/60 hover:text-brand-300 transition-colors"
          >
            <Icon name={open ? "x" : "menu"} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-ink-950/95 backdrop-blur-md border-b border-ink-700 ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-6 py-5 flex flex-col gap-1">
          {NAV.map((n, i) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={({ isActive }) =>
                `flex items-center justify-between py-3 border-b border-ink-800 font-display font-semibold tracking-[0.18em] text-sm ${
                  isActive ? "text-brand-300" : "text-fog-200"
                }`
              }
            >
              {n.label}
              <Icon name="chevronRight" className="w-4 h-4 text-fog-500" />
            </NavLink>
          ))}
          <AngularButton href={state.settings.discordInvite} className="mt-4">
            <Icon name="discord" className="w-4 h-4" /> JOIN DISCORD
          </AngularButton>
          <div className="mt-4">
            <UserChip compact />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { state } = useSite();
  const s = state.settings;
  const socials: { key: keyof typeof s.socials; label: string; icon: string }[] = [
    { key: "youtube", label: "YouTube", icon: "external" },
    { key: "twitch", label: "Twitch", icon: "pulse" },
    { key: "instagram", label: "Instagram", icon: "eye" },
    { key: "twitter", label: "X / Twitter", icon: "globe" },
    { key: "tiktok", label: "TikTok", icon: "headset" },
  ];

  return (
    <footer className="relative border-t border-ink-700 bg-ink-900 overflow-hidden">
      <div className="absolute inset-0 grid-bg-faint opacity-60 pointer-events-none" />
      <div className="absolute -top-px left-0 right-0 metal-line opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <FursanLogo src={state.images.logo} className="w-14 h-14" />
              <div>
                <p className="font-display font-bold tracking-[0.16em] text-fog-100">{s.communityName}</p>
                <p className="font-mono text-[10px] tracking-[0.3em] text-brand-400 mt-1">EST. 2020 · MOROCCO</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-fog-300 leading-relaxed max-w-sm">{s.footerAbout}</p>
            <a
              href={s.discordInvite}
              target="_blank"
              rel="noreferrer noopener"
              className="clip-btn mt-6 inline-flex items-center gap-2 bg-brand-500 text-ink-950 font-display font-bold text-xs tracking-[0.16em] px-5 py-2.5 hover:bg-brand-300 transition-colors"
            >
              <Icon name="discord" className="w-4 h-4" /> JOIN THE SERVER
            </a>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-fog-400">NAVIGATE</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-sm text-fog-300 hover:text-brand-300 transition-colors link-underline">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/apply/esports" className="text-sm text-fog-300 hover:text-brand-300 transition-colors link-underline">
                  ESPORTS APPLICATION
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-fog-400">DIVISIONS</p>
            <ul className="mt-4 space-y-2.5 text-sm text-fog-300">
              {state.programs.map((p) => (
                <li key={p.id}>
                  <Link to="/esports" className="hover:text-brand-300 transition-colors">{p.title}</Link>
                </li>
              ))}

            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-fog-400">SIGNALS</p>
            <ul className="mt-4 space-y-2.5">
              {socials.filter((x) => s.socials[x.key]).map((x) => (
                <li key={x.key}>
                  <a
                    href={s.socials[x.key]}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2.5 text-sm text-fog-300 hover:text-brand-300 transition-colors group"
                  >
                    <Icon name={x.icon} className="w-4 h-4 text-fog-500 group-hover:text-brand-400 transition-colors" />
                    {x.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/admin" className="flex items-center gap-2.5 text-sm text-fog-300 hover:text-blood-300 transition-colors">
                  <Icon name="lock" className="w-4 h-4 text-fog-500" /> Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-brand-400/80">
            {s.footerBuilt} <span className="blink-cursor">▊</span>
          </p>
          <p className="font-mono text-[10.5px] text-fog-500 tracking-wider">
            © {new Date().getFullYear()} {s.communityName} · ALL RIGHTS RESERVED · DIMA FURSAN
          </p>
        </div>
      </div>
    </footer>
  );
}
