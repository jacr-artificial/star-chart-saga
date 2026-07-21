import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PLANETS, type Planet } from "@/data/planets";
import BadgeCluster from "@/components/brand/BadgeCluster";

type Camera = { x: number; y: number; zoom: number };

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 6;
const GALAXY_SCALE = 520;
const STAR_COUNT = 900;
const FOCAL = 380;

type Star3D = { x: number; y: number; z: number; base: number };

export default function GalaxyExplorer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const camRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const targetCamRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const [, setTick] = useState(0);

  const [selected, setSelected] = useState<Planet | null>(null);
  const [hovered, setHovered] = useState<{ planet: Planet; sx: number; sy: number } | null>(null);

  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  // 3D starfield
  const starsRef = useRef<Star3D[]>([]);
  // Warp state — animates when jumping to/from a planet
  const warpRef = useRef({ active: false, intensity: 0, target: 0, dir: 0 });
  // motion history to compute streaks from actual movement
  const camPrevRef = useRef({ x: 0, y: 0, zoom: 1 });

  // Init stars in a large cube volume
  useEffect(() => {
    const stars: Star3D[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(makeStar(true));
    }
    starsRef.current = stars;
  }, []);

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    return () => window.removeEventListener("resize", resize);
  }, []);

  const worldToScreen = useCallback((wx: number, wy: number) => {
    const { w, h } = sizeRef.current;
    const cam = camRef.current;
    return {
      sx: w / 2 + (wx - cam.x) * cam.zoom,
      sy: h / 2 + (wy - cam.y) * cam.zoom,
    };
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const { w, h } = sizeRef.current;
    const cam = camRef.current;
    return {
      x: (sx - w / 2) / cam.zoom + cam.x,
      y: (sy - h / 2) / cam.zoom + cam.y,
    };
  }, []);

  const planetWorldPos = useCallback((p: Planet, t: number) => {
    const baseX = p.x * GALAXY_SCALE;
    const baseY = p.y * GALAXY_SCALE;
    const radius = Math.hypot(baseX, baseY);
    const angle0 = Math.atan2(baseY, baseX);
    const angle = angle0 + p.orbitSpeed * t;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }, []);

  const hitTestPlanet = useCallback(
    (sx: number, sy: number, t: number): Planet | null => {
      const sorted = [...PLANETS].sort((a, b) => b.depth - a.depth);
      for (const p of sorted) {
        const wp = planetWorldPos(p, t);
        const scr = worldToScreen(wp.x, wp.y);
        const r = p.size * camRef.current.zoom * (0.6 + p.depth * 0.6);
        const d = Math.hypot(sx - scr.sx, sy - scr.sy);
        if (d <= r + 6) return p;
      }
      return null;
    },
    [planetWorldPos, worldToScreen],
  );

  // Animation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const cam = camRef.current;
      const tgt = targetCamRef.current;
      const ease = 1 - Math.pow(0.001, dt);
      cam.x += (tgt.x - cam.x) * ease;
      cam.y += (tgt.y - cam.y) * ease;
      cam.zoom += (tgt.zoom - cam.zoom) * ease;

      if (!draggingRef.current) {
        const v = velocityRef.current;
        if (Math.abs(v.vx) > 0.01 || Math.abs(v.vy) > 0.01) {
          tgt.x -= (v.vx / cam.zoom) * dt * 60;
          tgt.y -= (v.vy / cam.zoom) * dt * 60;
          v.vx *= 0.92;
          v.vy *= 0.92;
        }
      }

      // Update warp intensity
      const warp = warpRef.current;
      const wEase = 1 - Math.pow(0.0005, dt);
      warp.intensity += (warp.target - warp.intensity) * wEase;
      if (warp.target > 0 && warp.intensity > 0.85) {
        // arrival: kill the warp
        warp.target = 0;
      }

      draw(elapsed, dt);

      camPrevRef.current = { x: cam.x, y: cam.y, zoom: cam.zoom };

      // Throttle React re-renders — a setState every frame freezes the tab
      if (Math.floor(elapsed * 12) !== Math.floor((elapsed - dt) * 12)) {
        setTick((t) => (t + 1) % 1000000);
      }
      raf = requestAnimationFrame(render);
    };

    const draw = (t: number, dt: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep space background — the deck's warm near-black canvas
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, w, h);

      // Faint milky-way band (subtle diagonal) — warm plum haze
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const bandGrad = ctx.createLinearGradient(0, h * 0.2, w, h * 0.8);
      bandGrad.addColorStop(0, "rgba(60,20,50,0)");
      bandGrad.addColorStop(0.5, "rgba(95,42,84,0.32)");
      bandGrad.addColorStop(1, "rgba(40,28,22,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(0, 0, w, h);
      // faint dust puffs — magenta / lemon / parchment, held well back
      const puffs = [
        { x: 0.25, y: 0.4, r: 380, c: "rgba(154,72,144,0.16)" },
        { x: 0.75, y: 0.6, r: 460, c: "rgba(193,176,166,0.09)" },
        { x: 0.55, y: 0.25, r: 300, c: "rgba(207,111,165,0.12)" },
      ];
      for (const p of puffs) {
        const g = ctx.createRadialGradient(w * p.x, h * p.y, 0, w * p.x, h * p.y, p.r);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      const cam = camRef.current;
      const prev = camPrevRef.current;
      const dxPan = (cam.x - prev.x) * cam.zoom;
      const dyPan = (cam.y - prev.y) * cam.zoom;
      const zoomDelta = cam.zoom / (prev.zoom || 1);

      const warp = warpRef.current.intensity;

      // 3D starfield — perspective projection with streaks
      const cx = w / 2;
      const cy = h / 2;
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Drift stars toward camera when warping (creates hyperspace)
        if (warp > 0.02) {
          s.z -= (300 + warp * 3800) * dt;
          if (s.z < 1) {
            const ns = makeStar(false);
            s.x = ns.x;
            s.y = ns.y;
            s.z = ns.z;
            s.base = ns.base;
          }
        }

        const k = FOCAL / s.z;
        const px = cx + s.x * k;
        const py = cy + s.y * k;

        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        // Streak vector = pan motion (parallax by 1/z) + warp radial
        const par = 1 - Math.min(1, s.z / 900); // near = more parallax
        let ex = px - dxPan * (0.3 + par * 0.9);
        let ey = py - dyPan * (0.3 + par * 0.9);

        // Warp: streak radially outward from center
        if (warp > 0.02) {
          const rx = px - cx;
          const ry = py - cy;
          const len = Math.hypot(rx, ry) || 1;
          const streakLen = 6 + warp * warp * 220 * (0.4 + par);
          ex = px - (rx / len) * streakLen;
          ey = py - (ry / len) * streakLen;
        }

        const size = Math.max(0.4, (1 - s.z / 1400) * s.base * (1 + warp * 0.5));
        const brightness = Math.min(1, 1 - s.z / 1400 + warp * 0.4);

        const dist = Math.hypot(ex - px, ey - py);
        if (dist > 1.2) {
          // draw as streak
          ctx.strokeStyle = `rgba(${starTint(s.z)}, ${brightness})`;
          ctx.lineWidth = size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${starTint(s.z)}, ${brightness * 0.9})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }

        void zoomDelta; // suppress unused
      }

      // Warp bloom overlay
      if (warp > 0.05) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        g.addColorStop(0, `rgba(240,235,205,${warp * 0.32})`);
        g.addColorStop(0.4, `rgba(207,111,165,${warp * 0.14})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Distant galaxy core glow (subtle, not cartoony)
      ctx.save();
      ctx.translate(w / 2 - cam.x * cam.zoom, h / 2 - cam.y * cam.zoom);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.globalCompositeOperation = "screen";
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 700);
      core.addColorStop(0, "rgba(240,235,205,0.22)");
      core.addColorStop(0.25, "rgba(207,111,165,0.10)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, 700, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Planets — hide during peak warp
      const planetAlpha = 1 - Math.min(1, warp * 1.4);
      if (planetAlpha > 0.02) {
        ctx.globalAlpha = planetAlpha;
        const sorted = [...PLANETS].sort((a, b) => a.depth - b.depth);
        for (const p of sorted) {
          const wp = planetWorldPos(p, t);
          const { sx, sy } = worldToScreen(wp.x, wp.y);
          const depthMul = 0.6 + p.depth * 0.6;
          const r = p.size * cam.zoom * depthMul;
          if (sx < -r * 3 || sx > w + r * 3 || sy < -r * 3 || sy > h + r * 3) continue;

          drawPlanet(ctx, p, sx, sy, r, t, hovered?.planet.id === p.id);
        }
        ctx.globalAlpha = 1;
      }

      if (hovered) {
        const wp = planetWorldPos(hovered.planet, t);
        const scr = worldToScreen(wp.x, wp.y);
        if (Math.abs(scr.sx - hovered.sx) > 1 || Math.abs(scr.sy - hovered.sy) > 1) {
          setHovered({ planet: hovered.planet, sx: scr.sx, sy: scr.sy });
        }
      }
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered?.planet.id]);

  // Pointer handlers
  useEffect(() => {
    const canvas = canvasRef.current!;
    const startT = performance.now() / 1000;
    const getT = () => performance.now() / 1000 - startT;

    const onDown = (e: PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      draggingRef.current = true;
      dragMovedRef.current = false;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { vx: 0, vy: 0 };
    };
    const onMove = (e: PointerEvent) => {
      if (draggingRef.current && lastPointerRef.current) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMovedRef.current = true;
        const cam = camRef.current;
        const tgt = targetCamRef.current;
        tgt.x -= dx / cam.zoom;
        tgt.y -= dy / cam.zoom;
        cam.x = tgt.x;
        cam.y = tgt.y;
        velocityRef.current = { vx: dx, vy: dy };
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const p = hitTestPlanet(sx, sy, getT());
        if (p) {
          setHovered({ planet: p, sx, sy });
          canvas.style.cursor = "pointer";
        } else {
          if (hovered) setHovered(null);
          canvas.style.cursor = "grab";
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      const wasDragging = draggingRef.current;
      draggingRef.current = false;
      lastPointerRef.current = null;
      if (wasDragging && !dragMovedRef.current) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const p = hitTestPlanet(sx, sy, getT());
        if (p) focusPlanet(p);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      zoomAt(sx, sy, Math.pow(1.0015, -e.deltaY));
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = { dist: Math.hypot(dx, dy), zoom: camRef.current.zoom };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d = Math.hypot(dx, dy);
        const scale = d / pinchRef.current.dist;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchRef.current.zoom * scale));
        targetCamRef.current.zoom = newZoom;
        camRef.current.zoom = newZoom;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [hitTestPlanet, hovered]);

  const zoomAt = (sx: number, sy: number, factor: number) => {
    const cam = camRef.current;
    const before = screenToWorld(sx, sy);
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * factor));
    cam.zoom = newZoom;
    const after = screenToWorld(sx, sy);
    cam.x += before.x - after.x;
    cam.y += before.y - after.y;
    targetCamRef.current.x = cam.x;
    targetCamRef.current.y = cam.y;
    targetCamRef.current.zoom = newZoom;
  };

  const focusPlanet = (p: Planet) => {
    // Kick off warp
    warpRef.current.target = 1;
    warpRef.current.intensity = Math.max(warpRef.current.intensity, 0.05);
    setTimeout(() => {
      const wp = { x: p.x * GALAXY_SCALE, y: p.y * GALAXY_SCALE };
      targetCamRef.current.x = wp.x;
      targetCamRef.current.y = wp.y;
      targetCamRef.current.zoom = Math.min(MAX_ZOOM, 3.2);
      camRef.current.x = wp.x;
      camRef.current.y = wp.y;
      camRef.current.zoom = 3.2;
      setSelected(p);
    }, 550);
  };

  const resetView = () => {
    warpRef.current.target = 1;
    warpRef.current.intensity = Math.max(warpRef.current.intensity, 0.05);
    setTimeout(() => {
      targetCamRef.current = { x: 0, y: 0, zoom: 1 };
      camRef.current = { x: 0, y: 0, zoom: 1 };
      setSelected(null);
    }, 500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* HUD Header — wordmark top-left, badge cluster top-right (deck title convention) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-6">
        <div className="pointer-events-auto">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-brand-magenta" />
            <span className="font-display text-sm font-bold uppercase tracking-[0.28em] text-foreground">
              Artificial
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-brand-magenta/80">
            ✦ Orbit Insurance Learning Array
          </div>
          <div className="mt-1 font-display text-2xl tracking-[0.15em] text-foreground">
            HYPERLANE CHART
          </div>
        </div>
        <div className="pointer-events-auto text-right font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <BadgeCluster className="mb-3 justify-end" />
          <div>sector 7-G · scan mode</div>
          <div className="mt-1 text-brand-magenta/70">drag · scroll · engage</div>
        </div>
      </div>

      {/* Bottom-left HUD */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-magenta/80" />
          nav.link stable
        </div>
        <div className="mt-1 opacity-60">{PLANETS.length} worlds indexed</div>
      </div>

      {/* Enter Orbit CTA */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2">
        <Link
          to="/app"
          className="group flex items-center gap-3 rounded-full border border-brand-lemon/50 bg-background/70 px-6 py-3 font-display text-sm tracking-[0.2em] text-foreground backdrop-blur-xl transition hover:border-brand-lemon hover:bg-brand-lemon/15 hover:shadow-[0_0_32px_rgba(240,249,95,0.3)]"
        >
          <span className="font-mono text-[10px] text-brand-lemon">✦</span>
          ENTER THE GALAXY
          <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
        <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/80">
          customise · collect · learn
        </div>
      </div>

      {/* Zoom controls — offset above CTA */}
      <div className="absolute bottom-24 right-6 z-10 flex flex-col overflow-hidden rounded-sm border border-border/60 bg-background/40 font-mono backdrop-blur">
        <button
          onClick={() => {
            const { w, h } = sizeRef.current;
            zoomAt(w / 2, h / 2, 1.3);
          }}
          className="border-b border-border/60 px-3 py-2 text-sm text-foreground/80 transition hover:bg-brand-magenta/20"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            const { w, h } = sizeRef.current;
            zoomAt(w / 2, h / 2, 1 / 1.3);
          }}
          className="border-b border-border/60 px-3 py-2 text-sm text-foreground/80 transition hover:bg-brand-magenta/20"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-brand-magenta/20"
          aria-label="Reset view"
        >
          rtb
        </button>
      </div>

      {/* Hover label */}
      {hovered && !selected && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground"
          style={{ left: hovered.sx, top: hovered.sy - 60 }}
        >
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-brand-magenta/70" />
            <span>{hovered.planet.name}</span>
            <span className="h-px w-6 bg-brand-magenta/70" />
          </div>
          <div className="mt-1 text-center text-[9px] tracking-[0.3em] text-brand-magenta/70">
            [ engage ]
          </div>
        </div>
      )}

      {/* Detail panel */}
      <div
        className={`absolute right-0 top-0 z-20 h-full w-full max-w-md transform border-l border-border/60 bg-background/90 backdrop-blur-xl transition-transform duration-500 ease-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
      >
        {selected && (
          <div className="flex h-full flex-col overflow-y-auto">
            <div
              className="relative h-64 w-full overflow-hidden"
              style={{
                background: `radial-gradient(circle at 35% 40%, ${selected.glow}, transparent 55%), radial-gradient(circle at 65% 65%, ${selected.color}, #111111 78%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              <button
                onClick={resetView}
                className="absolute left-4 top-4 rounded-sm border border-border/60 bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground backdrop-blur transition hover:bg-brand-magenta/20"
              >
                ← disengage
              </button>
              <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-magenta/70">
                ↳ target locked
              </div>
            </div>
            <div className="flex-1 space-y-6 px-8 py-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-brand-magenta/70">
                  {selected.tagline}
                </div>
                <h2 className="mt-2 font-display text-4xl tracking-[0.1em] text-foreground">
                  {selected.name}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{selected.description}</p>
              <div className="space-y-3 border-t border-border/60 pt-6">
                {(
                  [
                    ["Market conditions", selected.facts.climate],
                    ["Specialists", selected.facts.inhabitants],
                    ["Market groups", selected.facts.factions],
                    ["Field note", selected.facts.history],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-magenta/70">
                      {k}
                    </div>
                    <div className="text-sm text-foreground/85">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- helpers ----
function makeStar(spread: boolean): Star3D {
  return {
    x: (Math.random() - 0.5) * 2400,
    y: (Math.random() - 0.5) * 2400,
    z: spread ? 20 + Math.random() * 1400 : 900 + Math.random() * 500,
    base: 0.6 + Math.random() * 1.6,
  };
}

// Summit-palette star tints (parchment/taupe with occasional lemon + magenta)
function starTint(z: number) {
  const h = (Math.sin(z * 12.9898) * 43758.5453) % 1;
  const r = Math.abs(h);
  if (r < 0.55) return "245, 240, 225"; // warm off-white
  if (r < 0.78) return "193, 176, 166"; // parchment taupe
  if (r < 0.91) return "240, 249, 95"; // lemon spark
  return "207, 111, 165"; // magenta spark
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  p: Planet,
  sx: number,
  sy: number,
  r: number,
  t: number,
  isHover: boolean,
) {
  // Atmospheric halo
  const glowR = r * 2.4;
  const pulse = 0.9 + 0.1 * Math.sin(t * 1.5 + p.orbitSpeed * 100);
  const g = ctx.createRadialGradient(sx, sy, r * 0.9, sx, sy, glowR);
  g.addColorStop(0, hexA(p.glow, 0.45 * pulse));
  g.addColorStop(0.35, hexA(p.glow, 0.15 * pulse));
  g.addColorStop(1, hexA(p.glow, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Back-half of ring
  if (p.hasRings) {
    drawRing(ctx, p, sx, sy, r, t, true);
  }

  // Body base
  const body = ctx.createRadialGradient(sx - r * 0.45, sy - r * 0.55, r * 0.05, sx, sy, r * 1.05);
  body.addColorStop(0, lighten(p.color, 0.45));
  body.addColorStop(0.5, p.color);
  body.addColorStop(1, darken(p.color, 0.7));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fill();

  // Surface bands (subtle) — clipped to sphere
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.clip();
  const bandCount = 5;
  for (let i = 0; i < bandCount; i++) {
    const yOff = -r + (i + 0.5) * ((r * 2) / bandCount) + Math.sin(t * 0.1 + i) * 2;
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = i % 2 ? lighten(p.color, 0.2) : darken(p.color, 0.25);
    ctx.fillRect(sx - r, sy + yOff - r * 0.06, r * 2, r * 0.12);
  }
  ctx.globalAlpha = 1;

  // Night-side terminator
  const shadow = ctx.createRadialGradient(
    sx + r * 0.6,
    sy + r * 0.55,
    r * 0.1,
    sx + r * 0.35,
    sy + r * 0.3,
    r * 1.5,
  );
  shadow.addColorStop(0, "rgba(0,0,0,0)");
  shadow.addColorStop(0.6, "rgba(0,0,0,0.35)");
  shadow.addColorStop(1, "rgba(0,0,0,0.75)");
  ctx.fillStyle = shadow;
  ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  ctx.restore();

  // Atmosphere rim (fresnel)
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.strokeStyle = hexA(p.glow, 0.55);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.stroke();
  ctx.restore();

  // Specular highlight
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.clip();
  const spec = ctx.createRadialGradient(
    sx - r * 0.5,
    sy - r * 0.55,
    0,
    sx - r * 0.5,
    sy - r * 0.55,
    r * 0.6,
  );
  spec.addColorStop(0, "rgba(255,255,255,0.35)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  ctx.restore();

  // Front half of ring
  if (p.hasRings) {
    drawRing(ctx, p, sx, sy, r, t, false);
  }

  // Moons
  if (p.moons && p.moons > 0) {
    for (let i = 0; i < p.moons; i++) {
      const ma = t * (0.6 + i * 0.4) + i * 1.7 + p.orbitSpeed * 30;
      const mr = r * (1.9 + i * 0.5);
      const mx = sx + Math.cos(ma) * mr;
      const my = sy + Math.sin(ma) * mr * 0.5;
      const msize = Math.max(1.2, r * 0.11);
      ctx.fillStyle = "#c1b0a6";
      ctx.beginPath();
      ctx.arc(mx, my, msize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Hover targeting reticle (sci-fi HUD)
  if (isHover) {
    ctx.strokeStyle = hexA(p.glow, 0.9);
    ctx.lineWidth = 1;
    const rr = r + 14;
    // corner brackets
    const bracket = (ang: number) => {
      const cxp = sx + Math.cos(ang) * rr;
      const cyp = sy + Math.sin(ang) * rr;
      const a1 = ang + 0.25;
      const a2 = ang - 0.25;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a1) * rr, sy + Math.sin(a1) * rr);
      ctx.lineTo(cxp, cyp);
      ctx.lineTo(sx + Math.cos(a2) * rr, sy + Math.sin(a2) * rr);
      ctx.stroke();
    };
    bracket(-Math.PI / 4);
    bracket((-Math.PI * 3) / 4);
    bracket(Math.PI / 4);
    bracket((Math.PI * 3) / 4);
  }
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  p: Planet,
  sx: number,
  sy: number,
  r: number,
  t: number,
  backHalf: boolean,
) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(-0.4 + p.spinSpeed * 0.05);
  ctx.scale(1, 0.28);
  ctx.beginPath();
  if (backHalf) ctx.arc(0, 0, r * 1.75, Math.PI, Math.PI * 2);
  else ctx.arc(0, 0, r * 1.75, 0, Math.PI);
  ctx.strokeStyle = hexA(p.ringColor || p.glow, 0.55);
  ctx.lineWidth = Math.max(1.5, r * 0.13);
  ctx.stroke();
  ctx.beginPath();
  if (backHalf) ctx.arc(0, 0, r * 2.05, Math.PI, Math.PI * 2);
  else ctx.arc(0, 0, r * 2.05, 0, Math.PI);
  ctx.strokeStyle = hexA(p.ringColor || p.glow, 0.28);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke();
  ctx.restore();
  void t;
}

function hexA(hex: string, a: number) {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function lighten(hex: string, amt: number) {
  const { r, g, b } = parseHex(hex);
  return `rgb(${Math.min(255, r + 255 * amt)}, ${Math.min(255, g + 255 * amt)}, ${Math.min(255, b + 255 * amt)})`;
}
function darken(hex: string, amt: number) {
  const { r, g, b } = parseHex(hex);
  return `rgb(${Math.max(0, r * (1 - amt))}, ${Math.max(0, g * (1 - amt))}, ${Math.max(0, b * (1 - amt))})`;
}
function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}
