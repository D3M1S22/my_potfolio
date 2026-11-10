import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SECTIONS_DATA } from '@/components/sections/sections-data';
import type { BrainRegionId } from '@/data/brain-regions';
import { DEVICE } from '@/lib/device';

/** Phones and low-tier devices get the ~21k-triangle model (170 kB), desktops ~45k (326 kB). */
export const BRAIN_MODEL_URL = `${import.meta.env.BASE_URL}models/${
  DEVICE.isLowTier || DEVICE.isMobile ? 'brain-low.glb' : 'brain.glb'
}`;

export interface BrainRegionGeometry {
  id: BrainRegionId;
  /** Geometry re-centred on the region's own centre (rotates/scales in place) */
  geometry: THREE.BufferGeometry;
  /** Where the region sits inside the assembled brain (brain space) */
  home: THREE.Vector3;
  /** Bounding-sphere radius of the region */
  radius: number;
}

/** Copies a (possibly quantised / interleaved) attribute into plain floats. */
const toFloat = (attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
  const out = new Float32Array(attr.count * attr.itemSize);
  for (let i = 0; i < attr.count; i++) {
    out[i * 3] = attr.getX(i);
    out[i * 3 + 1] = attr.getY(i);
    out[i * 3 + 2] = attr.getZ(i);
  }
  return new THREE.Float32BufferAttribute(out, attr.itemSize);
};

/**
 * Loads the segmented brain and returns one centred geometry per region,
 * in section order (index i ↔ SECTIONS_DATA[i]).
 */
export const useBrainRegions = (): BrainRegionGeometry[] => {
  const { scene } = useGLTF(BRAIN_MODEL_URL);

  return useMemo(() => {
    scene.updateMatrixWorld(true);
    return SECTIONS_DATA.map(({ region }) => {
      const mesh = scene.getObjectByName(region);
      if (!(mesh instanceof THREE.Mesh)) throw new Error(`Brain model has no "${region}" mesh`);

      // Bake the node transform (quantisation scale/offset) into float geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', toFloat(mesh.geometry.getAttribute('position')));
      geometry.setAttribute('normal', toFloat(mesh.geometry.getAttribute('normal')));
      geometry.setIndex(mesh.geometry.getIndex());
      geometry.applyMatrix4(mesh.matrixWorld);

      geometry.computeBoundingSphere();
      const sphere = geometry.boundingSphere ?? new THREE.Sphere();
      const home = sphere.center.clone();
      geometry.translate(-home.x, -home.y, -home.z);
      geometry.computeBoundingSphere();

      return { id: region, geometry, home, radius: geometry.boundingSphere?.radius ?? 0.1 };
    });
  }, [scene]);
};

useGLTF.preload(BRAIN_MODEL_URL);
