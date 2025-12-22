/**
 * A/B Testing Infrastructure
 *
 * Lightweight A/B testing system for optimizing user flows
 */

import { trackEvent } from '@/lib/gtag';

// Experiment definitions
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for each variant (default: equal distribution)
  active: boolean;
}

// Registered experiments
const experiments: Record<string, Experiment> = {
  onboarding_flow: {
    id: 'onboarding_flow',
    name: 'Onboarding Flow Variant',
    variants: ['control', 'simplified', 'gamified'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  liveness_challenges: {
    id: 'liveness_challenges',
    name: 'Liveness Challenge Count',
    variants: ['two_challenges', 'three_challenges'],
    weights: [0.5, 0.5],
    active: true,
  },
  voice_intro_prompt: {
    id: 'voice_intro_prompt',
    name: 'Voice Intro Prompt Style',
    variants: ['questions', 'freeform', 'guided'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  cta_button_text: {
    id: 'cta_button_text',
    name: 'CTA Button Text',
    variants: ['start_verification', 'verify_me', 'lets_go'],
    active: true,
  },
};

// Get stored variant from localStorage or assign new one
function getOrAssignVariant(experimentId: string): string | null {
  const experiment = experiments[experimentId];

  if (!experiment || !experiment.active) {
    return null;
  }

  // Check localStorage for existing assignment
  if (typeof window !== 'undefined') {
    const storageKey = `ab_${experimentId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored && experiment.variants.includes(stored)) {
      return stored;
    }

    // Assign new variant based on weights
    const variant = selectVariant(experiment);
    localStorage.setItem(storageKey, variant);

    // Track experiment exposure
    trackExperimentExposure(experimentId, variant);

    return variant;
  }

  return experiment.variants[0]; // Default to first variant in SSR
}

// Select variant based on weights
function selectVariant(experiment: Experiment): string {
  const { variants, weights } = experiment;

  // Default to equal weights if not specified
  const effectiveWeights = weights || variants.map(() => 1 / variants.length);

  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < variants.length; i++) {
    cumulative += effectiveWeights[i];
    if (random < cumulative) {
      return variants[i];
    }
  }

  return variants[variants.length - 1];
}

// Track experiment exposure
function trackExperimentExposure(experimentId: string, variant: string): void {
  trackEvent('experiment_exposure', {
    experiment_id: experimentId,
    variant,
  });
}

// Track experiment conversion
export function trackExperimentConversion(
  experimentId: string,
  conversionType: string,
  value?: number
): void {
  const variant = getOrAssignVariant(experimentId);

  if (variant) {
    trackEvent('experiment_conversion', {
      experiment_id: experimentId,
      variant,
      conversion_type: conversionType,
      conversion_value: value,
    });
  }
}

// Hook for using experiments in components
export function useExperiment(experimentId: string): {
  variant: string | null;
  isVariant: (variantName: string) => boolean;
  trackConversion: (conversionType: string, value?: number) => void;
} {
  const variant = typeof window !== 'undefined' ? getOrAssignVariant(experimentId) : null;

  return {
    variant,
    isVariant: (variantName: string) => variant === variantName,
    trackConversion: (conversionType: string, value?: number) => {
      trackExperimentConversion(experimentId, conversionType, value);
    },
  };
}

// Get all active experiments for a user
export function getActiveExperiments(): Record<string, string> {
  const active: Record<string, string> = {};

  Object.keys(experiments).forEach((experimentId) => {
    const variant = getOrAssignVariant(experimentId);
    if (variant) {
      active[experimentId] = variant;
    }
  });

  return active;
}

// Force a specific variant (for testing/preview)
export function forceVariant(experimentId: string, variant: string): void {
  if (typeof window !== 'undefined') {
    const experiment = experiments[experimentId];
    if (experiment && experiment.variants.includes(variant)) {
      localStorage.setItem(`ab_${experimentId}`, variant);
    }
  }
}

// Reset all experiment assignments
export function resetExperiments(): void {
  if (typeof window !== 'undefined') {
    Object.keys(experiments).forEach((experimentId) => {
      localStorage.removeItem(`ab_${experimentId}`);
    });
  }
}

// Admin: Get experiment configuration
export function getExperimentConfig(experimentId: string): Experiment | null {
  return experiments[experimentId] || null;
}

// Admin: List all experiments
export function listExperiments(): Experiment[] {
  return Object.values(experiments);
}

export default {
  useExperiment,
  trackExperimentConversion,
  getActiveExperiments,
  forceVariant,
  resetExperiments,
};
