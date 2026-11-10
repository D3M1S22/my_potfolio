/**
 * The eight functional regions the brain model is split into
 * (see scripts/brain/build-brain.mjs). Each one maps to a portfolio section
 * whose content mirrors what that part of the brain actually does.
 */
export type BrainRegionId =
  | 'prefrontal'
  | 'motor'
  | 'occipital'
  | 'temporal'
  | 'parietal'
  | 'broca'
  | 'wernicke'
  | 'corpus';

export interface BrainRegion {
  id: BrainRegionId;
  /** Anatomical name */
  name: string;
  /** What it does, in a few words */
  role: string;
}

export const BRAIN_REGIONS: Record<BrainRegionId, BrainRegion> = {
  prefrontal: {
    id: 'prefrontal',
    name: 'Prefrontal cortex',
    role: 'Personality, self-awareness and decision-making',
  },
  motor: {
    id: 'motor',
    name: 'Motor cortex',
    role: 'Turns intention into precise, practised action',
  },
  occipital: {
    id: 'occipital',
    name: 'Occipital lobe',
    role: 'The visual cortex — processes everything we see',
  },
  temporal: {
    id: 'temporal',
    name: 'Temporal lobe',
    role: 'Home of the hippocampus — forms long-term memories',
  },
  parietal: {
    id: 'parietal',
    name: 'Parietal lobe',
    role: 'Reasoning, numbers and spatial understanding',
  },
  broca: {
    id: 'broca',
    name: "Broca's area",
    role: 'Speech production — where thoughts become words',
  },
  wernicke: {
    id: 'wernicke',
    name: "Wernicke's area",
    role: 'Language comprehension — understanding what others say',
  },
  corpus: {
    id: 'corpus',
    name: 'Corpus callosum',
    role: 'About 200 million fibres connecting the two hemispheres',
  },
};
