import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { BrainCanvas } from './BrainCanvas';
import { useBrainRegions } from './useBrainRegions';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import { BRAIN_REGIONS, type BrainRegionId } from '@/data/brain-regions';
import { prefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DEVICE } from '@/lib/device';

// ─── Concept ──────────────────────────────────────────────────────────────────
//
// The brain stays whole. In the hero it slowly turns and every region shows its
// section colour. While a section is on screen the brain glides to the side
// opposite its card, turns to face that section's region, and the region lights
// up and lifts out while the rest of the brain fades to a translucent ghost.
// The active section is the one whose card is closest to the middle of the
// screen, and the brain follows that card vertically as it scrolls.

const HERO = -1;
const FOOTER = SECTIONS_DATA.length;

/** Brain-space direction the camera looks from for each region (left hemisphere side). */
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
const HERO_VIEW: [number, number, number] = [0.35, 0.2, -1];

/** Rotation that turns a brain-space direction towards the camera (+Z) with no roll. */
const facing = ([x, y, z]: [number, number, number]) => {
  const yaw = Math.atan2(-x, z);
  const pitch = THREE.MathUtils.clamp(Math.atan2(y, Math.hypot(x, z)), -0.9, 0.9);
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'XYZ'));
};

const REGION_QUATS = SECTIONS_DATA.map((s) => facing(VIEW_DIR[s.region]));
const HERO_QUAT = facing(HERO_VIEW);

/** How far (in viewport heights) the first/last card travels while the brain
 *  moves between the hero/footer and that card. */
const EDGE_TRAVEL = 0.6;
/** Fraction of the scroll between two cards (at each end) where the brain
 *  holds the current card's pose, so it's steady while you read. */
const HOLD = 0.15;

const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** Frame-rate independent exponential smoothing factor. */
const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

interface RegionState {
  opacity: number;
  emissive: number;
  lift: number;
}

interface BrainProps {
  labelRef: RefObject<HTMLDivElement>;
}

const Brain = ({ labelRef }: BrainProps) => {
  const regions = useBrainRegions();
  const { camera, size, viewport, invalidate } = useThree();

  const placementRef = useRef<THREE.Group>(null);
  const orientRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hoveredRef = useRef(-1);
  const activeRef = useRef(HERO);
  const spinRef = useRef(0);
  const labelRegionRef = useRef(-2);
  const reducedMotion = useMemo(prefersReducedMotion, []);

  // One material per region, tinted with its section colour
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
  // Cut surfaces closing each region: darker "inner tissue" in the region's hue
  const cutMaterials = useMemo(
    () =>
      SECTIONS_DATA.map(
        (s) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(s.accentColor).lerp(new THREE.Color('#3b1d2e'), 0.55),
            emissive: new THREE.Color(s.accentColor),
            emissiveIntensity: 0.04,
            roughness: 0.85,
            metalness: 0,
            side: THREE.DoubleSide,
            transparent: true,
          }),
      ),
    [],
  );
  useEffect(
    () => () => [...materials, ...cutMaterials].forEach((m) => m.dispose()),
    [materials, cutMaterials],
  );

  /** Outward direction each region lifts along when highlighted. */
  const liftDirs = useMemo(
    () =>
      regions.map(({ home }) =>
        home.length() < 0.25 ? new THREE.Vector3(0, 1, 0) : home.clone().normalize(),
      ),
    [regions],
  );

  // Section cards, in section order (the brain's motion is derived from them)
  const cardsRef = useRef<HTMLElement[]>([]);
  useEffect(() => {
    cardsRef.current = SECTIONS_DATA.map((sd) =>
      document.querySelector<HTMLElement>(`#${sd.id} [data-section-card]`),
    ).filter((el): el is HTMLElement => el !== null);
    invalidate();
  }, [invalidate]);

  const hoverRef = useRef(SECTIONS_DATA.map(() => 0));
  const quatA = useMemo(() => new THREE.Quaternion(), []);
  const quatB = useMemo(() => new THREE.Quaternion(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const visA = useMemo<RegionState[]>(() => SECTIONS_DATA.map(() => ({ opacity: 1, emissive: 0, lift: 0 })), []);
  const visB = useMemo<RegionState[]>(() => SECTIONS_DATA.map(() => ({ opacity: 1, emissive: 0, lift: 0 })), []);

  useFrame((_, rawDelta) => {
    const placement = placementRef.current;
    const orient = orientRef.current;
    const cards = cardsRef.current;
    if (!placement || !orient || !cards.length) return;
    const dt = Math.min(rawDelta, 0.1);
    const N = cards.length;
    const vh = size.height;
    let moving = false;

    // ── 1. One continuous scroll position ─────────────────────────────────
    // s = -1 hero · 0..N-1 card k at rest on screen · N footer.
    // Between two integers the brain is part-way from one state to the next.
    const portrait = viewport.width < viewport.height * 0.9;
    const rects = cards.map((c) => c.getBoundingClientRect());
    // Where a card "rests" while you read it: centred on desktop; on phones
    // near the bottom of the screen (its place in the section), so the
    // brain has the free space above it.
    const restCentre = (h: number) => (portrait ? vh * 0.93 - h / 2 : vh / 2);
    const offs = rects.map((r) => (r.top + r.height / 2 - restCentre(r.height)) / vh); // 0 = at rest
    let s: number;
    if (offs[0] >= 0) s = -Math.min(1, offs[0] / EDGE_TRAVEL);
    else if (offs[N - 1] <= 0) s = N - 1 + Math.min(1, -offs[N - 1] / EDGE_TRAVEL);
    else {
      s = 0;
      for (let i = 0; i < N - 1; i++)
        if (offs[i] <= 0 && offs[i + 1] >= 0) {
          s = i + -offs[i] / Math.max(1e-6, offs[i + 1] - offs[i]);
          break;
        }
    }
    const a = Math.min(N - 1, Math.floor(s)); // -1..N-1
    const b = a + 1; // 0..N
    // Hold still while a card is near the middle, travel between cards
    const t = smoothstep(Math.min(1, Math.max(0, ((s - a) - HOLD) / (1 - 2 * HOLD))));
    const atHero = s <= -1 + 1e-4;
    const atFooter = s >= N - 1e-4;
    const dominant = t < 0.5 ? a : b;
    activeRef.current = atHero ? HERO : dominant >= N ? FOOTER : dominant;

    // ── 2. Placement for any state, from the live card positions ──────────
    const toWorldY = (screenY: number) => (0.5 - screenY / vh) * viewport.height;
    const heroScale = portrait ? Math.min(1.0, viewport.width / 2.3) : Math.min(1.45, viewport.width * 0.17);
    const placeFor = (k: number) => {
      if (k < 0) return { x: 0, y: 0, scale: heroScale };
      if (k >= N) return { x: 0, y: viewport.height * (portrait ? 0.27 : 0.24), scale: heroScale * 0.6 };
      const r = rects[k];
      if (portrait) {
        // In the free space above the card, moving with it; label kept clear of the navbar
        const scale = Math.min(0.62, viewport.width / 3.8);
        const brainPx = 1.45 * scale * (vh / viewport.height);
        const screenY = Math.max(80 + 64 + brainPx * 0.25, r.top - brainPx / 2 - 14);
        return { x: 0, y: toWorldY(Math.min(vh * 1.3, screenY)), scale };
      }
      // Beside the card, level with its centre (within the middle band)
      const side = SECTIONS_DATA[k].direction === 'left' ? 1 : -1;
      const centre = r.top + r.height / 2;
      return {
        x: side * viewport.width * 0.23,
        y: toWorldY(Math.min(vh * 0.68, Math.max(vh * 0.32, centre))),
        scale: Math.min(1.2, viewport.width * 0.135),
      };
    };
    const pa = placeFor(a);
    const pb = placeFor(b);
    placement.position.set(THREE.MathUtils.lerp(pa.x, pb.x, t), THREE.MathUtils.lerp(pa.y, pb.y, t), 0);
    placement.scale.setScalar(THREE.MathUtils.lerp(pa.scale, pb.scale, t));

    // ── 3. Orientation: idle turn in hero/footer, region views in between ─
    if ((atHero || atFooter) && !reducedMotion) {
      spinRef.current += dt * 0.25;
      moving = true;
    }
    const heroQuat = (out: THREE.Quaternion) =>
      out.setFromAxisAngle(yAxis, Math.sin(spinRef.current) * 0.9).multiply(HERO_QUAT);
    if (a < 0) heroQuat(quatA);
    else quatA.copy(REGION_QUATS[a]);
    if (b >= N) heroQuat(quatB);
    else quatB.copy(REGION_QUATS[b]);
    orient.quaternion.copy(quatA).slerp(quatB, t);

    // ── 4. Region highlight, blended between the two states ───────────────
    const hovered = atHero ? hoveredRef.current : -1;
    const hs = hoverRef.current;
    const visFor = (k: number, out: RegionState[]) => {
      for (let i = 0; i < out.length; i++) {
        const o = out[i];
        if (k < 0 || k >= N) {
          o.opacity = 1;
          o.emissive = 0.08;
          o.lift = 0;
        } else if (i === k) {
          o.opacity = 1;
          o.emissive = 0.55;
          o.lift = 0.12;
        } else {
          o.opacity = 0.14;
          o.emissive = 0;
          o.lift = 0;
        }
      }
    };
    visFor(a, visA);
    visFor(b, visB);
    for (let i = 0; i < regions.length; i++) {
      // Hover lift/glow in the hero is the only time-based animation left
      const target = i === hovered ? 1 : 0;
      hs[i] += (target - hs[i]) * (reducedMotion ? 1 : damp(8, dt));
      if (Math.abs(target - hs[i]) > 1e-3) moving = true;

      const opacity = THREE.MathUtils.lerp(visA[i].opacity, visB[i].opacity, t);
      const emissive = THREE.MathUtils.lerp(visA[i].emissive, visB[i].emissive, t) + hs[i] * 0.5;
      const lift = THREE.MathUtils.lerp(visA[i].lift, visB[i].lift, t) + hs[i] * 0.1;

      const m = materials[i];
      m.opacity = opacity;
      m.emissiveIntensity = emissive;
      m.depthWrite = opacity > 0.9; // ghosts must not hide what's behind them
      const cm = cutMaterials[i];
      // Inner walls stay subtler than the surface inside the ghost
      cm.opacity = opacity > 0.9 ? opacity : opacity * 0.7;
      cm.depthWrite = m.depthWrite;
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.copy(regions[i].home).addScaledVector(liftDirs[i], lift);
        mesh.renderOrder = opacity > 0.9 ? 0 : 1;
      }
    }

    // ── 5. Label on the region in focus, fading out mid-way between cards ─
    const label = labelRef.current;
    if (label) {
      const focus = atHero ? hovered : dominant < N && dominant >= 0 ? dominant : -1;
      const alpha = atHero ? (hovered >= 0 ? hs[hovered] : 0) : focus >= 0 ? Math.min(1, Math.abs(1 - 2 * t) * 1.6) : 0;
      if (focus !== labelRegionRef.current && focus >= 0) {
        const section = SECTIONS_DATA[focus];
        const name = label.querySelector('[data-label-name]');
        const sub = label.querySelector('[data-label-section]');
        if (name) name.textContent = BRAIN_REGIONS[section.region].name;
        if (sub) sub.textContent = section.title;
        label.style.setProperty('--accent', section.accentColor);
      }
      labelRegionRef.current = focus;
      label.style.opacity = alpha.toFixed(3);
      const mesh = focus >= 0 ? meshRefs.current[focus] : null;
      if (mesh) {
        mesh.getWorldPosition(tmpVec).project(camera);
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
    if (activeRef.current >= 0 && activeRef.current < FOOTER) return;
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
    <group ref={placementRef}>
      <group ref={orientRef}>
        {regions.map((r, i) => (
          <mesh
            key={r.id}
            ref={(m) => {
              meshRefs.current[i] = m;
            }}
            geometry={r.geometry}
            material={materials[i]}
            position={r.home}
            // Touch devices: tap only. Hover handlers would make R3F hit-test the
            // whole mesh on every pointer move, including scroll gestures.
            onPointerOver={DEVICE.isMobile ? undefined : onOver(i)}
            onPointerOut={DEVICE.isMobile ? undefined : onOut(i)}
            onClick={onClick(i)}
          >
            {r.capGeometry && <mesh geometry={r.capGeometry} material={cutMaterials[i]} />}
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Region label rendered in the DOM and positioned by the scene every frame. */
const RegionLabel = ({ labelRef }: BrainProps) => (
  <div
    ref={labelRef}
    aria-hidden="true"
    className="fixed left-0 top-0 z-[1] pointer-events-none will-change-[transform,opacity]"
    style={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
      <div className="region-label text-accent-readable rounded-xl px-3 py-1.5 text-center">
        <p data-label-name className="font-mono text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em]" />
        <p data-label-section className="text-[11px] md:text-[13px] text-text-body" />
      </div>
      <span className="w-px h-5 md:h-16" style={{ background: 'var(--accent)' }} />
      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
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
