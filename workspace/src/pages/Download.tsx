import { useMemo, useState } from "react";
import { downloadProjectZip, formatBytes, getExportEntries } from "../lib/zipExport";
import { useApp } from "../context/AppContext";
import { Btn, IconCheck, IconUpload, Reveal, Spinner } from "../components/ui";

export default function Download() {
  const { db } = useApp();
  const entries = useMemo(() => getExportEntries(), []);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ files: number; name: string } | null>(null);

  const total = entries.reduce((s, e) => s + e.size, 0);
  const groups = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const top = e.path.includes("/") ? e.path.split("/")[0] : "(root)";
      if (!map.has(top)) map.set(top, []);
      map.get(top)!.push(e);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [entries]);

  return (
    <div className="pt-[72px]">
      <section className="relative py-16 border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 texture-grid" />
        <div className="absolute -top-24 right-0 w-[520px] h-[520px] glow-red" />
        <div className="absolute -bottom-40 left-0 w-[520px] h-[520px] glow-gold" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <p className="font-cond uppercase tracking-[0.3em] text-gold text-xs mb-3 flex items-center gap-3">
              <span className="h-px w-12 bg-gold/70" /> Project Source · Build-time snapshot
            </p>
            <h1 className="font-display text-6xl sm:text-8xl leading-[0.88] tracking-wide">
              EXPORT <span className="metal-text">EVERYTHING</span>
            </h1>
            <p className="mt-5 text-ash text-lg max-w-2xl leading-relaxed">
              The complete {db.settings.communityName} codebase — every component, the API layer, the
              database schema, deployment docs and environment template — packaged into a single ZIP,
              generated live from the files running this site.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="cut-sm px-4 py-2 border border-gold/35 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-gold/90">
                {entries.length + 1} files
              </span>
              <span className="cut-sm px-4 py-2 border border-gold/35 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-gold/90">
                {formatBytes(total)} source
              </span>
              <span className="cut-sm px-4 py-2 border border-bone/15 bg-ink/70 font-cond uppercase tracking-[0.2em] text-[11px] text-ash">
                fursan-community-source.zip
              </span>
            </div>

            <div className="mt-9">
              {done ? (
                <div className="cut-sm inline-flex items-center gap-3 px-6 py-4 border border-emerald-400/50 bg-emerald-950/50 text-emerald-200">
                  <IconCheck className="w-5 h-5" />
                  <span>
                    <strong>{done.name}</strong> saved — {done.files} files inside. Run{" "}
                    <code className="font-mono text-emerald-300">npm install</code> then{" "}
                    <code className="font-mono text-emerald-300">npm run dev</code>.
                  </span>
                </div>
              ) : (
                <Btn
                  busy={busy}
                  className="min-w-[280px] !py-4 !text-base"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const res = await downloadProjectZip();
                      setDone(res);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Compressing…" : (<><IconUpload className="w-5 h-5 rotate-180" /> Download Source ZIP</>)}
                </Btn>
              )}
            </div>
            {busy && <p className="mt-3 text-xs text-ash flex items-center gap-2"><Spinner className="w-3.5 h-3.5" /> Deflating archive at level 9…</p>}
          </Reveal>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 texture-grid opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl tracking-wide mb-2">ARCHIVE MANIFEST</h2>
            <p className="text-ash text-sm mb-8">
              Exactly what lands on your disk. <span className="text-ash/70">package-lock.json and node_modules are excluded — regenerate with npm install. Brand imagery is referenced by URL and swappable from the admin Image Manager.</span>
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {groups.map(([group, files], gi) => (
              <Reveal key={group} delay={gi * 60}>
                <div className="panel cut p-5 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-cond uppercase tracking-[0.2em] text-xs text-gold">{group}/</p>
                    <p className="font-mono text-[11px] text-ash">{files.length} files · {formatBytes(files.reduce((s, e) => s + e.size, 0))}</p>
                  </div>
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
                    {files.map((f) => (
                      <li key={f.path} className="flex items-center justify-between gap-3 text-[13px] border-b border-bone/5 pb-1.5">
                        <span className="font-mono text-bone/85 truncate">{f.path}</span>
                        <span className="font-mono text-[11px] text-ash shrink-0">{formatBytes(f.size)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
