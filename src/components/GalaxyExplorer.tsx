import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PLANETS, type Planet } from "@/data/planets";

type Camera = { x: number; y: number; zoom: number };

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 6;
const GALAXY_SCALE = 520; // multiplier for planet coord -> px

export default function GalaxyExplorer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera stored in ref for animation loop; state mirror triggers re-render of UI overlays
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

  // Starfield layers
  const starsRef = useRef<
    Array<{ x: number; y: number; r: number; layer: number; tw: number; twSpeed: number }>
  >([]);
  const nebulaRef = useRef<
    Array<{ x: number; y: number; r: number; color: string; drift: number }>
  >([]);
  const shootingRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; max: number }>
  >([]);

  // Generate stars/nebula once
  useMemo(() => {
    const stars: typeof starsRef.current = [];
    const layers = 4;
    const counts = [180, 140, 100, 60];
    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < counts[l]; i++) {
        stars.push({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          r: 0.3 + Math.random() * (l * 0.6 + 0.5),
          layer: l,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.5 + Math.random() * 1.5,
        });
      }
    }
    starsRef.current = stars;

    const nebulas: typeof nebulaRef.current = [];
    const palette = [
      "rgba(120, 60, 190, 0.22)",
      "rgba(40, 120, 200, 0.20)",
      "rgba(30, 180, 180, 0.16)",
      "rgba(180, 60, 140, 0.18)",
      "rgba(60, 80, 200, 0.20)",
    ];
    for (let i = 0; i < 7; i++) {
      nebulas.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        r: 400 + Math.random() * 700,
        color: palette[i % palette.length],
        drift: Math.random() * Math.PI * 2,
      });
    }
    nebulaRef.current = nebulas;
  }, []);

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current!;
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

  // Convert galaxy coord -> screen
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

  // Compute a planet's current world position (with slow orbital drift)
  const planetWorldPos = useCallback((p: Planet, t: number) => {
    const baseX = p.x * GALAXY_SCALE;
    const baseY = p.y * GALAXY_SCALE;
    // gentle orbital drift around center
    const radius = Math.hypot(baseX, baseY);
    const angle0 = Math.atan2(baseY, baseX);
    const angle = angle0 + p.orbitSpeed * t;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }, []);

  const hitTestPlanet = useCallback(
    (sx: number, sy: number, t: number): Planet | null => {
      // iterate front-to-back (higher depth first)
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

      // Ease camera toward target
      const cam = camRef.current;
      const tgt = targetCamRef.current;
      const ease = 1 - Math.pow(0.001, dt); // smooth
      cam.x += (tgt.x - cam.x) * ease;
      cam.y += (tgt.y - cam.y) * ease;
      cam.zoom += (tgt.zoom - cam.zoom) * ease;

      // Inertia when not dragging
      if (!draggingRef.current) {
        const v = velocityRef.current;
        if (Math.abs(v.vx) > 0.01 || Math.abs(v.vy) > 0.01) {
          tgt.x -= (v.vx / cam.zoom) * dt * 60;
          tgt.y -= (v.vy / cam.zoom) * dt * 60;
          v.vx *= 0.92;
          v.vy *= 0.92;
        }
      }

      draw(elapsed);

      // Occasionally spawn a shooting star
      if (Math.random() < 0.004) {
        const { w, h } = sizeRef.current;
        const fromLeft = Math.random() < 0.5;
        shootingRef.current.push({
          x: fromLeft ? -50 : w + 50,
          y: Math.random() * h * 0.6,
          vx: (fromLeft ? 1 : -1) * (400 + Math.random() * 300),
          vy: 60 + Math.random() * 120,
          life: 0,
          max: 1.2,
        });
      }

      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(render);
    };

    const draw = (t: number) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      bg.addColorStop(0, "#0a0716");
      bg.addColorStop(0.6, "#05030d");
      bg.addColorStop(1, "#020106");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const cam = camRef.current;

      // Nebulas (parallax slow)
      ctx.globalCompositeOperation = "screen";
      for (const n of nebulaRef.current) {
        const px = w / 2 + (n.x * 800 - cam.x * 0.15) + Math.cos(t * 0.05 + n.drift) * 20;
        const py = h / 2 + (n.y * 800 - cam.y * 0.15) + Math.sin(t * 0.04 + n.drift) * 20;
        const g = ctx.createRadialGradient(px, py, 0, px, py, n.r);
        g.addColorStop(0, n.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";

      // Stars with parallax by layer
      for (const s of starsRef.current) {
        const parallax = 0.15 + s.layer * 0.25;
        const px = ((s.x * 2000 - cam.x * parallax) % 2000 + 3000) % 2000 - 1000 + w / 2;
        const py = ((s.y * 2000 - cam.y * parallax) % 2000 + 3000) % 2000 - 1000 + h / 2;
        if (px < -5 || px > w + 5 || py < -5 || py > h + 5) continue;
        const tw = 0.6 + 0.4 * Math.sin(t * s.twSpeed + s.tw);
        ctx.globalAlpha = tw * (0.4 + s.layer * 0.2);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Spiral galaxy hint (faint arms)
      ctx.save();
      ctx.translate(w / 2 - cam.x * cam.zoom, h / 2 - cam.y * cam.zoom);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.globalCompositeOperation = "screen";
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        const armOffset = (arm * Math.PI * 2) / 3;
        for (let i = 0; i < 200; i++) {
          const a = i * 0.08 + armOffset + t * 0.005;
          const r = i * 4;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
        grad.addColorStop(0, "rgba(180,140,255,0.25)");
        grad.addColorStop(1, "rgba(60,30,120,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 40;
        ctx.stroke();
      }
      // core glow
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 260);
      core.addColorStop(0, "rgba(255,220,180,0.55)");
      core.addColorStop(0.4, "rgba(200,120,220,0.25)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Planets — sort back-to-front by depth
      const sorted = [...PLANETS].sort((a, b) => a.depth - b.depth);
      for (const p of sorted) {
        const wp = planetWorldPos(p, t);
        const { sx, sy } = worldToScreen(wp.x, wp.y);
        const depthMul = 0.6 + p.depth * 0.6;
        const r = p.size * cam.zoom * depthMul;
        if (sx < -r * 3 || sx > w + r * 3 || sy < -r * 3 || sy > h + r * 3) continue;

        // Glow
        const glowR = r * 2.6;
        const pulse = 0.9 + 0.1 * Math.sin(t * 1.5 + p.orbitSpeed * 100);
        const g = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, glowR);
        g.addColorStop(0, hexA(p.glow, 0.55 * pulse));
        g.addColorStop(0.4, hexA(p.glow, 0.2 * pulse));
        g.addColorStop(1, hexA(p.glow, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Rings (behind body)
        if (p.hasRings) {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(-0.4 + p.spinSpeed * 0.1);
          ctx.scale(1, 0.32);
          ctx.strokeStyle = hexA(p.ringColor || p.glow, 0.55);
          ctx.lineWidth = Math.max(1.5, r * 0.12);
          ctx.beginPath();
          ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = hexA(p.ringColor || p.glow, 0.3);
          ctx.lineWidth = Math.max(1, r * 0.06);
          ctx.beginPath();
          ctx.arc(0, 0, r * 1.95, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Body
        const body = ctx.createRadialGradient(sx - r * 0.4, sy - r * 0.5, r * 0.1, sx, sy, r);
        body.addColorStop(0, lighten(p.color, 0.35));
        body.addColorStop(0.55, p.color);
        body.addColorStop(1, darken(p.color, 0.55));
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Terminator shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.clip();
        const shadow = ctx.createRadialGradient(sx + r * 0.7, sy + r * 0.6, r * 0.1, sx + r * 0.4, sy + r * 0.3, r * 1.6);
        shadow.addColorStop(0, "rgba(0,0,0,0)");
        shadow.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = shadow;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
        ctx.restore();

        // Moons
        if (p.moons && p.moons > 0) {
          for (let i = 0; i < p.moons; i++) {
            const ma = t * (0.6 + i * 0.4) + i * 1.7 + p.orbitSpeed * 30;
            const mr = r * (1.9 + i * 0.5);
            const mx = sx + Math.cos(ma) * mr;
            const my = sy + Math.sin(ma) * mr * 0.5;
            const msize = Math.max(1.2, r * 0.12);
            ctx.fillStyle = "#d8d3c8";
            ctx.beginPath();
            ctx.arc(mx, my, msize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Hover ring
        if (hovered?.planet.id === p.id) {
          ctx.strokeStyle = hexA(p.glow, 0.9);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, r + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Shooting stars
      const alive: typeof shootingRef.current = [];
      for (const s of shootingRef.current) {
        s.life += 0.016;
        s.x += s.vx * 0.016;
        s.y += s.vy * 0.016;
        const a = Math.max(0, 1 - s.life / s.max);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.05, s.y - s.vy * 0.05);
        ctx.stroke();
        if (s.life < s.max) alive.push(s);
      }
      shootingRef.current = alive;

      // Update hovered label position tracking (for DOM label)
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
    let elapsedRef = { t: 0 };
    const now = () => performance.now() / 1000;
    let startT = now();
    const getT = () => now() - startT;
    elapsedRef.t = 0;

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
        // hover test
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
    // approximate current world pos (use base pos — orbit is slow)
    const wp = { x: p.x * GALAXY_SCALE, y: p.y * GALAXY_SCALE };
    targetCamRef.current.x = wp.x;
    targetCamRef.current.y = wp.y;
    targetCamRef.current.zoom = Math.min(MAX_ZOOM, 2.6);
    setSelected(p);
  };

  const resetView = () => {
    targetCamRef.current = { x: 0, y: 0, zoom: 1 };
    setSelected(null);
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />

      {/* Header */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-6">
        <div className="pointer-events-auto">
          <div className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            The Aetherion Archive
          </div>
          <div className="mt-1 font-display text-2xl tracking-wide text-foreground">
            Galaxy Explorer
          </div>
        </div>
        <div className="pointer-events-auto max-w-[260px] text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          drag to pan · scroll to zoom · click a world
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col overflow-hidden rounded-md border border-border/60 bg-background/40 backdrop-blur">
        <button
          onClick={() => {
            const { w, h } = sizeRef.current;
            zoomAt(w / 2, h / 2, 1.3);
          }}
          className="border-b border-border/60 px-3 py-2 text-sm text-foreground/80 transition hover:bg-foreground/10"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => {
            const { w, h } = sizeRef.current;
            zoomAt(w / 2, h / 2, 1 / 1.3);
          }}
          className="border-b border-border/60 px-3 py-2 text-sm text-foreground/80 transition hover:bg-foreground/10"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:bg-foreground/10"
          aria-label="Reset view"
        >
          reset
        </button>
      </div>

      {/* Hover label */}
      {hovered && !selected && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-sm border border-border/60 bg-background/70 px-3 py-1 font-display text-xs uppercase tracking-[0.3em] text-foreground backdrop-blur"
          style={{ left: hovered.sx, top: hovered.sy - 60 }}
        >
          {hovered.planet.name}
        </div>
      )}

      {/* Detail panel */}
      <div
        className={`absolute right-0 top-0 z-20 h-full w-full max-w-md transform border-l border-border/60 bg-background/85 backdrop-blur-xl transition-transform duration-500 ease-out ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
      >
        {selected && (
          <div className="flex h-full flex-col overflow-y-auto">
            <div
              className="relative h-56 w-full overflow-hidden"
              style={{
                background: `radial-gradient(circle at 30% 40%, ${selected.glow}, transparent 60%), radial-gradient(circle at 70% 70%, ${selected.color}, #05030d 75%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
              <button
                onClick={resetView}
                className="absolute left-4 top-4 rounded-sm border border-border/60 bg-background/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground backdrop-blur transition hover:bg-foreground/10"
              >
                ← Back to galaxy
              </button>
            </div>
            <div className="flex-1 space-y-6 px-8 py-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  {selected.tagline}
                </div>
                <h2 className="mt-2 font-display text-4xl tracking-wide text-foreground">
                  {selected.name}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{selected.description}</p>
              <div className="space-y-3 border-t border-border/60 pt-6">
                {(
                  [
                    ["Climate", selected.facts.climate],
                    ["Inhabitants", selected.facts.inhabitants],
                    ["Factions", selected.facts.factions],
                    ["History", selected.facts.history],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
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

// --- color utils ---
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
