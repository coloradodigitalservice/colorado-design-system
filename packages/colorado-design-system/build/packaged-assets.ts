import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, walk } from 'css-tree';
import type { Plugin } from 'vite';

const excluded = /(?:^|[/\\])(material-icons|favicons)(?:[/\\]|$)/;
const isFile = (file: string) =>
  statSync(file, { throwIfNoEntry: false })?.isFile() === true;

export function cssAssetReferences(css: string, stylesheet: string): string[] {
  const references = new Set<string>();
  walk(parse(css, { parseCustomProperty: true }), {
    visit: 'Url',
    enter({ value }) {
      if (!value || /^(?:#|https?:|data:|\/\/)/i.test(value)) return;
      if (/^(?:\/|[a-z][a-z\d+.-]*:)|\\/i.test(value))
        throw new Error(`${stylesheet}: asset URL must be relative: ${value}`);
      const target = fileURLToPath(new URL(value, pathToFileURL(stylesheet)));
      const file = relative(resolve(stylesheet, '..'), target);
      if (file === '..' || file.startsWith(`..${sep}`))
        throw new Error(
          `${stylesheet}: asset URL escapes package output: ${value}`,
        );
      references.add(file);
    },
  });
  return [...references].sort();
}

export function validateCssAssets(stylesheet: string): void {
  for (const file of cssAssetReferences(
    readFileSync(stylesheet, 'utf8'),
    stylesheet,
  )) {
    if (!isFile(resolve(stylesheet, '..', file)))
      throw new Error(`${stylesheet}: missing packaged asset: ${file}`);
  }
}

// Preserve the existing copy layout; externalize only files we actually ship.
type AssetDirectory = 'fonts' | 'img';

export function copiedAssets(
  sources: Partial<Record<AssetDirectory, string>>,
): {
  plugin: Plugin;
  isExternal: (id: string) => boolean;
} {
  function sourceFile(id: string): string | undefined {
    const match = /^\.\/(fonts|img)\/(.+?)(?:[?#].*)?$/.exec(id);
    if (!match) return;
    const root = sources[match[1] as AssetDirectory];
    if (!root) return;
    const file = resolve(root, decodeURIComponent(match[2]!));
    const local = relative(root, file);
    if (local.startsWith(`..${sep}`) || local === '..' || excluded.test(local))
      return;
    return file;
  }
  return {
    isExternal(id) {
      const file = sourceFile(id);
      return file !== undefined && isFile(file);
    },
    plugin: {
      name: 'copy-packaged-assets',
      apply: 'build',
      buildStart() {
        for (const directory of Object.values(sources)) {
          // Resolve workspace symlinks so native watch events match these paths.
          const root = realpathSync(directory);
          this.addWatchFile(root);
          for (const entry of readdirSync(root, {
            recursive: true,
            withFileTypes: true,
          })) {
            const file = resolve(entry.parentPath, entry.name);
            if (!excluded.test(relative(root, file))) this.addWatchFile(file);
          }
        }
      },
      async writeBundle(options, bundle) {
        for (const [name, directory] of Object.entries(sources)) {
          const destination = resolve(options.dir!, name);
          // A deleted source must not survive as stale watch output.
          await rm(destination, { recursive: true, force: true });
          await cp(directory, destination, {
            recursive: true,
            filter: (file) => !excluded.test(relative(directory, file)),
          });
        }
        for (const file of Object.keys(bundle)) {
          if (file.endsWith('.css'))
            validateCssAssets(resolve(options.dir!, file));
        }
      },
    },
  };
}
