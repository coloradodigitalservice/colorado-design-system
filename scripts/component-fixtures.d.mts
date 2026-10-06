export interface ComponentMetadata {
  name: string;
  displayName: string;
  maturity: string;
  type: string;
  uswdsEquivalent: string | null;
  uswdsVersion: string | null;
  componentType: string;
  divergenceApproved: boolean;
  divergenceNotes: string | null;
  owners: { responsible: string; accountable: string };
  states: string[];
  progressiveEnhancement: string;
  localization: string;
  description: string;
  examples: {
    state: string;
    fixtureState: string;
    setup: string;
    instructions?: string;
  }[];
}
export interface ExampleData {
  name: string;
  examples: {
    state: string;
    fixtureState: string;
    setup: string;
    html: string;
    code: string;
    status: string;
    instructions: string;
  }[];
}
export const packageRoot: string;
export function generateExamples(
  metadata: ComponentMetadata,
  fixture: string,
): ExampleData;
export function loadComponents(root?: string): {
  name: string;
  fixture: string;
  metadataText: string;
  metadata: ComponentMetadata;
  examples: ExampleData;
}[];
export function writeComponentAssets(root?: string): void;
export function checkComponentAssets(root?: string): void;
