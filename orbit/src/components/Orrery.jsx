import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS, DEMO_USER } from "../data.js";

// Per-planet orbital config for the orrery
const ORBITS = {
  "p-riskara": { color: 0xfb923c, deep: 0x9a3412, radius: 7.5, speed: 0.20, size: 1.75, theta: 0.7, tilt: 0.35 },
  "p-modelia": { color: 0x38bdf8, deep: 0x1e3a8a, radius: 11.5, speed: 0.12, size: 1.25, theta: 2.9, tilt: -0.25 },
  "p-shipyard": { color: 0x34d399, deep: 0x065f46, radius: 15.5, speed: 0.075, size: 1.5, theta: 4.7, tilt: 0.2 },
};

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,225,170,0.9)");
  g.addColorStop(0.35, "rgba(255,190,110,0.35)");
  g.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/**
 * 3D orrery of the learning galaxy. Planets orbit a central star on visible
 * rings with orrery arms; planets are linked by shimmering connection lines
 * with little "traffic" pulses travelling between them.
 */
export default function Orrery({ progressById = {}, onSelect }) {
  const mountRef = useRef(null);
  const labelRefs = useRef({});
  const [hoveredId, setHoveredId] = useState(null);

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

    // ---------- lights ----------
    scene.add(new THREE.AmbientLight(0x9aa0d0, 0.55));
    const sunLight = new THREE.PointLight(0xffe0b0, 2.4, 0, 0);
    scene.add(sunLight);

    // ---------- central star ----------
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffcf7d })
    );
    scene.add(sun);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false })
    );
    glow.scale.set(11, 11, 1);
    scene.add(glow);

    // ---------- background stars ----------
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
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xcdd3ff, size: 0.28, transparent: true, opacity: 0.75, sizeAttenuation: true,
    })));

    // ---------- planets, orbit rings, orrery arms ----------
    const planetMeshes = [];
    const pivots = {};

    for (const p of PLANETS) {
      const cfg = ORBITS[p.id];

      // orbit ring
      const ringPts = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, 0, Math.sin(a) * cfg.radius));
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.28 })
      );
      scene.add(orbitLine);

      // pivot that rotates -> orrery motion
      const pivot = new THREE.Group();
      pivot.rotation.y = cfg.theta;
      scene.add(pivot);
      pivots[p.id] = { pivot, cfg };

      // orrery arm from star to planet
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, cfg.radius, 8),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.32 })
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.x = cfg.radius / 2;
      pivot.add(arm);

      // joint bead where arm meets ring
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd8ccff })
      );
      bead.position.x = cfg.radius;
      pivot.add(bead);

      // planet
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.size, 40, 40),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.45,
          metalness: 0.12,
          emissive: cfg.deep,
          emissiveIntensity: 0.45,
        })
      );
      planet.position.x = cfg.radius;
      planet.userData = { planetId: p.id, baseScale: 1 };
      pivot.add(planet);
      planetMeshes.push(planet);

      // ring (Saturn-style) for ringed planets
      if (p.ring) {
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.size * 1.65, 0.055, 12, 80),
          new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.5 })
        );
        torus.rotation.x = Math.PI / 2 + cfg.tilt;
        planet.add(torus);
      }

      // tiny moon on the spawn planet, so "home" reads at a glance
      if (p.id === DEMO_USER.spawnPlanetId) {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0x92400e, emissiveIntensity: 0.5 })
        );
        moon.userData.isMoon = true;
        planet.add(moon);
      }
    }

    // ---------- connections between planets (the "connected" part) ----------
    const pairs = [];
    for (let i = 0; i < planetMeshes.length; i++) {
      for (let j = i + 1; j < planetMeshes.length; j++) {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.35 })
        );
        scene.add(line);
        // travelling pulse along the connection
        const pulse = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        scene.add(pulse);
        pairs.push({ a: planetMeshes[i], b: planetMeshes[j], line, pulse, offset: Math.random() });
      }
    }

    // ---------- interaction ----------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    let downPos = null;

    const setPointerFromEvent = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e) => {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(planetMeshes, false)[0];
      const next = hit ? hit.object : null;
      if (next !== hovered) {
        hovered = next;
        setHoveredId(hovered ? hovered.userData.planetId : null);
        renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      }
    };
    const onPointerDown = (e) => { downPos = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = (e) => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (moved < 6 && hovered) onSelect?.(hovered.userData.planetId);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // ---------- sizing ----------
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    // ---------- animation ----------
    const clock = new THREE.Clock();
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vp = new THREE.Vector3();
    let raf;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // orrery motion
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
          moon.position.set(Math.cos(t * 1.6) * (m.geometry.parameters.radius + 0.85), 0.3, Math.sin(t * 1.6) * (m.geometry.parameters.radius + 0.85));
        }
      }
      sun.rotation.y = t * 0.1;
      glow.material.opacity = 0.85 + Math.sin(t * 2.1) * 0.12;

      // update connections + pulses
      for (const pair of pairs) {
        pair.a.getWorldPosition(va);
        pair.b.getWorldPosition(vb);
        const posAttr = pair.line.geometry.attributes.position;
        posAttr.setXYZ(0, va.x, va.y, va.z);
        posAttr.setXYZ(1, vb.x, vb.y, vb.z);
        posAttr.needsUpdate = true;
        const k = (t * 0.18 + pair.offset) % 1;
        vp.lerpVectors(va, vb, k);
        pair.pulse.position.copy(vp);
      }

      // project labels to screen space
      const w = mount.clientWidth, h = mount.clientHeight;
      for (const m of planetMeshes) {
        const el = labelRefs.current[m.userData.planetId];
        if (!el) continue;
        m.getWorldPosition(va);
        va.y += m.geometry.parameters.radius + 0.6;
        va.project(camera);
        const x = (va.x * 0.5 + 0.5) * w;
        const y = (-va.y * 0.5 + 0.5) * h;
        const behind = va.z > 1;
        el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
        el.style.opacity = behind ? "0" : "1";
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
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={mountRef} className="relative w-full h-full overflow-hidden rounded-3xl">
      {/* floating labels, positioned each frame from the 3D scene */}
      {PLANETS.map((p) => (
        <button
          key={p.id}
          ref={(el) => (labelRefs.current[p.id] = el)}
          onClick={() => onSelect?.(p.id)}
          className={`absolute left-0 top-0 z-10 text-center transition-opacity duration-200 ${
            hoveredId === p.id ? "scale-105" : ""
          }`}
          style={{ willChange: "transform" }}
        >
          <div className="pointer-events-auto rounded-xl border border-white/15 bg-[#0b0d22]/80 backdrop-blur px-3 py-1.5 shadow-lg">
            <div className="text-sm font-bold leading-tight flex items-center gap-1.5 justify-center">
              {p.name}
              {p.id === DEMO_USER.spawnPlanetId && <span className="text-[0.6rem] text-amber-300">🏠</span>}
            </div>
            <div className="text-[0.65rem] text-slate-400">{p.domain}</div>
            <div className="mt-1 w-24 h-1 rounded-full bg-white/10 overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-amber-400"
                style={{ width: `${progressById[p.id] ?? 0}%` }}
              />
            </div>
          </div>
        </button>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] text-slate-500 bg-[#0b0d22]/60 rounded-full px-3 py-1 backdrop-blur pointer-events-none">
        drag to orbit · scroll to zoom · click a planet to land
      </div>
    </div>
  );
}
