#!/usr/bin/env node
/**
 * Builds the web-ready brain models from the anatomical source model.
 *
 *   bun run build:brain
 *
 * Input:  assets-src/models/brain1.glb — five lobe meshes:
 *         frontal, pariet, occipit, temp, corpus
 * Output: public/models/brain.glb      — high detail (desktop / capable phones)
 *         public/models/brain-low.glb  — low detail (low-tier devices)
 *
 * Each output holds 8 meshes, one per functional region, matching
 * src/data/brain-regions.ts:
 *
 *   prefrontal  frontal lobe minus the motor strip and Broca's area
 *   motor       strip of the frontal lobe bordering the parietal lobe (precentral gyrus)
 *   broca       inferior frontal gyrus, left hemisphere, above the lateral sulcus
 *   parietal    parietal lobe
 *   occipital   occipital lobe
 *   temporal    temporal lobe minus Wernicke's area (hippocampus / memory)
 *   wernicke    posterior superior temporal gyrus, left hemisphere
 *   corpus      corpus callosum
 *
 * The source lobes are open surfaces (the medial walls and the lines where we
 * carve one lobe into several regions are holes). Every hole is closed with a
 * "cut surface" stored as a sibling node `<region>-cut`, so each region reads
 * as a solid piece of tissue, including where it lifts out of the brain.
 *
 * Coordinate frame of the output: centred at the origin, longest axis = 2 units,
 * +X = front (nose), +Y = up, -Z = left hemisphere.
 */
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, prune, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'assets-src/models/brain1.glb');
const OUTPUTS = [
  { file: path.join(ROOT, 'public/models/brain.glb'), ratio: 0.6 },
  { file: path.join(ROOT, 'public/models/brain-low.glb'), ratio: 0.25 },
];

/** Region carving thresholds, in normalised units (brain length = 2). */
const T = {
  motorBand: 0.2, // frontal triangles closer than this to the parietal lobe → motor strip
  brocaLateralZ: -0.25, // left hemisphere, lateral surface
  brocaNearTemporal: 0.28, // sits just above the lateral sulcus
  brocaMaxX: 0.75, // not the frontal pole
  wernickeLateralZ: -0.3,
  wernickeMaxX: 0.15, // posterior part of the temporal lobe
  wernickeNearParietal: 0.32, // superior edge, bordering the parietal lobe
};

await Promise.all([MeshoptSimplifier.ready, MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

// ── 1. Read lobes into world space ──────────────────────────────────────────
const src = await io.read(SRC);
const lobes = {};
for (const node of src.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const W = node.getWorldMatrix();
  const prim = mesh.listPrimitives()[0];
  const pos = prim.getAttribute('POSITION');
  const v = [0, 0, 0];
  const P = new Float32Array(pos.getCount() * 3);
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, v);
    const [x, y, z] = v;
    P[i * 3] = W[0] * x + W[4] * y + W[8] * z + W[12];
    P[i * 3 + 1] = W[1] * x + W[5] * y + W[9] * z + W[13];
    P[i * 3 + 2] = W[2] * x + W[6] * y + W[10] * z + W[14];
  }
  const I = prim.getIndices() ? Array.from(prim.getIndices().getArray()) : [...Array(pos.getCount()).keys()];
  lobes[node.getName()] = { P, I };
}
for (const name of ['frontal', 'pariet', 'occipit', 'temp', 'corpus']) {
  if (!lobes[name]) throw new Error(`Source model is missing the "${name}" lobe`);
}

// ── 2. Normalise: centre the bounding box, longest axis = 2 ─────────────────
const mn = [Infinity, Infinity, Infinity];
const mx = [-Infinity, -Infinity, -Infinity];
for (const { P } of Object.values(lobes))
  for (let i = 0; i < P.length; i += 3)
    for (let k = 0; k < 3; k++) {
      mn[k] = Math.min(mn[k], P[i + k]);
      mx[k] = Math.max(mx[k], P[i + k]);
    }
const centre = mn.map((a, k) => (a + mx[k]) / 2);
const scale = 2 / Math.max(...mx.map((a, k) => a - mn[k]));
for (const { P } of Object.values(lobes))
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) P[i + k] = (P[i + k] - centre[k]) * scale;

// ── 3. Classify every triangle into a functional region ─────────────────────
const triCentre = (L, t) => {
  const a = L.I[t * 3] * 3, b = L.I[t * 3 + 1] * 3, c = L.I[t * 3 + 2] * 3;
  return [0, 1, 2].map((k) => (L.P[a + k] + L.P[b + k] + L.P[c + k]) / 3);
};
const nearest = ([x, y, z], P) => {
  let best = Infinity;
  for (let i = 0; i < P.length; i += 6) {
    const dx = P[i] - x, dy = P[i + 1] - y, dz = P[i + 2] - z;
    best = Math.min(best, dx * dx + dy * dy + dz * dz);
  }
  return Math.sqrt(best);
};

const regions = { prefrontal: [], motor: [], broca: [], parietal: [], occipital: [], temporal: [], wernicke: [], corpus: [] };
for (const [name, L] of Object.entries(lobes)) {
  for (let t = 0; t < L.I.length / 3; t++) {
    const c = triCentre(L, t);
    let region;
    if (name === 'frontal') {
      const dPar = nearest(c, lobes.pariet.P);
      if (c[2] < T.brocaLateralZ && c[0] < T.brocaMaxX && dPar > T.motorBand && nearest(c, lobes.temp.P) < T.brocaNearTemporal) region = 'broca';
      else if (dPar < T.motorBand) region = 'motor';
      else region = 'prefrontal';
    } else if (name === 'temp') {
      region = c[2] < T.wernickeLateralZ && c[0] < T.wernickeMaxX && nearest(c, lobes.pariet.P) < T.wernickeNearParietal ? 'wernicke' : 'temporal';
    } else {
      region = { pariet: 'parietal', occipit: 'occipital', corpus: 'corpus' }[name];
    }
    regions[region].push([L, t]);
  }
}

// ── 4. Build one mesh per region ────────────────────────────────────────────
const buildDocument = () => {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const material = doc.createMaterial('cortex').setRoughnessFactor(0.5).setMetallicFactor(0);
  const root = doc.createNode('Brain');
  doc.createScene('Brain').addChild(root);
  for (const [region, tris] of Object.entries(regions)) {
    const remap = new Map();
    const pos = [];
    const ind = [];
    for (const [L, t] of tris)
      for (let j = 0; j < 3; j++) {
        const vi = L.I[t * 3 + j];
        const key = `${Object.keys(lobes).find((k) => lobes[k] === L)}:${vi}`;
        let ni = remap.get(key);
        if (ni === undefined) {
          ni = pos.length / 3;
          remap.set(key, ni);
          pos.push(L.P[vi * 3], L.P[vi * 3 + 1], L.P[vi * 3 + 2]);
        }
        ind.push(ni);
      }
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ind)).setBuffer(buffer))
      .setMaterial(material);
    root.addChild(doc.createNode(region).setMesh(doc.createMesh(region).addPrimitive(prim)));
  }
  return doc;
};

/** Smooth, area-weighted vertex normals (keeps the indexed geometry intact). */
const smoothNormals = (doc) => {
  const buffer = doc.getRoot().listBuffers()[0];
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const P = prim.getAttribute('POSITION').getArray();
      const I = prim.getIndices().getArray();
      const N = new Float32Array(P.length);
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
        const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        for (const i of [a, b, c]) {
          N[i] += nx;
          N[i + 1] += ny;
          N[i + 2] += nz;
        }
      }
      for (let i = 0; i < N.length; i += 3) {
        const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1;
        N[i] /= l;
        N[i + 1] /= l;
        N[i + 2] /= l;
      }
      prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buffer));
    }
};

/**
 * Closes every boundary loop of each region with a fan-triangulated cap,
 * written as a separate `<region>-cut` node using the `cut` material.
 * Runs after simplification (borders are locked, so caps match exactly).
 */
const capHoles = (doc) => {
  const buffer = doc.getRoot().listBuffers()[0];
  const cutMaterial = doc.createMaterial('cut').setRoughnessFactor(0.8).setMetallicFactor(0).setDoubleSided(true);
  const root = doc.getRoot().listScenes()[0].listChildren()[0];
  for (const node of [...root.listChildren()]) {
    const prim = node.getMesh().listPrimitives()[0];
    const P = prim.getAttribute('POSITION').getArray();
    const I = prim.getIndices().getArray();

    // Directed edges; a boundary edge a→b has no twin b→a
    const directed = new Set();
    for (let t = 0; t < I.length; t += 3)
      for (const [a, b] of [[I[t], I[t + 1]], [I[t + 1], I[t + 2]], [I[t + 2], I[t]]]) directed.add(`${a},${b}`);
    const next = new Map(); // a → [b, ...] along boundary edges
    for (const key of directed) {
      const [a, b] = key.split(',').map(Number);
      if (!directed.has(`${b},${a}`)) {
        if (!next.has(a)) next.set(a, []);
        next.get(a).push(b);
      }
    }

    // Walk boundary loops
    const loops = [];
    for (const start of next.keys()) {
      while (next.get(start)?.length) {
        const loop = [start];
        let cur = next.get(start).pop();
        while (cur !== start && cur !== undefined && loop.length < 100000) {
          loop.push(cur);
          const outs = next.get(cur);
          cur = outs?.length ? outs.pop() : undefined;
        }
        if (cur === start && loop.length >= 3) loops.push(loop);
      }
    }
    if (!loops.length) continue;

    // Fan-triangulate each loop around its centroid (reverse winding → faces outward)
    const pos = [];
    const ind = [];
    for (const loop of loops) {
      const base = pos.length / 3;
      const c = [0, 0, 0];
      for (const v of loop) for (let k = 0; k < 3; k++) c[k] += P[v * 3 + k] / loop.length;
      for (const v of loop) pos.push(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
      pos.push(c[0], c[1], c[2]);
      const centre = base + loop.length;
      for (let i = 0; i < loop.length; i++) ind.push(base + ((i + 1) % loop.length), base + i, centre);
    }
    const capPrim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(ind)).setBuffer(buffer))
      .setMaterial(cutMaterial);
    const name = `${node.getName()}-cut`;
    root.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(capPrim)));
  }
};

// ── 5. Simplify, cap, quantise, compress, write ─────────────────────────────
for (const { file, ratio } of OUTPUTS) {
  const doc = buildDocument();
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.002, lockBorder: true }),
    capHoles,
    smoothNormals,
    prune(),
    dedup(),
    quantize({ quantizePosition: 14, quantizeNormal: 10 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await io.write(file, doc);
  const tris = doc
    .getRoot()
    .listMeshes()
    .map((m) => `${m.getName()}:${m.listPrimitives()[0].getIndices().getCount() / 3}`);
  console.log(path.relative(ROOT, file), tris.join(' '));
}
