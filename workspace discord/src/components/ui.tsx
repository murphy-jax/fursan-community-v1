import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ProgramStatus } from "../lib/backend";

/* ================= custom icon set (hand-drawn strokes) ================= */

const PATHS: Record<string, ReactNode> = {
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.5 4.5 5.4v6.1c0 4.6 3 8.1 7.5 10 4.5-1.9 7.5-5.4 7.5-10V5.4L12 2.5Z" />
      <path d="M8.5 11.5l2.4 2.6 4.6-5" />
    </>
  ),
  ladder: (
    <>
      <path d="M6.5 3v18M17.5 3v18" />
      <path d="M6.5 7h11M6.5 12h11M6.5 17h11" />
      <path d="M3 21h18" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" />
      <path d="M3.5 9.5h17M8 2.5V7M16 2.5V7" />
      <path d="M8 13.5l2.6 2.7 5-5.4" />
    </>
  ),
  badge: (
    <>
      <path d="M12 2.8 20 6v6c0 4.8-3.3 8.4-8 9.9-4.7-1.5-8-5.1-8-9.9V6l8-3.2Z" />
      <path d="M12 8.2l1.3 2.7 3 .4-2.2 2 .6 2.9-2.7-1.4-2.7 1.4.6-2.9-2.2-2 3-.4L12 8.2Z" />
    </>
  ),
  pulse: (
    <>
      <path d="M2 12h4l2.5-6.5L13 18l2.5-6H22" />
      <circle cx="2" cy="12" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="22" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  discord: (
    <>
      <path d="M8.5 5.4C10 5 11 5 12 5s2 0 3.5.4l1.6-.9c1.9.8 3.4 1.9 4.4 3.6 1 3 1.4 6 .8 9-1.7 1.3-3.6 2.1-5.6 2.4l-1-2.1c-1.2.3-2.4.3-3.6 0l-1 2.1c-2-.3-3.9-1.1-5.6-2.4-.6-3-.2-6 .8-9 1-1.7 2.5-2.8 4.4-3.6l1.8.9Z" />
      <circle cx="9.2" cy="12.2" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="12.2" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  controller: (
    <>
      <path d="M7.5 7h9c2.8 0 5 2.3 5 5.2 0 3.5-1.5 6.3-3.5 6.3-1.6 0-2.4-1.7-3.4-3H9.4c-1 1.3-1.8 3-3.4 3-2 0-3.5-2.8-3.5-6.3C2.5 9.3 4.7 7 7.5 7Z" />
      <path d="M7 10.5v3M5.5 12h3M16 10.6h.01M18 13h.01" strokeLinecap="round" strokeWidth="2.4" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5.5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4a3 3 0 0 0 3 4.7M17 5.5h3a3 3 0 0 1-3 4.7" />
      <path d="M12 14.5v3M8.5 20.5h7M10 17.5h4v3h-4v-3Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  chevronLeft: <path d="M14 5l-7 7 7 7" />,
  chevronRight: <path d="M10 5l7 7-7 7" />,
  arrowRight: <path d="M3 12h17M14 5.5 20.5 12 14 18.5" />,
  arrowUpRight: <path d="M6 18 18 6M9 6h9v9" />,
  upload: (
    <>
      <path d="M12 15V3.5M7 8l5-4.8L17 8" />
      <path d="M4 15.5v4a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9 6V4h6v2M6.5 6.5 7.5 20h9l1-13.5" />
      <path d="M10.2 10.5v6M13.8 10.5v6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
      <path d="M14.5 8 16.5 10" />
    </>
  ),
  check: <path d="M4.5 12.5 10 18 19.5 6.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.7 16.3a6 6 0 0 1 0-8.6M16.3 7.7a6 6 0 0 1 0 8.6M5 19a10 10 0 0 1 0-14M19 5a10 10 0 0 1 0 14" />
    </>
  ),
  server: (
    <>
      <rect x="3.5" y="4" width="17" height="7" />
      <rect x="3.5" y="13" width="17" height="7" />
      <path d="M7 7.5h.01M7 16.5h.01" strokeLinecap="round" strokeWidth="2.6" />
      <path d="M13 7.5h4M13 16.5h4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2" />
      <path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.7M17.6 14.7c1.5.8 2.5 2.5 2.9 4.8" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2.8h8l4 4.2v14.2H6V2.8Z" />
      <path d="M14 2.8V7h4M9 12h6M9 15.5h6M9 8.5h2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16M9.9 6.3A9.4 9.4 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17.6 17.6 0 0 1-3.2 3.7M6 8.4A16.8 16.8 0 0 0 2.5 12S6 18.2 12 18.2c1.1 0 2.1-.2 3-.6" />
      <path d="M9.5 9.8a2.9 2.9 0 0 0 4 4.1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 3.5V8h-4.5" />
    </>
  ),
  plus: <path d="M12 4.5v15M4.5 12h15" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
    </>
  ),
  save: (
    <>
      <path d="M5 3.5h11l3.5 3.5v13.5h-14V3.5Z" />
      <path d="M8 3.5V9h7V3.5M8 20.5v-6h8v6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 1.9 20.5h20.2L12 3Z" />
      <path d="M12 9.5v5M12 17.6h.01" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.5 2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 4 5.3 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.3-4-8.5s1.4-6.1 4-8.5Z" />
    </>
  ),
  sword: (
    <>
      <path d="M14.5 3.5 20 3l-.5 5.5L8.5 19.5l-4-4L14.5 3.5Z" />
      <path d="M6 13.5 10 17.5M4 16l4 4M2.5 21.5 6 18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  headset: (
    <>
      <path d="M4.5 13.5v-2a7.5 7.5 0 0 1 15 0v2" />
      <rect x="3.5" y="13" width="4" height="6" />
      <rect x="16.5" y="13" width="4" height="6" />
      <path d="M18.5 19v1.5a2 2 0 0 1-2 2H13" />
    </>
  ),
  menu: <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h11" />,
  coins: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5.2" />
      <path d="M12 9.2v5.6M10.3 10.6h2.6a1.2 1.2 0 0 1 0 2.4h-1.8a1.2 1.2 0 0 0 0 2.4h2.6" strokeWidth="1.3" />
    </>
  ),
  bracket: (
    <>
      <path d="M3.5 5h4v14h-4M16.5 5h4v14h-4" />
      <path d="M7.5 8.5H12v7H7.5M12 12h4.5" />
    </>
  ),
  external: (
    <>
      <path d="M10 5H5v14h14v-5" />
      <path d="M14 4h6v6M20 4l-9 9" />
    </>
  ),
  horse: (
    <>
      <path d="M13.5 3 12 6.5l-5.5 2L4 12l3 1-1 4.5L9.5 15l1 4 2.5-4.5 3.5 1.5 1-4.5 2.5-1L18 6l3-1.5L16.5 3l-3 .8V3Z" />
      <path d="M9 19.5l-1 2M13 19l.5 2.5" />
    </>
  ),
};

export function Icon({ name, className = "w-5 h-5", strokeWidth = 1.6 }: { name: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden="true">
      {PATHS[name] ?? PATHS.target}
    </svg>
  );
}

/* ================= FURSAN logo (blended, never cropped) ================= */

export function FursanLogo({ src, className = "w-12 h-12", eager = false }: { src: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className={`${className} text-brand-400`} aria-label="FURSAN emblem">
        {PATHS.horse}
      </svg>
    );
  }
  return (
    <img
      src={src}
      alt="FURSAN emblem"
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`${className} object-contain mix-blend-screen select-none pointer-events-none`}
      draggable={false}
    />
  );
}

/* ================= scroll reveal ================= */

export function Reveal({
  children, className = "", delay = 0, variant = "up",
}: { children: ReactNode; className?: string; delay?: number; variant?: "up" | "left" | "right" | "clip" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cls = variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : variant === "clip" ? "reveal-clip" : "reveal";
  return (
    <div ref={ref} className={`${cls} ${className}`} style={{ "--rd": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/* ================= count-up ================= */

export function CountUp({ to, duration = 1800, className = "", suffix = "" }: { to: number; duration?: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className={className}>{val.toLocaleString()}{suffix}</span>;
}

/* ================= 3D extruded depth text ================= */

export function Depth3DText({
  text, layers = 30, depth = 80, className = "",
}: { text: string; layers?: number; depth?: number; className?: string }) {
  const zone = useRef<HTMLSpanElement>(null);
  const node = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = zone.current, inner = node.current;
    if (!el || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = { x: 0, y: 0, cx: 0, cy: 0 };
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      t.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      t.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const loop = () => {
      t.cx += (t.x - t.cx) * 0.07;
      t.cy += (t.y - t.cy) * 0.07;
      inner.style.transform = `rotateX(${(-t.cy * 4.2).toFixed(2)}deg) rotateY(${(t.cx * 5.4).toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const step = depth / layers;
  return (
    <span ref={zone} className={`inline-block ${className}`} style={{ perspective: 900, perspectiveOrigin: "50% 48%" }}>
      <span ref={node} className="relative inline-grid place-items-center" style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%", willChange: "transform" }}>
        {Array.from({ length: layers }, (_, i) => {
          const z = -(depth - i * step);
          const p = 4 + (i / (layers - 1)) * 72;
          return (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 inline-block whitespace-nowrap select-none"
              style={{
                transform: `translateZ(${z.toFixed(1)}px)`,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                filter: "brightness(0.95) saturate(0.95)",
                color: `rgb(255, ${Math.round(p * 2.55)}, ${Math.round(p * 0.03)})`,
              }}
            >
              {text}
            </span>
          );
        })}
        <span
          className="relative z-10 inline-block whitespace-nowrap select-none text-fog-100"
          style={{
            transform: "translateZ(0.6px)",
            backfaceVisibility: "hidden",
            textShadow: "0 22px 34px rgba(255, 0, 3, 0.36), 0 4px 8px rgba(0, 0, 0, 0.28)",
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}

/* ================= scramble / decode text ================= */

const GLYPHS = "█▓▒░<>/\\|=+*#%01FURSAN";
export function ScrambleText({ text, className = "", speed = 26 }: { text: string; className?: string; speed?: number }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let interval = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done.current) return;
      done.current = true;
      io.disconnect();
      let frame = 0;
      const total = Math.max(10, text.length + 8);
      interval = window.setInterval(() => {
        frame++;
        const solved = Math.floor((frame / total) * text.length);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") { s += " "; continue; }
          s += i < solved ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(s);
        if (frame >= total) { setOut(text); window.clearInterval(interval); }
      }, speed);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(interval); };
  }, [text, speed]);
  return <span ref={ref} className={className} aria-label={text}>{out}</span>;
}

/* ================= 3D tilt card ================= */

export function TiltCard({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(240,195,86,0.16), transparent 55%)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
    if (glare.current) glare.current.style.opacity = "0";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      <div ref={glare} className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300" />
      {children}
    </div>
  );
}

/* ================= status badge ================= */

export function StatusBadge({ status }: { status: ProgramStatus }) {
  if (status === "open") {
    return (
      <span className="clip-tag inline-flex items-center gap-2 bg-mint-500/10 border border-mint-500/40 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-mint-400">
        <span className="w-1.5 h-1.5 rounded-full bg-mint-400 pulse-dot" /> RECRUITING
      </span>
    );
  }
  if (status === "temporary") {
    return (
      <span className="clip-tag inline-flex items-center gap-2 bg-amberx-500/10 border border-amberx-500/40 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-amberx-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amberx-400" /> PAUSED
      </span>
    );
  }
  return (
    <span className="clip-tag inline-flex items-center gap-2 bg-blood-500/10 border border-blood-500/40 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-blood-400">
      <span className="w-1.5 h-1.5 rounded-full bg-blood-400" /> CLOSED
    </span>
  );
}

/* ================= section heading ================= */

export function SectionHead({
  eyebrow, title, desc, align = "left", tone = "brand",
}: { eyebrow: string; title: ReactNode; desc?: string; align?: "left" | "center"; tone?: "brand" | "blood" }) {
  return (
    <div className={align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}>
      <Reveal variant="clip">
        <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <span className={`h-px w-10 ${tone === "brand" ? "bg-brand-500" : "bg-blood-500"}`} />
          <span className={`font-mono text-[11px] tracking-[0.3em] ${tone === "brand" ? "text-brand-400" : "text-blood-400"}`}>{eyebrow}</span>
          {align === "center" && <span className={`h-px w-10 ${tone === "brand" ? "bg-brand-500" : "bg-blood-500"}`} />}
        </div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 font-display font-bold uppercase leading-[0.95] text-fog-100 text-3xl sm:text-4xl lg:text-5xl tracking-tight">
          {title}
        </h2>
      </Reveal>
      {desc && (
        <Reveal delay={160}>
          <p className="mt-4 text-fog-300 text-base sm:text-lg leading-relaxed">{desc}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ================= angular button ================= */

type BtnProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "blood" | "ghost" | "dark";
  size?: "md" | "lg" | "sm";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function AngularButton({ children, to, href, onClick, variant = "primary", size = "md", className = "", type = "button", disabled }: BtnProps) {
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-sm" };
  const variants = {
    primary: "bg-brand-500 text-ink-950 font-bold hover:bg-brand-300 shadow-[0_0_24px_rgba(227,178,60,0.28)] hover:shadow-[0_0_38px_rgba(227,178,60,0.5)]",
    outline: "border border-brand-500/50 text-brand-300 hover:bg-brand-500/10 hover:border-brand-400",
    blood: "bg-blood-500 text-white font-bold hover:bg-blood-400 shadow-[0_0_24px_rgba(217,30,46,0.3)] hover:shadow-[0_0_38px_rgba(217,30,46,0.5)]",
    ghost: "text-fog-300 hover:text-brand-300 border border-transparent hover:border-ink-600",
    dark: "bg-ink-800 text-fog-200 border border-ink-600 hover:border-brand-500/60 hover:text-brand-300",
  };
  const cls = `clip-btn inline-flex items-center justify-center gap-2.5 font-display font-semibold tracking-[0.14em] uppercase transition-all duration-200 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls} onClick={onClick}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>{children}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

/* ================= monogram ================= */

export function Monogram({ name, className = "w-16 h-16 text-xl" }: { name: string; className?: string }) {
  const initials = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
  return (
    <div className={`${className} clip-tag relative grid place-items-center bg-gradient-to-br from-ink-700 to-ink-900 border border-brand-500/30 font-display font-bold text-brand-300`}>
      <span className="absolute inset-0 grid-bg opacity-40" />
      <span className="relative">{initials}</span>
    </div>
  );
}

/* ================= live countdown ================= */

export function Countdown({ date, time, compact = false }: { date: string; time?: string; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, []);
  const target = new Date(`${date}T${time || "20:00"}:00`).getTime();
  const diff = target - now;
  if (Number.isNaN(target) || diff <= 0) {
    return (
      <span className="font-mono text-[11px] tracking-[0.24em] text-blood-400 inline-flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blood-400 pulse-dot-red" /> UNDERWAY
      </span>
    );
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  const cells = [
    [String(d).padStart(2, "0"), "DAYS"],
    [String(h).padStart(2, "0"), "HRS"],
    [String(m).padStart(2, "0"), "MIN"],
    [String(s).padStart(2, "0"), "SEC"],
  ] as const;
  if (compact) {
    return (
      <span className="font-mono text-sm text-brand-300 tracking-[0.14em]">
        {cells.map(([v, u]) => `${v}${u[0]}`).join(" ")}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {cells.map(([v, u]) => (
        <div key={u} className="clip-tag border border-brand-500/25 bg-ink-900/90 px-2.5 py-1.5 text-center min-w-[52px]">
          <p className="font-display font-bold text-lg leading-none text-fog-100 tabular-nums">{v}</p>
          <p className="font-mono text-[8px] tracking-[0.24em] text-fog-500 mt-1">{u}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= form field wrapper ================= */

export function Field({
  label, error, children, required, hint, className = "",
}: { label: string; error?: string; children: ReactNode; required?: boolean; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.22em] text-fog-400 uppercase">
          {label} {required && <span className="text-blood-400">*</span>}
        </span>
        {hint && <span className="font-mono text-[10px] text-fog-500">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1.5 text-blood-400 text-xs font-mono">
          <Icon name="alert" className="w-3.5 h-3.5" /> {error}
        </span>
      )}
    </label>
  );
}
