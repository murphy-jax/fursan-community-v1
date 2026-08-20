import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AngularButton, Field, Icon, Monogram, Reveal, StatusBadge } from "../components/ui";
import { useSite } from "../state/SiteContext";
import { useAuth } from "../state/AuthContext";
import { submitApplication, validateApplication } from "../lib/backend";
import type { ApplicationData } from "../lib/backend";

const EMPTY: ApplicationData = {
  fullName: "", discordUsername: "", discordId: "", age: "", country: "", platform: "",
  playerId: "", currentRank: "", peakRank: "", mainRole: "", previousTeams: "",
  compExperience: "", tournamentExperience: "", availability: "", whyFursan: "", additionalInfo: "",
};

const STEPS = [
  { id: 0, name: "IDENTITY", sub: "Who is reporting for duty", fields: ["fullName", "discordUsername", "discordId", "age", "country"] as (keyof ApplicationData)[] },
  { id: 1, name: "COMBAT PROFILE", sub: "Where you fight and how hard", fields: ["platform", "playerId", "currentRank", "peakRank", "mainRole", "previousTeams"] as (keyof ApplicationData)[] },
  { id: 2, name: "MOTIVATION", sub: "Why you ride with FURSAN", fields: ["compExperience", "tournamentExperience", "availability", "whyFursan", "additionalInfo"] as (keyof ApplicationData)[] },
];

const REQUIRED_KEYS: (keyof ApplicationData)[] = [
  "fullName", "discordUsername", "discordId", "age", "country", "platform", "playerId",
  "currentRank", "peakRank", "mainRole", "compExperience", "availability", "whyFursan",
];

export default function Apply() {
  const { state, ready } = useSite();
  const { identity } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState<ApplicationData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [program, setProgram] = useState(params.get("program") ?? "");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ref: string } | null>(null);
  const [serverError, setServerError] = useState("");

  const selected = useMemo(() => state.programs.find((p) => p.id === program), [state.programs, program]);

  useEffect(() => {
    const pp = params.get("platform");
    if (pp) setForm((f) => ({ ...f, platform: pp }));
  }, [params]);

  /* verified Discord identity from the gate — stamped in, locked */
  useEffect(() => {
    if (!identity) return;
    setForm((f) => ({ ...f, discordUsername: identity.username, discordId: identity.discordId }));
    setErrors((er) => { const n = { ...er }; delete n.discordUsername; delete n.discordId; return n; });
  }, [identity]);

  useEffect(() => {
    if (!program && ready && state.programs.length) {
      const open = state.programs.find((p) => p.status === "open");
      setProgram(open?.id ?? state.programs[0].id);
    }
  }, [ready, state.programs, program]);

  const set = (k: keyof ApplicationData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  /* completeness of the live dossier */
  const completeness = Math.round(
    (REQUIRED_KEYS.filter((k) => String(form[k] ?? "").trim().length > 0).length / REQUIRED_KEYS.length) * 100
  );

  const stepValid = (i: number) => STEPS[i].fields.every((k) => !errors[k] && String(form[k] ?? "").trim().length > 0);

  const nextStep = () => {
    const errs = validateApplication(form);
    const stepErrs: Record<string, string> = {};
    STEPS[step].fields.forEach((k) => {
      if (!String(form[k] ?? "").trim()) stepErrs[k] = "Required field.";
      else if (errs[k]) stepErrs[k] = errs[k];
    });
    setErrors((er) => ({ ...er, ...stepErrs }));
    if (Object.keys(stepErrs).length === 0) setStep((s) => Math.min(2, s + 1));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validateApplication(form);
    if (!program) errs.program = "Select a program.";
    if (selected && selected.status !== "open") {
      errs.program = "This program is not currently recruiting. Pick an open program or check Discord for the next window.";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = [...STEPS[0].fields, ...STEPS[1].fields, ...STEPS[2].fields].find((k) => errs[k]);
      if (firstKey) {
        const owner = STEPS.findIndex((s) => s.fields.includes(firstKey));
        if (owner >= 0) setStep(owner);
      }
      document.querySelector(".invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    const res = await submitApplication(program, form);
    setSubmitting(false);
    if (res.ok) {
      setResult({ ref: res.ref });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setServerError(res.message);
    }
  };

  const copyRef = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.ref); } catch { /* noop */ }
  };

  /* ---------------- success screen ---------------- */
  if (result) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 py-32 overflow-hidden scanlines">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(33,229,140,0.07),transparent_60%)] pointer-events-none" />
        <div className="relative w-full max-w-xl hud-corners clip-card border border-mint-500/30 bg-ink-900 p-10 text-center modal-in">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-mint-400 to-transparent" />
          <span className="mx-auto clip-tag grid place-items-center w-16 h-16 border border-mint-500/50 bg-mint-500/10 text-mint-400">
            <Icon name="check" className="w-8 h-8" strokeWidth={2} />
          </span>
          <p className="mt-6 font-mono text-[11px] tracking-[0.32em] text-mint-400">APPLICATION RECEIVED</p>
          <h1 className="mt-3 font-display font-bold text-3xl text-fog-100 tracking-tight uppercase">Welcome to the queue, knight.</h1>
          <p className="mt-4 text-fog-300 leading-relaxed">
            Your application for <span className="text-brand-300 font-semibold">{selected?.title ?? program.toUpperCase()}</span> has been
            encrypted into the FURSAN database. Staff review every submission personally — expect a Discord contact if you are shortlisted for trials.
          </p>
          <div className="mt-7 clip-tag border border-ink-600 bg-ink-850 p-5">
            <p className="font-mono text-[10px] tracking-[0.3em] text-fog-500">YOUR PRIVATE REFERENCE</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-xl sm:text-2xl text-brand-300 tracking-[0.14em]">{result.ref}</span>
              <button onClick={copyRef} className="clip-btn border border-ink-600 p-2 text-fog-400 hover:text-brand-300 hover:border-brand-500/50 transition-colors" aria-label="Copy reference">
                <Icon name="doc" className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-fog-500 tracking-wider">STATUS: PENDING · KEEP THIS REFERENCE SAFE</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <AngularButton to="/esports" variant="outline"><Icon name="chevronLeft" className="w-4 h-4" /> BACK TO ESPORTS</AngularButton>
            <AngularButton href={state.settings.discordInvite}><Icon name="discord" className="w-4 h-4" /> JOIN DISCORD</AngularButton>
          </div>
        </div>
      </div>
    );
  }

  const cur = STEPS[step];

  /* ---------------- wizard ---------------- */
  return (
    <div className="relative pt-28 pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg-faint pointer-events-none" />
      <div className="absolute -top-32 right-0 w-[30rem] h-[30rem] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal variant="clip">
          <p className="font-mono text-[11px] tracking-[0.32em] text-brand-400">// ESPORTS RECRUITMENT TERMINAL</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-3 font-display font-bold uppercase text-4xl sm:text-5xl text-fog-100 tracking-tight leading-[0.95]">
            APPLY TO <span className="text-outline">FURSAN ESPORTS</span>
          </h1>
        </Reveal>

        {/* program selector */}
        <Reveal delay={160}>
          <div className="mt-8 clip-card border border-ink-600 bg-ink-900/80 p-5">
            <p className="font-mono text-[10.5px] tracking-[0.26em] text-fog-400 mb-3.5">CHOOSE YOUR BATTLEGROUND {errors.program && <span className="text-blood-400">— {errors.program}</span>}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {state.programs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProgram(p.id); setErrors((er) => { const n = { ...er }; delete n.program; return n; }); }}
                  className={`clip-btn relative border p-4 text-left transition-all ${
                    program === p.id ? "border-brand-400 bg-brand-500/10 shadow-[0_0_20px_rgba(227,178,60,0.18)]" : "border-ink-600 bg-ink-850 hover:border-brand-500/40"
                  }`}
                >
                  <span className="font-display font-bold text-sm tracking-[0.08em] text-fog-100">{p.title}</span>
                  <span className="mt-2 block"><StatusBadge status={p.status} /></span>
                </button>
              ))}
            </div>
            {selected && (
              <p className={`mt-4 text-sm font-mono ${selected.status === "open" ? "text-mint-400/90" : "text-amberx-400/90"}`}>
                ▸ {selected.status === "open" ? state.content.esports.openNote : selected.status === "temporary" ? state.content.esports.temporaryNote : state.content.esports.closedNote}
              </p>
            )}
          </div>
        </Reveal>

        {serverError && (
          <div className="mt-6 clip-card border border-blood-500/50 bg-blood-500/10 p-4 flex items-center gap-3 text-blood-300 text-sm">
            <Icon name="alert" className="w-5 h-5 shrink-0" /> {serverError}
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* ---------- wizard column ---------- */}
          <form onSubmit={onSubmit} noValidate>
            {/* progress rail */}
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className="flex items-center gap-3 group"
                  >
                    <span className={`clip-tag grid place-items-center w-10 h-10 border font-display font-bold text-sm transition-all duration-300 ${
                      i < step ? "border-mint-500/60 bg-mint-500/10 text-mint-400"
                        : i === step ? "border-brand-400 bg-brand-500/15 text-brand-300 shadow-[0_0_18px_rgba(227,178,60,0.3)]"
                        : "border-ink-600 bg-ink-850 text-fog-500"
                    }`}>
                      {i < step ? <Icon name="check" className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className={`hidden sm:block text-left ${i > step ? "opacity-40" : ""}`}>
                      <span className={`block font-display font-bold text-[12px] tracking-[0.12em] ${i === step ? "text-brand-300" : "text-fog-300"}`}>{s.name}</span>
                      <span className="block font-mono text-[9px] text-fog-500 tracking-wider">{s.sub}</span>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className={`mx-3 h-px flex-1 transition-colors duration-500 ${i < step ? "bg-mint-500/60" : "bg-ink-600"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* step body */}
            <div className="mt-6 hud-corners clip-card border border-ink-600 bg-ink-900/80 p-6 sm:p-8">
              <p className="font-mono text-[10px] tracking-[0.26em] text-fog-500">PHASE {step + 1} / 3 — {cur.name}</p>

              {step === 0 && (
                <div className="mt-5 grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required error={errors.fullName}>
                    <input className={`hud-input ${errors.fullName ? "invalid" : ""}`} value={form.fullName} onChange={set("fullName")} placeholder="Your real name" maxLength={80} />
                  </Field>
                  <Field label="Discord Username" required error={errors.discordUsername} hint={identity ? "from your login" : undefined}>
                    <div className="relative">
                      <input className={`hud-input pr-24 ${identity ? "opacity-75" : ""}`} value={form.discordUsername} onChange={set("discordUsername")} disabled={!!identity} placeholder="e.g. knight_fursan" maxLength={60} />
                      {identity && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 clip-tag bg-mint-500/15 border border-mint-500/50 text-mint-400 font-mono text-[8.5px] tracking-[0.18em] px-2 py-1">
                          VERIFIED
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Discord User ID" required error={errors.discordId} hint={identity ? "from your login" : "16–22 digits"}>
                    <div className="relative">
                      <input className={`hud-input font-mono pr-24 ${identity ? "opacity-75" : ""}`} value={form.discordId} onChange={set("discordId")} disabled={!!identity} placeholder="e.g. 219466376712355840" inputMode="numeric" maxLength={22} />
                      {identity && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 clip-tag bg-mint-500/15 border border-mint-500/50 text-mint-400 font-mono text-[8.5px] tracking-[0.18em] px-2 py-1">
                          VERIFIED
                        </span>
                      )}
                    </div>
                  </Field>
                  {identity && (
                    <p className="sm:col-span-2 clip-tag border border-mint-500/30 bg-mint-500/5 px-4 py-3 font-mono text-[10.5px] tracking-wider text-mint-400/90 leading-relaxed">
                      <Icon name="shield" className="inline w-3.5 h-3.5 mr-2" />
                      Identity locked from your Discord login — your team role and welcome DM will be delivered to this exact account.
                    </p>
                  )}
                  <Field label="Age" required error={errors.age} hint="13–99">
                    <input className={`hud-input ${errors.age ? "invalid" : ""}`} value={form.age} onChange={set("age")} placeholder="e.g. 19" inputMode="numeric" maxLength={3} />
                  </Field>
                  <Field label="Country / Timezone" required error={errors.country} className="sm:col-span-2">
                    <input className={`hud-input ${errors.country ? "invalid" : ""}`} value={form.country} onChange={set("country")} placeholder="e.g. Morocco — GMT+1" maxLength={80} />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="mt-5 grid sm:grid-cols-2 gap-5">
                  <Field label="Platform" required error={errors.platform}>
                    <select className={`hud-input ${errors.platform ? "invalid" : ""}`} value={form.platform} onChange={set("platform")}>
                      <option value="">— select —</option>
                      {(selected ? selected.platform.split("·").map((x) => x.trim()) : []).map((pl) => (
                        <option key={pl} value={pl}>{pl}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Player / Game ID" required error={errors.playerId}>
                    <input className={`hud-input ${errors.playerId ? "invalid" : ""}`} value={form.playerId} onChange={set("playerId")} placeholder="Riot ID / PSN / Steam64 / EA ID" maxLength={80} />
                  </Field>
                  <Field label="Current Rank" required error={errors.currentRank}>
                    <input className={`hud-input ${errors.currentRank ? "invalid" : ""}`} value={form.currentRank} onChange={set("currentRank")} placeholder="e.g. Immortal 2 / Div 3 / 2400 MMR" maxLength={60} />
                  </Field>
                  <Field label="Peak Rank" required error={errors.peakRank}>
                    <input className={`hud-input ${errors.peakRank ? "invalid" : ""}`} value={form.peakRank} onChange={set("peakRank")} placeholder="Highest rank ever reached" maxLength={60} />
                  </Field>
                  <Field label="Main Role / Agents" required error={errors.mainRole} className="sm:col-span-2">
                    <input className={`hud-input ${errors.mainRole ? "invalid" : ""}`} value={form.mainRole} onChange={set("mainRole")} placeholder="e.g. Initiator — Sova, KAY/O, Fade" maxLength={120} />
                  </Field>
                  <Field label="Previous Teams" error={errors.previousTeams} className="sm:col-span-2" hint="optional">
                    <input className={`hud-input ${errors.previousTeams ? "invalid" : ""}`} value={form.previousTeams} onChange={set("previousTeams")} placeholder="Team names + rough dates, or leave empty" maxLength={300} />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 grid gap-5">
                  <Field label="Competitive Experience" required error={errors.compExperience}>
                    <textarea className={`hud-input min-h-28 resize-y ${errors.compExperience ? "invalid" : ""}`} value={form.compExperience} onChange={set("compExperience")} placeholder="Ladders, ranked seasons, faceit level, scrims frequency…" maxLength={1200} />
                  </Field>
                  <Field label="Tournament Experience" error={errors.tournamentExperience} hint="optional">
                    <textarea className={`hud-input min-h-24 resize-y ${errors.tournamentExperience ? "invalid" : ""}`} value={form.tournamentExperience} onChange={set("tournamentExperience")} placeholder="Notable cups, LANs, placements…" maxLength={1200} />
                  </Field>
                  <Field label="Availability" required error={errors.availability}>
                    <input className={`hud-input ${errors.availability ? "invalid" : ""}`} value={form.availability} onChange={set("availability")} placeholder="e.g. Weekdays 19:00–23:00 GMT+1, full weekends" maxLength={300} />
                  </Field>
                  <Field label="Why FURSAN?" required error={errors.whyFursan}>
                    <textarea className={`hud-input min-h-32 resize-y ${errors.whyFursan ? "invalid" : ""}`} value={form.whyFursan} onChange={set("whyFursan")} placeholder="What do you want from us, and what do you bring to the knights?" maxLength={1600} />
                  </Field>
                  <Field label="Additional Info" error={errors.additionalInfo} hint="optional">
                    <textarea className={`hud-input min-h-24 resize-y ${errors.additionalInfo ? "invalid" : ""}`} value={form.additionalInfo} onChange={set("additionalInfo")} placeholder="Anything else staff should know" maxLength={1200} />
                  </Field>
                </div>
              )}

              {/* wizard nav */}
              <div className="mt-8 pt-6 border-t border-ink-700 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="clip-btn border border-ink-600 text-fog-400 hover:text-fog-100 font-display font-bold text-xs tracking-[0.16em] px-5 py-3 inline-flex items-center gap-2 transition-colors disabled:opacity-30"
                >
                  <Icon name="chevronLeft" className="w-4 h-4" /> BACK
                </button>

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`clip-btn font-display font-bold text-xs tracking-[0.16em] px-7 py-3 inline-flex items-center gap-2 transition-all ${
                      stepValid(step)
                        ? "bg-brand-500 text-ink-950 hover:bg-brand-300 shadow-[0_0_24px_rgba(227,178,60,0.3)]"
                        : "border border-ink-600 text-fog-500 hover:text-fog-200"
                    }`}
                  >
                    NEXT PHASE <Icon name="chevronRight" className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="clip-btn bg-blood-500 text-white font-display font-bold text-xs tracking-[0.16em] px-7 py-3 inline-flex items-center gap-2 hover:bg-blood-400 transition-all disabled:opacity-50 shadow-[0_0_24px_rgba(217,30,46,0.3)]"
                  >
                    {submitting ? (<><Icon name="refresh" className="w-4 h-4 animate-spin" /> TRANSMITTING…</>) : (<>TRANSMIT APPLICATION <Icon name="arrowUpRight" className="w-4 h-4" /></>)}
                  </button>
                )}
              </div>
            </div>

            <p className="mt-5 font-mono text-[10.5px] text-fog-500 tracking-wider leading-relaxed inline-flex items-center gap-2">
              <Icon name="lock" className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              Data is validated & sanitised server-side, rate-limited and stored privately. No passwords. No payments. Ever.
            </p>
          </form>

          {/* ---------- live dossier ---------- */}
          <aside className="hidden lg:block sticky top-24">
            <div className="hud-corners clip-card border border-brand-500/30 bg-ink-900 overflow-hidden">
              <div className="metal-line" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] tracking-[0.28em] text-brand-400">PLAYER DOSSIER</p>
                  <span className="font-mono text-[9px] tracking-wider text-fog-500">LIVE</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Monogram name={form.fullName || "FK"} className="w-16 h-16 text-xl shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display font-bold text-lg text-fog-100 tracking-[0.06em] truncate">{form.fullName || "UNREGISTERED"}</p>
                    <p className="font-mono text-[10.5px] text-fog-400 truncate">@{form.discordUsername || "—"}</p>
                    <p className="font-mono text-[9.5px] text-fog-500 truncate">{form.discordId ? `ID ····${form.discordId.slice(-6)}` : "NO ID ON FILE"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {[
                    ["PROGRAM", selected?.title ?? "—"],
                    ["PLATFORM", form.platform || "—"],
                    ["RANK", form.currentRank ? `${form.currentRank}${form.peakRank ? ` → peak ${form.peakRank}` : ""}` : "—"],
                    ["ROLE", form.mainRole || "—"],
                    ["REGION", form.country || "—"],
                    ["AVAILABILITY", form.availability || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-3 border-b border-ink-700/70 pb-1.5">
                      <span className="font-mono text-[9px] tracking-[0.22em] text-fog-500 shrink-0">{k}</span>
                      <span className="font-mono text-[10.5px] text-fog-200 text-right truncate">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-[0.22em] text-fog-500">DOSSIER COMPLETENESS</span>
                    <span className={`font-mono text-[10px] tracking-wider ${completeness === 100 ? "text-mint-400" : "text-brand-300"}`}>{completeness}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-ink-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${completeness === 100 ? "bg-mint-500" : "bg-gradient-to-r from-brand-600 to-brand-400"}`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  {completeness === 100 && (
                    <p className="mt-2 font-mono text-[9.5px] text-mint-400 inline-flex items-center gap-1.5"><Icon name="check" className="w-3 h-3" /> READY TO TRANSMIT</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 clip-card border border-ink-600 bg-ink-900/70 p-4">
              <p className="font-mono text-[9.5px] tracking-[0.22em] text-fog-500">THE STANDARD</p>
              <p className="mt-2 text-[13px] text-fog-300 leading-relaxed">
                FURSAN reviews every application personally. Shortlisted knights move to trials — scrims, VOD review and an attitude check.
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-10 text-center font-mono text-[11px] text-fog-500 tracking-wider">
          FURSAN is a pure esports collective — applications exist for our four competitive programs only.
        </p>
      </div>
    </div>
  );
}
