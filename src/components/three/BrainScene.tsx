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

  const state = useRef<RegionState[]>(SECTIONS_DATA.map(() => ({ opacity: 1, emissive: 0.08, lift: 0 })));

  // Section cards, in section order (the brain follows the one in view)
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastActiveRef = useRef(HERO);
  const switchTimeRef = useRef(0);
  useEffect(() => {
    cardsRef.current = SECTIONS_DATA.map((sd) =>
      document.querySelector<HTMLElement>(`#${sd.id} [data-section-card]`),
    ).filter((el): el is HTMLElement => el !== null);
    invalidate();
  }, [invalidate]);

  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const spinQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((_, rawDelta) => {
    const placement = placementRef.current;
    const orient = orientRef.current;
    if (!placement || !orient) return;
    const dt = Math.min(rawDelta, 0.1);
    let moving = false;

    // ── Which section is in view? The card closest to the screen's middle ──
    const vh = size.height;
    const cards = cardsRef.current;
    let active = HERO;
    let cardRect: DOMRect | null = null;
    if (cards.length) {
      const first = cards[0].getBoundingClientRect();
      const last = cards[cards.length - 1].getBoundingClientRect();
      if (first.top + first.height / 2 > vh * 0.92) active = HERO;
      else if (last.top + last.height / 2 < vh * 0.08) active = FOOTER;
      else {
        let best = Infinity;
        for (let i = 0; i < cards.length; i++) {
          const r = cards[i].getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - vh / 2);
          if (d < best) {
            best = d;
            active = i;
            cardRect = r;
          }
        }
      }
    }
    if (active !== lastActiveRef.current) {
      lastActiveRef.current = active;
      switchTimeRef.current = 0;
    }
    switchTimeRef.current += dt;
    activeRef.current = active;
    const inSection = active >= 0 && active < FOOTER;

    // ── Placement: centre in hero, beside the card in sections ─────────────
    const portrait = viewport.width < viewport.height * 0.9;
    let tx = 0;
    let ty = 0;
    let tScale = portrait ? Math.min(1.0, viewport.width / 2.3) : Math.min(1.45, viewport.width * 0.17);
    const toWorldY = (screenY: number) => (0.5 - screenY / vh) * viewport.height;
    if (inSection && cardRect) {
      const cardOnLeft = SECTIONS_DATA[active].direction === 'left';
      if (portrait) {
        // Ride in the free space above the card and scroll together with it
        tScale = Math.min(0.62, viewport.width / 3.8);
        const brainPx = 1.45 * tScale * (vh / viewport.height);
        // ...but never so high that the region label slides under the navbar
        // (a tall card may then cover the bottom of the brain a little)
        const minY = 80 + 64 + brainPx * 0.25;
        const screenY = Math.max(minY, cardRect.top - brainPx / 2 - 14);
        ty = toWorldY(Math.min(vh * 1.3, screenY));
      } else {
        // Beside the card, level with its centre (kept within the middle band)
        tx = (cardOnLeft ? 1 : -1) * viewport.width * 0.23;
        tScale = Math.min(1.2, viewport.width * 0.135);
        const centre = cardRect.top + cardRect.height / 2;
        ty = toWorldY(Math.min(vh * 0.68, Math.max(vh * 0.32, centre)));
      }
    } else if (active === FOOTER) {
      ty = viewport.height * (portrait ? 0.27 : 0.24);
      tScale *= 0.6;
    }
    // Follow the card tightly; glide more softly right after switching section
    const following = inSection && switchTimeRef.current > 0.7;
    const k = reducedMotion ? 1 : damp(4.5, dt);
    const ky = reducedMotion ? 1 : damp(following ? 14 : 4.5, dt);
    placement.position.x += (tx - placement.position.x) * k;
    placement.position.y += (ty - placement.position.y) * ky;
    const sc = placement.scale.x + (tScale - placement.scale.x) * k;
    placement.scale.setScalar(sc);
    if (Math.abs(tx - placement.position.x) + Math.abs(ty - placement.position.y) + Math.abs(tScale - sc) > 1e-3)
      moving = true;

    // ── Orientation: idle spin outside sections, face the region inside ────
    if (inSection) {
      tmpQuat.copy(REGION_QUATS[active]);
    } else {
      if (!reducedMotion) {
        spinRef.current += dt * 0.25;
        moving = true;
      }
      spinQuat.setFromAxisAngle(yAxis, Math.sin(spinRef.current) * 0.9);
      tmpQuat.copy(spinQuat).multiply(HERO_QUAT);
    }
    if (reducedMotion) orient.quaternion.copy(tmpQuat);
    else orient.quaternion.slerp(tmpQuat, damp(3.5, dt));
    if (orient.quaternion.angleTo(tmpQuat) > 1e-3) moving = true;

    // ── Region highlight ───────────────────────────────────────────────────
    const hovered = hoveredRef.current;
    const mk = reducedMotion ? 1 : damp(7, dt);
    for (let i = 0; i < regions.length; i++) {
      const s = state.current[i];
      const isFocus = inSection ? i === active : i === hovered;
      const target: RegionState = inSection
        ? isFocus
          ? { opacity: 1, emissive: 0.55, lift: 0.12 }
          : { opacity: 0.14, emissive: 0, lift: 0 }
        : isFocus
          ? { opacity: 1, emissive: 0.6, lift: 0.1 }
          : { opacity: 1, emissive: 0.08, lift: 0 };
      s.opacity += (target.opacity - s.opacity) * mk;
      s.emissive += (target.emissive - s.emissive) * mk;
      s.lift += (target.lift - s.lift) * mk;
      if (
        Math.abs(target.opacity - s.opacity) + Math.abs(target.emissive - s.emissive) + Math.abs(target.lift - s.lift) >
        1e-3
      )
        moving = true;

      const m = materials[i];
      m.opacity = s.opacity;
      m.emissiveIntensity = s.emissive;
      m.depthWrite = s.opacity > 0.9; // ghosts must not hide what's behind them
      const cm = cutMaterials[i];
      // Inner walls stay subtler than the surface inside the ghost
      cm.opacity = s.opacity > 0.9 ? s.opacity : s.opacity * 0.7;
      cm.depthWrite = m.depthWrite;
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.copy(regions[i].home).addScaledVector(liftDirs[i], s.lift);
        mesh.renderOrder = s.opacity > 0.9 ? 0 : 1;
      }
    }

    // ── Label pinned to the focused region (DOM, no React re-render) ───────
    const label = labelRef.current;
    const focus = inSection ? active : hovered;
    if (label) {
      if (focus !== labelRegionRef.current) {
        labelRegionRef.current = focus;
        if (focus >= 0) {
          const section = SECTIONS_DATA[focus];
          const name = label.querySelector('[data-label-name]');
          const sub = label.querySelector('[data-label-section]');
          if (name) name.textContent = BRAIN_REGIONS[section.region].name;
          if (sub) sub.textContent = section.title;
          label.style.setProperty('--accent', section.accentColor);
        }
        label.style.opacity = focus >= 0 ? '1' : '0';
      }
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
    className="fixed left-0 top-0 z-[1] pointer-events-none transition-opacity duration-300 will-change-transform"
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
