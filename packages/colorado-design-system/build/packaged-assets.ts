import {
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generate, parse, walk } from 'css-tree';
import type { Plugin } from 'vite';
import iconVariants from './uswds-icon-variants.json' with { type: 'json' };
import approvedIcons from '../src/icons/approved-icons.json' with { type: 'json' };

const packagedIconIds = new Set([
  ...approvedIcons.icons,
  ...Object.values(iconVariants).map(({ id, color }) => `${id}--${color}`),
]);

const excludedDirectory =
  /(?:^|[/\\])(?:favicons|material-icons(?:-deprecated)?|usa-icons(?:-bg)?|uswds-icons)(?:[/\\]|$)/;
const excludedRootIcons = new Set([
  'checkbox-indeterminate-alt.svg',
  'checkbox-indeterminate.svg',
  'correct8-alt.svg',
  'correct8.svg',
  'file-excel.svg',
  'file-pdf.svg',
  'file-video.svg',
  'file-word.svg',
  'file.svg',
  'icon-dot-gov.svg',
  'icon-https.svg',
  'loader.gif',
  'loader.svg',
  'lock.svg',
  'sprite.svg',
]);
const phosphorReplacements = new Map([
  ...Object.entries(iconVariants).map(
    ([source, { id, color }]): [string, string] => [source, `${id}--${color}`],
  ),
  ['loader.svg', 'arrows-clockwise'],
  ['usa-icons/add.svg', 'plus'],
  ['usa-icons/arrow_back.svg', 'arrow-left'],
  ['usa-icons/calendar_today.svg', 'calendar-dots'],
  ['usa-icons/check_circle.svg', 'check-circle'],
  ['usa-icons/close.svg', 'x'],
  ['usa-icons/error.svg', 'warning-circle'],
  ['usa-icons/expand_less.svg', 'caret-up'],
  ['usa-icons/expand_more.svg', 'caret-down'],
  ['usa-icons/info.svg', 'info'],
  ['usa-icons/launch.svg', 'arrow-square-out'],
  ['usa-icons/navigate_before.svg', 'caret-left'],
  ['usa-icons/navigate_far_before.svg', 'arrow-circle-left'],
  ['usa-icons/navigate_far_next.svg', 'caret-double-right'],
  ['usa-icons/navigate_next.svg', 'caret-right'],
  ['usa-icons/remove.svg', 'minus'],
  ['usa-icons/search.svg', 'magnifying-glass'],
  ['usa-icons/unfold_more.svg', 'arrows-vertical'],
  ['usa-icons/warning.svg', 'warning'],
]);
const excludedAsset = (path: string) => {
  const normalized = path.replaceAll('\\', '/');
  return (
    excludedDirectory.test(normalized) ||
    (!normalized.includes('/') && excludedRootIcons.has(normalized))
  );
};
const isFile = (file: string) =>
  statSync(file, { throwIfNoEntry: false })?.isFile() === true;

export function replaceUswdsIconUrls(css: string): string {
  const ast = parse(css, { parseCustomProperty: true });
  walk(ast, {
    visit: 'Url',
    enter(node) {
      const match = /^\.\/img\/(.+?)([?#].*)?$/.exec(node.value);
      if (!match) return;
      const [, assetPath, suffix = ''] = match;
      const phosphorId = phosphorReplacements.get(assetPath!);
      if (!phosphorId) {
        if (excludedAsset(assetPath!))
          throw new Error(
            `No Phosphor replacement configured for USWDS icon: ${assetPath}`,
          );
        return;
      }
      node.value = `./icons/${phosphorId}.svg${suffix}`;
    },
  });
  return generate(ast);
}

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
    if (
      local.startsWith(`..${sep}`) ||
      local === '..' ||
      (excludedAsset(local) &&
        !(match[1] === 'img' && phosphorReplacements.has(local)))
    )
      return;
    return file;
  }
  return {
    isExternal(id) {
      // Component masks reference the same generated files as the public icon
      // pipeline. They are written by the icon plugin before CSS validation.
      const icon = /^\.\/icons\/([a-z\d-]+)\.svg(?:[?#].*)?$/.exec(id);
      if (icon) return packagedIconIds.has(icon[1]!);
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
            if (!excludedAsset(relative(root, file))) this.addWatchFile(file);
          }
        }
      },
      async writeBundle(options, bundle) {
        const outputDirectory = resolve(options.dir!);
        for (const [name, directory] of Object.entries(sources)) {
          const destination = resolve(outputDirectory, name);
          // A deleted source must not survive as stale watch output.
          await rm(destination, { recursive: true, force: true });
          await cp(directory, destination, {
            recursive: true,
            filter: (file) => !excludedAsset(relative(directory, file)),
          });
        }
        for (const name of Object.keys(bundle)) {
          if (!name.endsWith('.css')) continue;
          const stylesheet = resolve(outputDirectory, name);
          const css = readFileSync(stylesheet, 'utf8');
          writeFileSync(stylesheet, replaceUswdsIconUrls(css));
          validateCssAssets(stylesheet);
        }
      },
    },
  };
}
