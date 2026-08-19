import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes,
  type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

/* ================= custom icon set (hand-drawn strokes) ================= */

type IconProps = { className?: string };
const base = (className?: string) => ({
  className: className ?? "w-5 h-5",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export const IconTrophy = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" /><path d="M12 13v3M8 20h8M10 16h4v4h-4z" /></svg>
);
export const IconSwords = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 4l7 7M4 4v3M4 4h3" /><path d="M20 4l-7 7M20 4v3M20 4h-3" /><path d="M6.5 17.5 4 20M17.5 17.5 20 20" /><path d="M9 13l2 2M15 13l-2 2" /><path d="M5 15l4 4M19 15l-4 4" /></svg>
);
export const IconCrosshair = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="7" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconMask = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 5c2.5 1 5.5 1 8 0 2.5 1 5.5 1 8 0v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V5Z" /><path d="M8.5 10.5c.8-.6 2.2-.6 3 0M12.5 10.5c.8-.6 2.2-.6 3 0" /><path d="M9 15c2 1.4 4 1.4 6 0" /></svg>
);
export const IconCalendar = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="4" y="6" width="16" height="14" /><path d="M4 10h16M8 3v5M16 3v5" /><path d="M8 14h2M14 14h2M8 17h2" /></svg>
);
export const IconShield = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" /><path d="M9 12l2 2 4-4.5" /></svg>
);
export const IconChat = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6Z" /><path d="M8 9h8M8 12h5" /></svg>
);
export const IconGamepad = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 7h10a5 5 0 0 1 5 5.5L21.5 16a2.5 2.5 0 0 1-4.4 1.4L15.5 16h-7l-1.6 1.4A2.5 2.5 0 0 1 2.5 16L2 12.5A5 5 0 0 1 7 7Z" /><path d="M8 10v3M6.5 11.5h3M15.5 10.5h.01M17.5 12.5h.01" /></svg>
);
export const IconMedical = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 12h4l2-4 3 8 2-4h7" /><path d="M12 3v2M8 5h8" opacity="0" /><rect x="3" y="3" width="18" height="18" opacity="0" /></svg>
);
export const IconSiren = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M7 18v-6a5 5 0 0 1 10 0v6" /><path d="M5 18h14v3H5z" /><path d="M12 3v2M5 6l1.5 1.5M19 6l-1.5 1.5" /></svg>
);
export const IconBadge = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l2.2 2H18v4l2 2-2 2v4h-3.8L12 21l-2.2-4H6v-4l-2-2 2-2V5h3.8L12 3Z" /><circle cx="12" cy="11.5" r="2.5" /></svg>
);
export const IconUsers = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5" /><circle cx="16.5" cy="9" r="2.3" /><path d="M15.5 13.7c2.6.2 4.5 2 5 5.3" /></svg>
);
export const IconArrow = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconCheck = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 12.5 9.5 18 20 6.5" /></svg>
);
export const IconX = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const IconMenu = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const IconSearch = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>
);
export const IconLock = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="5" y="10" width="14" height="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5" /></svg>
);
export const IconUpload = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></svg>
);
export const IconTrash = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 7h14M10 7V5h4v2M8 7l1 13h6l1-13" /><path d="M10.5 11v5M13.5 11v5" /></svg>
);
export const IconEdit = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M14 5l5 5L8 21H3v-5L14 5Z" /><path d="M12 7l5 5" /></svg>
);
export const IconSignal = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 18v-4M9 18v-8M14 18V6M19 18V3" /></svg>
);
export const IconHeartline = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 12h5l2-4 3 8 2-4h6" /></svg>
);
export const IconScales = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 4v16M8 20h8" /><path d="M5 7l7-2 7 2" /><path d="M5 7l-2.5 5a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 5a3 3 0 0 0 5 0L19 7Z" /></svg>
);
export const IconGauge = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 17a8.5 8.5 0 1 1 16 0" /><path d="M12 17l4-6" /><circle cx="12" cy="17" r="1.4" /></svg>
);
export const IconBook = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /><path d="M9 7h6" /></svg>
);
export const IconDiscord = ({ className }: IconProps) => (
  <svg className={className ?? "w-5 h-5"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.3 5.5A16.8 16.8 0 0 0 15.1 4l-.5 1a15.6 15.6 0 0 0-5.2 0L8.9 4a16.8 16.8 0 0 0-4.2 1.5C2 9.6 1.3 13.6 1.6 17.5A17 17 0 0 0 6.8 20l1.1-1.8c-.6-.2-1.2-.5-1.8-.9l.4-.3a12 12 0 0 0 10.9 0l.5.3c-.6.4-1.2.7-1.9.9L17.2 20a17 17 0 0 0 5.2-2.5c.4-4.5-.7-8.4-3.1-12ZM8.7 15.1c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-1-1.9-2.1s.9-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Z" />
  </svg>
);
export const IconHorse = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M6 20c0-4 1-7 3-9l-1-4 3 2 2-3 1 4c3 1 5 4 5 10" /><path d="M14 8l3-1" /><circle cx="13.5" cy="9.5" r="0.4" fill="currentColor" /></svg>
);
export const IconChevronDown = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 9l7 7 7-7" /></svg>
);
export const IconPlus = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconGlobe = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c-5 5-5 12 0 17 5-5 5-12 0-17Z" /></svg>
);
export const IconKey = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="8" cy="15" r="4.5" /><path d="M11.5 11.5 20 3M17 6l3 3M14 9l2 2" /></svg>
);
export const IconNote = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 4h11l3 3v13H5z" /><path d="M16 4v3h3M9 11h6M9 15h4" /></svg>
);

export function Spinner({ className }: IconProps) {
  return (
    <svg className={`animate-spin ${className ?? "w-4 h-4"}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ================= scroll reveal ================= */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= buttons ================= */

type BtnVariant = "gold" | "outline" | "red" | "ghost" | "dark";

export function Btn({
  variant = "gold", className = "", children, busy, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; busy?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    gold: "bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(213,169,79,0.5)]",
    outline: "border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold",
    red: "bg-gradient-to-b from-bloodbright to-blood text-bone font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(143,29,24,0.6)]",
    ghost: "text-ash hover:text-bone",
    dark: "bg-steel border border-bone/10 text-bone hover:border-gold/50",
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || busy}
      className={`cut-sm inline-flex items-center justify-center gap-2 px-6 py-3 font-cond uppercase tracking-[0.14em] text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${styles[variant]} ${className}`}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

export function LinkBtn({ href, variant = "gold", className = "", children, external }: { href: string; variant?: BtnVariant; className?: string; children: ReactNode; external?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    gold: "bg-gradient-to-b from-goldsoft via-gold to-golddark text-ink font-bold hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(213,169,79,0.5)]",
    outline: "border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold",
    red: "bg-gradient-to-b from-bloodbright to-blood text-bone font-bold hover:brightness-110",
    ghost: "text-ash hover:text-bone",
    dark: "bg-steel border border-bone/10 text-bone hover:border-gold/50",
  };
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`cut-sm inline-flex items-center justify-center gap-2 px-6 py-3 font-cond uppercase tracking-[0.14em] text-sm transition-all duration-300 active:scale-[0.98] ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

/* ================= section heading ================= */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-gold/90 font-cond uppercase tracking-[0.3em] text-xs mb-4">
      <span className="h-px w-10 bg-gradient-to-r from-gold to-transparent" />
      {children}
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      <div className={center ? "flex justify-center" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-wide ${center ? "mx-auto" : ""}`}>
        {title}
      </h2>
      {sub && <p className={`mt-4 text-ash max-w-2xl text-lg ${center ? "mx-auto" : ""}`}>{sub}</p>}
    </Reveal>
  );
}

/* ================= status pill ================= */

export function StatusPill({ status }: { status: "open" | "closed" | "temp" }) {
  const map = {
    open: { label: "Recruitment Open", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10", dot: "bg-emerald-400 pulse-dot" },
    closed: { label: "Recruitment Closed", cls: "text-red-300 border-red-400/40 bg-red-500/10", dot: "bg-red-500" },
    temp: { label: "Temporarily Closed", cls: "text-amber-300 border-amber-400/40 bg-amber-400/10", dot: "bg-amber-400 pulse-dot-red" },
  }[status];
  return (
    <span className={`cut-sm inline-flex items-center gap-2 px-3 py-1.5 border font-cond uppercase tracking-[0.18em] text-[11px] ${map.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

export function AppStatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "text-amber-300 border-amber-400/40 bg-amber-400/10",
    approved: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
    rejected: "text-red-300 border-red-400/40 bg-red-500/10",
  }[status];
  return (
    <span className={`cut-sm inline-flex px-2.5 py-1 border font-cond uppercase tracking-[0.16em] text-[11px] ${map}`}>
      {status}
    </span>
  );
}

/* ================= modal ================= */

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-8" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-ink/85 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-3xl" : "max-w-xl"} my-4 modal-in`}>
        <div className="gold-frame cut p-0">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3 right-3 z-10 p-2 text-ash hover:text-gold transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ================= toasts ================= */

interface Toast { id: number; kind: "success" | "error" | "info"; text: string }
const ToastContext = createContext<{ push: (kind: Toast["kind"], text: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in cut-sm px-4 py-3 text-sm border backdrop-blur-md flex items-start gap-2.5 ${
              t.kind === "success"
                ? "bg-emerald-950/90 border-emerald-400/40 text-emerald-100"
                : t.kind === "error"
                ? "bg-[#2a0d0b]/95 border-red-500/50 text-red-100"
                : "bg-steel/95 border-gold/40 text-bone"
            }`}
          >
            {t.kind === "success" ? <IconCheck className="w-4 h-4 mt-0.5 shrink-0" /> : t.kind === "error" ? <IconX className="w-4 h-4 mt-0.5 shrink-0" /> : <IconNote className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/* ================= form primitives ================= */

const fieldWrap = "w-full";
const inputCls =
  "w-full bg-ink/80 border border-bone/15 px-4 py-3 text-bone placeholder:text-ash/50 outline-none transition-colors focus:border-gold/70 focus:shadow-[0_0_0_3px_rgba(213,169,79,0.12)]";

export function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${fieldWrap}`}>
      <span className="block font-cond uppercase tracking-[0.18em] text-[12px] text-bone/70 mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block mt-1.5 text-xs text-ash/80">{hint}</span>}
      {error && <span className="block mt-1.5 text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function TextInput({ error, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input {...rest} className={`${inputCls} ${error ? "border-red-500/60" : ""} ${className ?? ""}`} />;
}

export function TextArea({ error, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea {...rest} className={`${inputCls} resize-y min-h-[90px] ${error ? "border-red-500/60" : ""} ${className ?? ""}`} />;
}

export function Select({ error, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select {...rest} className={`${inputCls} appearance-none cursor-pointer ${error ? "border-red-500/60" : ""} ${className ?? ""}`}>
      {children}
    </select>
  );
}

/* ================= misc ================= */

export function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export function parseStat(value: string): { num: number; suffix: string } {
  const m = value.match(/^([\d,\.]+)(.*)$/);
  if (!m) return { num: 0, suffix: value };
  return { num: parseInt(m[1].replace(/[,.]/g, ""), 10) || 0, suffix: m[2] ?? "" };
}
