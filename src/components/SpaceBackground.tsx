import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; base: number };

const STAR_COUNT = 620;
const FOCAL = 380;
const DRIFT = 16; // gentle forward drift (units/sec)

function makeStar(spread: boolean): Star {
  return {
    x: (Math.random() - 0.5) * 2400,
    y: (Math.random() - 0.5) * 2400,
    z: spread ? 20 + Math.random() * 1400 : 900 + Math.random() * 500,
    base: 0.6 + Math.random() * 1.6,
  };
}

function starTint(z: number) {
  const h = (Math.sin(z * 12.9898) * 43758.5453) % 1;
  const r = Math.abs(h);
  if (r < 0.55) return "255, 255, 245";
  if (r < 0.75) return "180, 210, 255";
  if (r < 0.9) return "255, 230, 180";
  return "255, 180, 150";
}

/**
 * Ambient, non-interactive deep-space backdrop — the "feel" of the index
 * hyperlane chart (drifting 3D starfield + nebula haze), used behind the app.
 */
export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });

  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar(true));
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep space
      ctx.fillStyle = "#02030a";
      ctx.fillRect(0, 0, w, h);

      // Milky-way band + nebula puffs
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const band = ctx.createLinearGradient(0, h * 0.2, w, h * 0.8);
      band.addColorStop(0, "rgba(30,20,60,0)");
      band.addColorStop(0.5, "rgba(60,40,110,0.30)");
      band.addColorStop(1, "rgba(20,30,70,0)");
      ctx.fillStyle = band;
      ctx.fillRect(0, 0, w, h);

      const drift = Math.sin(elapsed * 0.05) * 40;
      const puffs = [
        { x: 0.24, y: 0.4, r: 380, c: "rgba(80,40,140,0.16)" },
        { x: 0.78, y: 0.62, r: 460, c: "rgba(30,80,140,0.13)" },
        { x: 0.55, y: 0.22, r: 300, c: "rgba(140,60,100,0.11)" },
      ];
      for (const p of puffs) {
        const gx = w * p.x + drift;
        const gy = h * p.y;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, p.r);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // Drifting 3D starfield
      const cx = w / 2;
      const cy = h / 2;
      const sway = Math.sin(elapsed * 0.12) * 14;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        s.z -= DRIFT * dt;
        if (s.z < 1) {
          const ns = makeStar(false);
          s.x = ns.x;
          s.y = ns.y;
          s.z = ns.z;
          s.base = ns.base;
        }
        const k = FOCAL / s.z;
        const px = cx + s.x * k + sway;
        const py = cy + s.y * k;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        const size = Math.max(0.4, (1 - s.z / 1400) * s.base);
        const twinkle = 0.75 + Math.sin(elapsed * 1.4 + i) * 0.25;
        const brightness = Math.min(1, (1 - s.z / 1400) * twinkle);
        ctx.fillStyle = `rgba(${starTint(s.z)}, ${brightness})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core glow
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
      core.addColorStop(0, "rgba(120,90,200,0.10)");
      core.addColorStop(0.35, "rgba(80,60,160,0.05)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
