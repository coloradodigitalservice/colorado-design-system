export interface IconLibrary {
  catalog: {
    source: { package: string; version: string; license: string };
    weight: 'regular';
    spriteSha256: string;
    icons: string[];
  };
  sprite: string;
  symbols: Map<string, string>;
  header: string;
  license: string;
}

export function readIconLibrary(directory?: string): IconLibrary;
export function collectIconReferences(
  library: IconLibrary,
  contents: string,
  label?: string,
  options?: { allowDynamic?: boolean },
): Set<string>;
export function createSubsetSprite(
  library: IconLibrary,
  ids: Iterable<string>,
): string;
export function createStandaloneSvg(library: IconLibrary, name: string): string;
export function collectStandaloneReferences(
  library: IconLibrary,
  contents: string,
  label?: string,
): Set<string>;
