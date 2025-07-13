// ---------------------------------------------------------------------------
// Basic scenario list (expand freely later)
// ---------------------------------------------------------------------------
export const SCENARIOS = {
  enchanted_forest: "Enchanted Forest",
  deep_ocean: "Deep Ocean",
  cosmic_nebula: "Cosmic Nebula",
  none: "None",
} as const

class FlowModel {
  static generateDataset(type: string, numSamples: number, seed: number, noise: number) {
    // Placeholder implementation
    return { type, numSamples, seed, noise, data: [] }
  }

  static applyScenarioBlending(dataset: any, scenario: keyof typeof SCENARIOS) {
    // Placeholder implementation
    return { ...dataset, scenario }
  }
}

// ---------------------------------------------------------------------------
// Back-compat helper - replicates the previously-exported generateDataset()
// ---------------------------------------------------------------------------
export function generateDataset(
  type: string,
  seed: number,
  numSamples: number,
  noise: number,
  scenario: keyof typeof SCENARIOS = "none",
) {
  // Use the FlowModel you already defined
  const base = FlowModel.generateDataset(type, numSamples, seed, noise)
  return scenario === "none" ? base : FlowModel.applyScenarioBlending(base, scenario)
}
