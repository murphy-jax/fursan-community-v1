import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { IconDiscord } from "./ui";

const SOCIAL_META: { key: "youtube" | "instagram" | "x" | "tiktok" | "twitch"; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X (Twitter)" },
  { key: "tiktok", label: "TikTok" },
  { key: "twitch", label: "Twitch" },
];

export default function Footer() {
  const { db } = useApp();
  const c = db.content.footer;
  const s = db.settings;

  return (
    <footer className="relative border-t border-gold/15 bg-navy mt-0">
      <div className="absolute inset-0 glow-red opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src={db.images.logo} alt="FURSAN logo" className="h-14 w-14 object-contain mix-blend-screen" />
            <div>
              <p className="font-display text-2xl tracking-[0.12em]">{s.communityName}</p>
              <p className="font-cond uppercase tracking-[0.3em] text-[10px] text-gold/80">EST. 2020 · Morocco</p>
            </div>
          </div>
          <p className="text-ash max-w-md leading-relaxed">{c.description}</p>
          <p className="mt-6 font-cond uppercase tracking-[0.3em] text-xs metal-text">{c.builtLine}</p>
        </div>

        <div>
          <p className="font-cond uppercase tracking-[0.25em] text-xs text-gold/90 mb-5">Navigate</p>
          <ul className="space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/community", label: "Community" },
              { to: "/esports", label: "Esports" },
              { to: "/ems", label: "EMS" },
              { to: "/lspd", label: "LSPD" },
              { to: "/admin", label: "Admin Login" },
              { to: "/download", label: "Download Source (ZIP)" },
            ].map((l) => (
              <li key={l.to + l.label}>
                <Link to={l.to} className="text-ash hover:text-goldsoft transition-colors inline-flex items-center gap-2 group">
                  <span className="h-px w-4 bg-gold/40 group-hover:w-6 group-hover:bg-gold transition-all" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-cond uppercase tracking-[0.25em] text-xs text-gold/90 mb-5">Connect</p>
          <a
            href={s.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="cut-sm inline-flex items-center gap-2.5 px-5 py-3 border border-gold/40 text-gold hover:bg-gold/10 font-cond uppercase tracking-[0.18em] text-xs transition-all mb-6"
          >
            <IconDiscord className="w-4 h-4" />
            Discord Server
          </a>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_META.filter((x) => s.socials[x.key]).map((x) => (
              <a
                key={x.key}
                href={s.socials[x.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="cut-sm px-3.5 py-2 border border-bone/15 text-ash hover:text-gold hover:border-gold/50 font-cond uppercase tracking-[0.16em] text-[11px] transition-all"
              >
                {x.label}
              </a>
            ))}
          </div>
          {s.footerText && <p className="mt-6 text-xs text-ash/70 leading-relaxed max-w-sm">{s.footerText}</p>}
        </div>
      </div>

      <div className="relative border-t border-bone/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-cond uppercase tracking-[0.2em] text-[11px] text-ash/80">
            © {new Date().getFullYear()} {c.copyright}
          </p>
          <p className="font-cond uppercase tracking-[0.2em] text-[11px] text-gold/70">
            {s.memberCount.toLocaleString()}+ members strong
          </p>
        </div>
      </div>
    </footer>
  );
}
