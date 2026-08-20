import { useEffect, useRef } from "react";

/* Custom 3D engine: rotating wireframe icosahedron + depth particle field
   + eased mouse parallax. No libraries. */

interface P { x: number; y: number; z: number; s: number; c: string; }

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_RAW: [number, number, number][] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const ICO_EDGES: [number, number][] = [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10], [8, 9], [10, 11],
];

export default function CanvasHero({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let t = 0;

    const particles: P[] = [];
    const seed = () => {
      particles.length = 0;
      const count = Math.min(190, Math.floor((w * h) / 9000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random(),
          s: Math.random() * 1.6 + 0.4,
          c: Math.random() < 0.16 ? "217,30,46" : Math.random() < 0.62 ? "227,178,60" : "214,199,166",
        });
      }
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const project = (x: number, y: number, z: number, cx: number, cy: number, f: number) => {
      const d = 3.4 - z;
      const s = f / d;
      return { x: cx + x * s, y: cy + y * s, s };
    };

    const drawAmbient = (parX: number, parY: number) => {
      const cx = w * 0.5 + parX * 12;
      const cy = h * 0.62 + parY * 10;
      const r = Math.max(w, h) * 0.55;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(227,178,60,0.07)");
      g.addColorStop(0.55, "rgba(227,178,60,0.025)");
      g.addColorStop(1, "rgba(227,178,60,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const drawParticles = (parX: number, parY: number) => {
      for (const p of particles) {
        if (!reduced) p.z -= 0.0012 * (0.4 + p.s);
        if (p.z <= 0) { p.z = 1; p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; }
        const depth = 1 - p.z;
        const px = w / 2 + p.x * w * 0.6 * (0.3 + depth) + parX * 26 * depth;
        const py = h / 2 + p.y * h * 0.6 * (0.3 + depth) + parY * 18 * depth;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
        const size = p.s * (0.4 + depth * 1.5);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${0.12 + depth * 0.5})`;
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawIco = (parX: number, parY: number) => {
      const cx = w * (w < 768 ? 0.5 : 0.72) + parX * 20;
      const cy = h * 0.44 + parY * 14;
      const f = Math.min(w, h) * (w < 768 ? 0.42 : 0.52);
      const ry = t * 0.4 + parX * 0.35;
      const rx = Math.sin(t * 0.23) * 0.4 + parY * 0.25;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const pts = ICO_RAW.map(([x, y, z]) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        return project(x1, y1, z2, cx, cy, f);
      });
      ctx.save();
      ctx.lineWidth = 1;
      for (const [a, b] of ICO_EDGES) {
        const pa = pts[a], pb = pts[b];
        const za = (pa.s + pb.s) / 2;
        ctx.strokeStyle = `rgba(240,195,86,${Math.min(0.55, 0.09 + za * 0.18)})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
      for (const p of pts) {
        const r = Math.min(3.2, 0.8 + p.s * 0.9);
        ctx.fillStyle = `rgba(247,217,138,${Math.min(0.9, 0.2 + p.s * 0.3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, f * 0.9);
      g.addColorStop(0, "rgba(227,178,60,0.11)");
      g.addColorStop(1, "rgba(227,178,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, f * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const frame = () => {
      t += 0.016;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      drawAmbient(mouse.x, mouse.y);
      drawParticles(mouse.x, mouse.y);
      drawIco(mouse.x, mouse.y);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener("mousemove", onMove, { passive: true });
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
