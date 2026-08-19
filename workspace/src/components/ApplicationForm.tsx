import { useMemo, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import * as api from "../lib/api";
import { fieldsFor, validateApplication, type FieldSpec } from "../lib/validation";
import type { AppType } from "../lib/db";
import { Btn, Field, IconCheck, IconLock, Modal, Select, TextArea, TextInput, useToast } from "./ui";

const KIND_META: Record<AppType, { title: string; sub: string }> = {
  esports: { title: "FURSAN Esports Application", sub: "One application per program. Coaches reply within 72 hours." },
  ems: { title: "San Andreas EMS Application", sub: "Whitelist intake for the medical division. Chiefs review every file." },
  lspd: { title: "Los Santos PD Application", sub: "Whitelist intake for the metropolitan division. Command reviews every file." },
};

function FieldInput({ spec, value, error, onChange, programOptions }: {
  spec: FieldSpec;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  programOptions?: string[];
}) {
  if (spec.type === "select") {
    const options = spec.key === "program" ? programOptions ?? [] : spec.options ?? [];
    return (
      <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
        <Select value={value} error={!!error} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>
      </Field>
    );
  }
  if (spec.type === "textarea") {
    return (
      <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
        <TextArea
          rows={spec.rows ?? 4}
          placeholder={spec.placeholder}
          value={value}
          error={!!error}
          maxLength={spec.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }
  return (
    <Field label={spec.label} required={spec.required} error={error} hint={spec.hint}>
      <TextInput
        type={spec.type === "number" ? "number" : "text"}
        placeholder={spec.placeholder}
        value={value}
        error={!!error}
        maxLength={spec.maxLength}
        min={spec.min}
        max={spec.max}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function ApplicationForm({ kind, presetProgram, onFinished }: {
  kind: AppType;
  presetProgram?: string;
  onFinished?: () => void;
}) {
  const { db } = useApp();
  const { push } = useToast();
  const specs = useMemo(() => fieldsFor(kind), [kind]);
  const programOptions = useMemo(() => db.games.map((g) => g.title), [db.games]);
  const openPrograms = useMemo(() => db.games.filter((g) => g.status === "open").map((g) => g.title), [db.games]);

  const [data, setData] = useState<Record<string, string>>(() => ({
    program: presetProgram && openPrograms.includes(presetProgram) ? presetProgram : "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const set = (k: string, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  };

  if (kind === "esports" && openPrograms.length === 0 && !ref) {
    return (
      <div className="p-8 text-center">
        <p className="font-display text-2xl tracking-wide mb-2">RECRUITMENT PAUSED</p>
        <p className="text-ash">All esports programs are currently closed. Follow the Discord — openings are announced there first.</p>
      </div>
    );
  }

  if (ref) {
    return (
      <div className="p-8 sm:p-10 text-center">
        <div className="mx-auto w-16 h-16 cut-sm bg-emerald-400/15 border border-emerald-400/50 flex items-center justify-center mb-6">
          <IconCheck className="w-8 h-8 text-emerald-300" />
        </div>
        <p className="font-cond uppercase tracking-[0.3em] text-xs text-emerald-300 mb-3">Application Received</p>
        <h3 className="font-display text-4xl tracking-wide mb-2">SAVE YOUR REFERENCE</h3>
        <p className="font-display text-3xl metal-text tracking-[0.14em] my-5 py-3 border-y border-gold/25 select-all">{ref}</p>
        <p className="text-ash leading-relaxed max-w-md mx-auto">
          Your application is in the review queue with <span className="text-bone">Pending</span> status. The review team
          will contact you on Discord — keep an eye on your message requests.
        </p>
        <p className="mt-6 text-xs text-ash/70 flex items-center justify-center gap-2">
          <IconLock className="w-3.5 h-3.5 text-gold" />
          FURSAN will never ask for your password or payment details.
        </p>
        {onFinished && (
          <Btn variant="outline" className="mt-8" onClick={onFinished}>Close</Btn>
        )}
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const check = validateApplication(kind, data, programOptions);
    if (!check.ok) {
      setErrors(check.errors);
      const firstKey = Object.keys(check.errors)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    try {
      const res = await api.submitApplication(kind, data);
      setRef(res.ref);
      push("success", `Application ${res.ref} submitted successfully.`);
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-7">
        <p className="font-cond uppercase tracking-[0.3em] text-[11px] text-gold/90 mb-2">{KIND_META[kind].sub}</p>
        <h3 className="font-display text-3xl sm:text-4xl tracking-wide">{KIND_META[kind].title}</h3>
      </div>

      {banner && (
        <div className="cut-sm mb-6 px-4 py-3 border border-red-500/50 bg-red-950/40 text-red-200 text-sm">
          {banner}
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div className="grid sm:grid-cols-2 gap-5">
          {specs.map((spec) => (
            <div key={spec.key} data-field={spec.key} className={spec.type === "textarea" ? "sm:col-span-2" : ""}>
              <FieldInput
                spec={spec}
                value={data[spec.key] ?? ""}
                error={errors[spec.key]}
                onChange={(v) => set(spec.key, v)}
                programOptions={kind === "esports" ? openPrograms : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-ash/80 flex items-center gap-2 max-w-xs">
            <IconLock className="w-4 h-4 text-gold shrink-0" />
            No passwords, no payments. Only the fields above are stored.
          </p>
          <Btn type="submit" busy={busy} className="w-full sm:w-auto min-w-[220px]">
            {busy ? "Submitting…" : "Submit Application"}
          </Btn>
        </div>
      </form>
    </div>
  );
}

export function ApplicationModal({ open, onClose, kind, presetProgram }: {
  open: boolean;
  onClose: () => void;
  kind: AppType;
  presetProgram?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} wide>
      <ApplicationForm key={`${kind}-${presetProgram ?? ""}-${open}`} kind={kind} presetProgram={presetProgram} onFinished={onClose} />
    </Modal>
  );
}
