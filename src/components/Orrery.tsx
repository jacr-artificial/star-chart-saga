import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DEMO_USER, PLANETS } from "@/data/orbit";

type OrbitCfg = {
  color: number;
  deep: number;
  radius: number;
  speed: number;
  size: number;
  theta: number;
  tilt: number;
};

const ORBITS: Record<string, OrbitCfg> = {
  "p-riskara": {
    color: 0xfb923c,
    deep: 0x9a3412,
    radius: 7.5,
    speed: 0.2,
    size: 1.75,
    theta: 0.7,
    tilt: 0.35,
  },
  "p-actuaria": {
    color: 0x38bdf8,
    deep: 0x1e3a8a,
    radius: 11.5,
    speed: 0.12,
    size: 1.25,
    theta: 2.9,
    tilt: -0.25,
  },
  "p-bindara": {
    color: 0x34d399,
    deep: 0x065f46,
    radius: 15.5,
    speed: 0.075,
    size: 1.5,
    theta: 4.7,
    tilt: 0.2,
  },
  "p-brossa": {
    color: 0xc084fc,
    deep: 0x581c87,
    radius: 19.5,
    speed: 0.05,
    size: 1.3,
    theta: 5.9,
    tilt: -0.15,
  },
};

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,225,170,0.9)");
  g.addColorStop(0.35, "rgba(255,190,110,0.35)");
  g.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

type OrreryProps = {
  progressById?: Record<string, number>;
  focusedId?: string | null;
  onFocusChange?: (planetId: string | null) => void;
};

export default function Orrery({
  progressById = {},
  focusedId = null,
  onFocusChange,
}: OrreryProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [warpTick, setWarpTick] = useState(0);
  const onFocusRef = useRef(onFocusChange);
  onFocusRef.current = onFocusChange;

  // Camera fly-to state, read inside the animation loop.
  const focusRef = useRef<string | null>(focusedId);
  const pendingFocusRef = useRef<string | null>(null);
  const returningRef = useRef(false);

  useEffect(() => {
    const prev = focusRef.current;
    focusRef.current = focusedId;
    if (focusedId && focusedId !== prev) {
      pendingFocusRef.current = focusedId;
      setWarpTick((k) => k + 1);
    } else if (!focusedId && prev) {
      returningRef.current = true;
    }
  }, [focusedId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
    camera.position.set(0, 15, 27);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.minDistance = 14;
    controls.maxDistance = 55;
    controls.minPolarAngle = 0.6;
    controls.maxPolarAngle = 1.35;

    scene.add(new THREE.AmbientLight(0x9aa0d0, 0.55));
    const sunLight = new THREE.PointLight(0xffe0b0, 2.4, 0, 0);
    scene.add(sunLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffcf7d }),
    );
    scene.add(sun);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        transparent: true,
        depthWrite: false,
      }),
    );
    glow.scale.set(11, 11, 1);
    scene.add(glow);

    const starCount = 500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 60 + Math.random() * 60;
      const a = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 2;
      const rr = Math.sqrt(1 - z * z);
      starPos[i * 3] = r * rr * Math.cos(a);
      starPos[i * 3 + 1] = r * z;
      starPos[i * 3 + 2] = r * rr * Math.sin(a);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({
          color: 0xcdd3ff,
          size: 0.28,
          transparent: true,
          opacity: 0.75,
          sizeAttenuation: true,
        }),
      ),
    );

    const planetMeshes: THREE.Mesh[] = [];
    const meshById: Record<string, THREE.Mesh> = {};
    const pivots: Record<string, { pivot: THREE.Group; cfg: OrbitCfg }> = {};

    for (const p of PLANETS) {
      const cfg = ORBITS[p.id]!;

      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, 0, Math.sin(a) * cfg.radius));
      }
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(ringPts),
          new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.28,
          }),
        ),
      );

      const pivot = new THREE.Group();
      pivot.rotation.y = cfg.theta;
      scene.add(pivot);
      pivots[p.id] = { pivot, cfg };

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, cfg.radius, 8),
        new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.32,
        }),
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.x = cfg.radius / 2;
      pivot.add(arm);

      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd8ccff }),
      );
      bead.position.x = cfg.radius;
      pivot.add(bead);

      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.size, 40, 40),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.45,
          metalness: 0.12,
          emissive: cfg.deep,
          emissiveIntensity: 0.45,
        }),
      );
      planet.position.x = cfg.radius;
      planet.userData = { planetId: p.id, baseScale: 1 };
      pivot.add(planet);
      planetMeshes.push(planet);
      meshById[p.id] = planet;

      if (p.ring) {
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.size * 1.65, 0.055, 12, 80),
          new THREE.MeshBasicMaterial({
            color: 0xe2e8f0,
            transparent: true,
            opacity: 0.5,
          }),
        );
        torus.rotation.x = Math.PI / 2 + cfg.tilt;
        planet.add(torus);
      }

      if (p.id === DEMO_USER.spawnPlanetId) {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xfde68a,
            emissive: 0x92400e,
            emissiveIntensity: 0.5,
          }),
        );
        moon.userData.isMoon = true;
        planet.add(moon);
      }
    }

    type Pair = {
      a: THREE.Mesh;
      b: THREE.Mesh;
      line: THREE.Line;
      pulse: THREE.Mesh;
      offset: number;
    };
    const pairs: Pair[] = [];
    for (let i = 0; i < planetMeshes.length; i++) {
      for (let j = i + 1; j < planetMeshes.length; j++) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: 0xa78bfa,
            transparent: true,
            opacity: 0.35,
          }),
        );
        scene.add(line);
        const pulse = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
        );
        scene.add(pulse);
        pairs.push({
          a: planetMeshes[i]!,
          b: planetMeshes[j]!,
          line,
          pulse,
          offset: Math.random(),
        });
      }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Mesh | null = null;
    let downPos: { x: number; y: number } | null = null;

    const setPointerFromEvent = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(planetMeshes, false)[0];
      const next = hit ? (hit.object as THREE.Mesh) : null;
      if (next !== hovered) {
        hovered = next;
        setHoveredId(hovered ? (hovered.userData.planetId as string) : null);
        renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (moved < 6 && hovered) {
        onFocusRef.current?.(hovered.userData.planetId as string);
      }
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const clock = new THREE.Clock();
    const va = new THREE.Vector3();
    const vb = new THREE.Vector3();
    const vp = new THREE.Vector3();

    // Camera fly-to ("swoosh") state
    const HOME_POS = new THREE.Vector3(0, 15, 27);
    const HOME_TARGET = new THREE.Vector3(0, 0, 0);
    const focusWorld = new THREE.Vector3();
    const desiredPos = new THREE.Vector3();
    const focusOffset = new THREE.Vector3();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      for (const { pivot, cfg } of Object.values(pivots)) {
        pivot.rotation.y = cfg.theta + t * cfg.speed;
      }
      for (const m of planetMeshes) {
        m.rotation.y = t * 0.35;
        const target = hovered === m ? 1.18 : 1;
        const s = m.scale.x + (target - m.scale.x) * 0.15;
        m.scale.setScalar(s);
        const moon = m.children.find((c) => c.userData.isMoon);
        if (moon) {
          const radius = (m.geometry as THREE.SphereGeometry).parameters.radius;
          moon.position.set(
            Math.cos(t * 1.6) * (radius + 0.85),
            0.3,
            Math.sin(t * 1.6) * (radius + 0.85),
          );
        }
      }
      sun.rotation.y = t * 0.1;
      (glow.material as THREE.SpriteMaterial).opacity = 0.85 + Math.sin(t * 2.1) * 0.12;

      for (const pair of pairs) {
        pair.a.getWorldPosition(va);
        pair.b.getWorldPosition(vb);
        const posAttr = pair.line.geometry.attributes.position!;
        posAttr.setXYZ(0, va.x, va.y, va.z);
        posAttr.setXYZ(1, vb.x, vb.y, vb.z);
        posAttr.needsUpdate = true;
        const k = (t * 0.18 + pair.offset) % 1;
        vp.lerpVectors(va, vb, k);
        pair.pulse.position.copy(vp);
      }

      const w = mount.clientWidth;
      const h = mount.clientHeight;
      for (const m of planetMeshes) {
        const el = labelRefs.current[m.userData.planetId as string];
        if (!el) continue;
        m.getWorldPosition(va);
        va.y += (m.geometry as THREE.SphereGeometry).parameters.radius + 0.6;
        va.project(camera);
        const x = (va.x * 0.5 + 0.5) * w;
        const y = (-va.y * 0.5 + 0.5) * h;
        const behind = va.z > 1;
        el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        el.style.opacity = behind ? "0" : "1";
      }

      const fid = focusRef.current;
      if (fid && meshById[fid]) {
        const cfg = ORBITS[fid]!;
        meshById[fid]!.getWorldPosition(focusWorld);
        if (pendingFocusRef.current === fid) {
          // Frame a fresh close-up view: outward (radial) from the sun, lifted a touch.
          focusOffset.set(focusWorld.x, 0, focusWorld.z);
          if (focusOffset.lengthSq() < 1e-4) focusOffset.set(0, 0, 1);
          focusOffset.normalize().multiplyScalar(cfg.size * 4 + 5);
          focusOffset.y = cfg.size * 2.2 + 3;
          pendingFocusRef.current = null;
        }
        desiredPos.copy(focusWorld).add(focusOffset);
        controls.enabled = false;
        controls.autoRotate = false;
        controls.target.lerp(focusWorld, 0.09);
        camera.position.lerp(desiredPos, 0.07);
      } else if (returningRef.current) {
        controls.enabled = false;
        controls.autoRotate = false;
        controls.target.lerp(HOME_TARGET, 0.08);
        camera.position.lerp(HOME_POS, 0.06);
        if (
          camera.position.distanceTo(HOME_POS) < 0.4 &&
          controls.target.distanceTo(HOME_TARGET) < 0.4
        ) {
          returningRef.current = false;
          controls.enabled = true;
          controls.autoRotate = true;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="relative w-full h-full overflow-hidden rounded-3xl">
      {warpTick > 0 && (
        <div
          key={warpTick}
          className="warp-flash pointer-events-none absolute inset-0 z-20"
          aria-hidden
        />
      )}
      {PLANETS.map((p) => (
        <button
          key={p.id}
          ref={(el) => {
            labelRefs.current[p.id] = el;
          }}
          onClick={() => onFocusChange?.(p.id)}
          className={`absolute left-0 top-0 z-10 text-center transition-opacity duration-200 ${
            hoveredId === p.id ? "scale-105" : ""
          } ${focusedId === p.id ? "ring-1 ring-violet-400/60 rounded-xl" : ""}`}
          style={{ willChange: "transform" }}
        >
          <div className="pointer-events-auto rounded-xl border border-white/15 bg-[#0b0d22]/80 backdrop-blur px-3 py-1.5 shadow-lg">
            <div className="text-sm font-bold leading-tight flex items-center gap-1.5 justify-center">
              {p.name}
              {p.id === DEMO_USER.spawnPlanetId && (
                <span className="text-[0.6rem] text-amber-300">🏠</span>
              )}
            </div>
            {p.comingSoon ? (
              <div className="mt-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-300/90">
                Coming soon
              </div>
            ) : (
              <>
                <div className="text-[0.65rem] text-slate-400">{p.domain}</div>
                <div className="mt-1 w-24 h-1 rounded-full bg-white/10 overflow-hidden mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-amber-400"
                    style={{ width: `${progressById[p.id] ?? 0}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </button>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] text-slate-500 bg-[#0b0d22]/60 rounded-full px-3 py-1 backdrop-blur pointer-events-none">
        drag to orbit · scroll to zoom · click a planet to engage
      </div>
    </div>
  );
}
