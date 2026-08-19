import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ApplicationForm } from "../components/ApplicationForm";
import { IconArrow, Reveal } from "../components/ui";
import type { AppType } from "../lib/db";

const TITLES: Record<AppType, { eyebrow: string; title: string; back: string; backTo: string }> = {
  esports: { eyebrow: "FURSAN Esports · Direct Application", title: "JOIN THE ROSTERS", back: "Back to Esports", backTo: "/esports" },
  ems: { eyebrow: "San Andreas EMS · Direct Application", title: "ENLIST AS A MEDIC", back: "Back to EMS", backTo: "/ems" },
  lspd: { eyebrow: "Los Santos PD · Direct Application", title: "ENLIST AS AN OFFICER", back: "Back to LSPD", backTo: "/lspd" },
};

export default function Apply() {
  const { kind } = useParams<{ kind: string }>();
  const [params] = useSearchParams();
  if (!kind || !["esports", "ems", "lspd"].includes(kind)) return <Navigate to="/" replace />;
  const k = kind as AppType;
  const meta = TITLES[k];
  const program = params.get("program") ?? undefined;

  return (
    <div className="pt-[72px]">
      <section className="relative py-16 overflow-hidden border-b border-gold/10">
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] glow-red" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <Link to={meta.backTo} className="inline-flex items-center gap-2 font-cond uppercase tracking-[0.2em] text-xs text-gold hover:text-goldsoft transition-colors mb-6">
              <IconArrow className="w-4 h-4 rotate-180" /> {meta.back}
            </Link>
            <p className="font-cond uppercase tracking-[0.3em] text-gold text-xs mb-3">{meta.eyebrow}</p>
            <h1 className="font-display text-5xl sm:text-7xl tracking-wide leading-[0.9]">
              {meta.title.split(" ").slice(0, -1).join(" ")} <span className="metal-text">{meta.title.split(" ").slice(-1)}</span>
            </h1>
            <p className="mt-4 text-ash max-w-2xl">
              This is the official direct URL for {k === "esports" ? "esports" : k.toUpperCase()} applications.
              Every field is validated and stored securely — you will receive a private reference code.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="gold-frame cut">
              <ApplicationForm key={`${k}-${program ?? ""}`} kind={k} presetProgram={program} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
