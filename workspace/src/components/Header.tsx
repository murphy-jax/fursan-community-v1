import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { IconDiscord, IconLock, IconMenu, IconX } from "./ui";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/community", label: "Community" },
  { to: "/esports", label: "Esports" },
  { to: "/ems", label: "EMS" },
  { to: "/lspd", label: "LSPD" },
];

export default function Header() {
  const { db, session } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), []);

  const discord = db.settings.discordInvite;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[80] transition-all duration-500 border-b ${
        scrolled ? "bg-ink/92 backdrop-blur-md border-gold/15 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.9)]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-3 group" aria-label="FURSAN Community home">
          <img
            src={db.images.logo}
            alt="FURSAN logo"
            className="h-11 w-11 object-contain mix-blend-screen transition-transform duration-500 group-hover:scale-110"
          />
          <span className="leading-none">
            <span className="block font-display text-xl tracking-[0.12em] text-bone group-hover:text-goldsoft transition-colors">
              {db.settings.communityName.split(" ")[0]}
            </span>
            <span className="block font-cond uppercase tracking-[0.34em] text-[10px] text-gold/80">Community</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `relative px-4 py-2 font-cond uppercase tracking-[0.2em] text-[13px] transition-colors after:absolute after:left-4 after:right-4 after:-bottom-0.5 after:h-[2px] after:origin-left after:transition-transform after:duration-300 ${
                  isActive
                    ? "text-goldsoft after:scale-x-100 after:bg-gold"
                    : "text-bone/70 hover:text-bone after:scale-x-0 after:bg-gold/60 hover:after:scale-x-100"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to={session ? "/admin/dashboard" : "/admin"}
            className="cut-sm inline-flex items-center gap-2 px-4 py-2.5 border border-bone/15 text-bone/80 hover:border-gold/60 hover:text-gold font-cond uppercase tracking-[0.18em] text-[12px] transition-all"
          >
            <IconLock className="w-3.5 h-3.5" />
            {session ? "Dashboard" : "Admin Login"}
          </Link>
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            className="cut-sm inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold font-cond uppercase tracking-[0.18em] text-[12px] hover:brightness-110 transition-all shadow-[0_8px_25px_-8px_rgba(213,169,79,0.6)]"
          >
            <IconDiscord className="w-4 h-4" />
            Join Discord
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-bone hover:text-gold transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <IconX className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* mobile panel */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${open ? "max-h-[480px]" : "max-h-0"}`}
      >
        <nav className="bg-ink/97 backdrop-blur-md border-t border-gold/10 px-6 py-5 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `px-3 py-3 font-display text-2xl tracking-[0.1em] border-l-2 transition-colors ${
                  isActive ? "text-goldsoft border-gold" : "text-bone/75 border-transparent hover:text-bone"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <div className="flex gap-3 mt-4">
            <Link
              to={session ? "/admin/dashboard" : "/admin"}
              className="cut-sm flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-bone/20 text-bone font-cond uppercase tracking-[0.18em] text-[12px]"
            >
              <IconLock className="w-4 h-4" />
              {session ? "Dashboard" : "Admin Login"}
            </Link>
            <a
              href={discord}
              target="_blank"
              rel="noopener noreferrer"
              className="cut-sm flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold font-cond uppercase tracking-[0.18em] text-[12px]"
            >
              <IconDiscord className="w-4 h-4" />
              Discord
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
