import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { BrainCanvas } from './BrainCanvas';
import { useBrainRegions } from './useBrainRegions';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import { BRAIN_REGIONS, type BrainRegionId } from '@/data/brain-regions';
import { prefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// ─── Concept ──────────────────────────────────────────────────────────────────
//
// The cube choreography, told with the brain. The assembled brain turns in the
// hero, then bursts apart; while each section is on screen its region flies in
// beside the card, turns to show itself, then leaves the other way.
//
// Every transform is a pure function of scroll position (plus the hero spin),
// computed each frame — no competing timelines, so scrolling back and forth can
// never leave a region in the wrong place.

/** Brain-space direction each region shows to the camera while showcased. */
const VIEW_DIR: Record<BrainRegionId, [number, number, number]> = {
  prefrontal: [1, 0.25, -0.8],
  motor: [0.15, 0.9, -0.8],
  occipital: [-1, 0.15, -0.7],
  temporal: [0.2, -0.35, -1],
  parietal: [-0.6, 0.7, -0.8],
  broca: [0.45, -0.05, -1],
  wernicke: [-0.4, 0.05, -1],
  corpus: [0.05, 0.35, -1],
};

/** Euler (no roll) that turns a brain-space direction towards the camera (+Z). */
const facing = ([x, y, z]: [number, number, number]) =>
  new THREE.Euler(THREE.MathUtils.clamp(Math.atan2(y, Math.hypot(x, z)), -0.9, 0.9), Math.atan2(-x, z), 0, 'XYZ');

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const easeIn = (t: number) => t * t;
const lerp = THREE.MathUtils.lerp;

// Phase boundaries
const BURST = [0.3, 0.7] as const; // hero progress over which the brain bursts apart
const SNAP = [0.55, 0.7] as const; // hero spin unwinds to 0 (regions are fading by then)
const ENTER_END = 0.28; // section progress: fly-in finished
const EXIT_START = 0.64; // section progress: start leaving

interface BrainProps {
  labelRef: RefObject<HTMLDivElement>;
}

const Brain = ({ labelRef }: BrainProps) => {
  const regions = useBrainRegions();
  const { camera, size, viewport, invalidate } = useThree();
  const reducedMotion = useMemo(prefersReducedMotion, []);

  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hoveredRef = useRef(-1);
  const spinRef = useRef(0.6);
  const labelRegionRef = useRef(-2);
  const hoverState = useRef(SECTIONS_DATA.map(() => 0));

  const materials = useMemo(
    () =>
      SECTIONS_DATA.map(
        (s) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(s.accentColor).lerp(new THREE.Color('#ffffff'), 0.35),
            emissive: new THREE.Color(s.accentColor),
            emissiveIntensity: 0.08,
            roughness: 0.42,
            metalness: 0.05,
            transparent: true,
          }),
      ),
    [],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  /** Per-region constants: burst direction, random burst spin, showcase pose. */
  const plans = useMemo(
    () =>
      regions.map((r, i) => {
        const out = r.home.length() < 0.25 ? new THREE.Vector3(0, 1, 0.3).normalize() : r.home.clone().normalize();
        const rnd = (n: number) => Math.sin((i + 1) * 12.9898 * n) * 0.5 + 0.5; // deterministic "random"
        return {
          out,
          burstSpin: new THREE.Euler(rnd(1) * 6 - 3, rnd(2) * 6 - 3, rnd(3) * 6 - 3),
          pose: facing(VIEW_DIR[r.id]),
          side: SECTIONS_DATA[i].direction === 'left' ? 1 : -1, // card left → region right
        };
      }),
    [regions],
  );

  // Scroll ranges (ScrollTrigger keeps them correct across resizes)
  const heroTrigger = useRef<ScrollTrigger | null>(null);
  const sectionTriggers = useRef<ScrollTrigger[]>([]);
  useEffect(() => {
    heroTrigger.current = ScrollTrigger.create({
      trigger: '#hero-spacer',
      start: 'top top',
      end: 'bottom top',
      onRefresh: () => invalidate(),
    });
    sectionTriggers.current = SECTIONS_DATA.map((s) =>
      ScrollTrigger.create({ trigger: `#${s.id}`, start: 'top 85%', end: 'bottom 5%' }),
    );
    return () => {
      heroTrigger.current?.kill();
      sectionTriggers.current.forEach((t) => t.kill());
    };
  }, [invalidate]);

  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    const hero = heroTrigger.current;
    if (!group || !hero) return;
    const dt = Math.min(rawDelta, 0.1);
    const y = window.scrollY;
    let moving = false;

    const hp = hero.end > hero.start ? clamp01((y - hero.start) / (hero.end - hero.start)) : 0;
    const portrait = viewport.width < viewport.height * 0.9;
    const heroScale = portrait ? Math.min(1.0, viewport.width / 2.3) : Math.min(1.45, viewport.width * 0.17);
    group.scale.setScalar(heroScale);

    // ── Hero spin, unwinding to 0 while the regions fly apart ──────────────
    const spinning = !reducedMotion && hp < SNAP[1];
    if (spinning) {
      spinRef.current += dt * 0.35 * (1 - range(hp, 0, SNAP[0]));
      moving = true;
    }
    const wrapped = ((((spinRef.current + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
    const snap = smooth(range(hp, SNAP[0], SNAP[1]));
    group.rotation.set(Math.sin(spinRef.current * 0.8) * 0.12 * (1 - snap), wrapped * (1 - snap), 0);

    // Showcase geometry (world units → group-local by dividing by heroScale)
    const showRadius = portrait ? Math.min(0.5, viewport.width * 0.2) : Math.min(0.95, viewport.width * 0.1);
    const targetX = portrait ? 0 : viewport.width * 0.23;
    // phones: upper area, low enough that the label clears the navbar
    const targetY = portrait ? viewport.height * 0.21 : 0;

    let labelFocus = -1;
    const burst = range(hp, BURST[0], BURST[1]);
    const hovered = hp < 0.25 ? hoveredRef.current : -1;

    for (let i = 0; i < regions.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const r = regions[i];
      const p = plans[i];
      const mat = materials[i];
      const st = sectionTriggers.current[i];
      const sp = st && st.end > st.start ? (y - st.start) / (st.end - st.start) : -1;

      // Hover lift / glow in the hero
      const hs = hoverState.current;
      const hTarget = i === hovered ? 1 : 0;
      hs[i] += (hTarget - hs[i]) * (reducedMotion ? 1 : 1 - Math.exp(-8 * dt));
      if (Math.abs(hTarget - hs[i]) > 1e-3) moving = true;

      if (sp > 0 && sp < 1) {
        // ── Showcase: fly in beside the card, turn, hold, fly out ──────────
        const s = showRadius / r.radius / heroScale;
        const tx = (p.side * targetX) / heroScale;
        const ty = targetY / heroScale;
        const enter = easeOut(range(sp, 0, ENTER_END));
        const exit = range(sp, EXIT_START, 1);
        const startX = (portrait ? 0 : p.side * viewport.width * 0.8) / heroScale;
        const startY = (portrait ? viewport.height * 0.8 : 0) / heroScale;

        let px = lerp(startX, tx, enter);
        let py = lerp(startY, ty, smooth(range(sp, 0, ENTER_END)));
        let pz = lerp(-6, 1.2, smooth(range(sp, 0, ENTER_END))) / heroScale;
        // exit: come forward, then sweep out the opposite way
        const fwd = smooth(range(exit, 0, 0.5));
        const away = easeIn(range(exit, 0.5, 1));
        pz = lerp(pz, 2 / heroScale, fwd);
        px = lerp(px, (-p.side * viewport.width * 1.1) / heroScale, portrait ? 0 : away);
        py = lerp(py, (portrait ? -viewport.height * 0.9 : -viewport.height * 0.2) / heroScale, away);
        mesh.position.set(px, py, pz);

        // turn into its pose while entering, drift while held, tumble on exit
        const settle = 1 - enter;
        const drift = (sp - ENTER_END) * 0.8;
        mesh.rotation.set(
          p.pose.x + settle * 0.8 * p.side + away * 1.6,
          p.pose.y + settle * 1.2 * p.side + drift,
          p.pose.z + settle * 0.4,
        );
        const squash = Math.sin(Math.PI * range(sp, 0, ENTER_END)) * 0.12;
        mesh.scale.set(s * (1 + squash), s * (1 - squash), s * (1 + squash));

        mat.opacity = smooth(range(sp, 0, 0.1)) * (1 - smooth(range(sp, 0.85, 1)));
        mat.emissiveIntensity = 0.35;
        if (sp > 0.12 && sp < 0.8) labelFocus = i;
      } else if (sp >= 1) {
        mat.opacity = 0; // already shown and gone
      } else {
        // ── Hero: assembled brain, bursting apart with hero progress ───────
        const e = burst;
        const lift = hs[i] * 0.1;
        mesh.position
          .copy(r.home)
          .addScaledVector(p.out, lift)
          .addScaledVector(tmpVec.set(p.out.x * viewport.width * 1.4, p.out.y * viewport.height * 1.4, p.out.z * 4), e / heroScale);
        mesh.rotation.set(p.burstSpin.x * e, p.burstSpin.y * e, p.burstSpin.z * e);
        mesh.scale.setScalar(1);
        mat.opacity = 1 - smooth(range(e, 0.2, 1));
        mat.emissiveIntensity = 0.08 + hs[i] * 0.5;
        if (i === hovered) labelFocus = i;
      }
      mesh.visible = mat.opacity > 0.01;
      mat.depthWrite = mat.opacity > 0.9;
    }

    // ── Label pinned to the hovered / showcased region ─────────────────────
    const label = labelRef.current;
    if (label) {
      if (labelFocus !== labelRegionRef.current) {
        labelRegionRef.current = labelFocus;
        if (labelFocus >= 0) {
          const section = SECTIONS_DATA[labelFocus];
          const name = label.querySelector('[data-label-name]');
          const sub = label.querySelector('[data-label-section]');
          if (name) name.textContent = BRAIN_REGIONS[section.region].name;
          if (sub) sub.textContent = section.title;
          label.style.setProperty('--accent', section.accentColor);
        }
        label.style.opacity = labelFocus >= 0 ? '1' : '0';
      }
      const mesh = labelFocus >= 0 ? meshRefs.current[labelFocus] : null;
      if (mesh) {
        mesh.getWorldPosition(tmpVec);
        // pin above the region's top edge rather than its centre
        tmpVec.y += regions[labelFocus].radius * mesh.scale.y * heroScale * 0.55;
        tmpVec.project(camera);
        const px = (tmpVec.x * 0.5 + 0.5) * size.width;
        const py = (-tmpVec.y * 0.5 + 0.5) * size.height;
        label.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      }
    }

    if (moving) invalidate();
  });

  // ── Interaction (hero only — the event overlay is disabled after it) ─────
  const onOver = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredRef.current = i;
    document.body.style.cursor = 'pointer';
    invalidate();
  };
  const onOut = (i: number) => () => {
    if (hoveredRef.current === i) hoveredRef.current = -1;
    document.body.style.cursor = '';
    invalidate();
  };
  const onClick = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    document.getElementById(SECTIONS_DATA[i].id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <group ref={groupRef}>
      {regions.map((r, i) => (
        <mesh
          key={r.id}
          ref={(m) => {
            meshRefs.current[i] = m;
          }}
          geometry={r.geometry}
          material={materials[i]}
          position={r.home}
          onPointerOver={onOver(i)}
          onPointerOut={onOut(i)}
          onClick={onClick(i)}
        />
      ))}
    </group>
  );
};

/** Region label rendered in the DOM and positioned by the scene every frame. */
const RegionLabel = ({ labelRef }: BrainProps) => (
  <div
    ref={labelRef}
    aria-hidden="true"
    className="fixed left-0 top-0 z-[1] pointer-events-none transition-opacity duration-300 will-change-transform"
    style={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
      <div className="region-label text-accent-readable rounded-xl px-3 py-1.5 text-center">
        <p data-label-name className="font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.18em]" />
        <p data-label-section className="text-[10px] md:text-xs text-text-muted" />
      </div>
      <span className="w-px h-4 md:h-6" style={{ background: 'var(--accent)' }} />
    </div>
  </div>
);

export const BrainScene = () => {
  const labelRef = useRef<HTMLDivElement>(null);
  // Mount the canvas after first paint so text and layout settle first
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!ready) return null;

  return (
    <>
      <BrainCanvas>
        <Brain labelRef={labelRef} />
      </BrainCanvas>
      <RegionLabel labelRef={labelRef} />
    </>
  );
};

export default BrainScene;
