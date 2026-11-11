import { posix } from 'node:path';
import {
  collectIconReferences,
  collectStandaloneReferences,
  createSubsetSprite,
  readIconLibrary,
} from './selection.mjs';

const spriteImport =
  '@coloradodigitalservice/colorado-design-system/icons/sprite.svg';
const virtualId = '\0cods:phosphor-sprite-url';
const marker = '__CODS_PHOSPHOR_SPRITE_URL__';
const devPath = '@cods-icons/sprite.svg';
const spriteReference =
  /(^|["'`(=\s])(?!(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\/)(?:[^&"'`(=\s<>]*\/)?icons\/sprite\.svg#/g;

export function codsIcons({ mode = 'subset', sourceDir } = {}) {
  if (mode !== 'subset' && mode !== 'full')
    throw new Error(`Unknown CoDS icon mode: ${mode}`);
  const library = readIconLibrary(sourceDir);
  const modules = new Map();
  const htmlPages = new Map();
  let config;
  let asset;

  function collect(contents, label) {
    return collectIconReferences(library, contents, label, {
      allowDynamic: mode === 'full',
    });
  }

  function replacement() {
    return config.command === 'serve'
      ? `${config.base === './' ? '/' : config.base}${devPath}`
      : marker;
  }

  function rewrite(contents) {
    return contents.replace(
      spriteReference,
      (_match, boundary) => `${boundary}${replacement()}#`,
    );
  }

  function outputUrl(context, outputFile) {
    if (!asset)
      throw new Error('CoDS icon sprite was referenced but not emitted');
    const file = context.getFileName(asset);
    const relative = posix.relative(posix.dirname(outputFile), file);
    const url =
      config.base === './' || config.base === ''
        ? relative.startsWith('.')
          ? relative
          : `./${relative}`
        : `${config.base}${file}`;
    if (!/^[a-z0-9/._~%:+-]+$/i.test(url))
      throw new Error(`Unsupported CoDS sprite output URL: ${url}`);
    return url;
  }

  return {
    name: 'cods-phosphor-icons',
    enforce: 'pre',
    configResolved(resolved) {
      config = resolved;
      if (
        config.base !== './' &&
        config.base !== '' &&
        !config.base.startsWith('/') &&
        !/^https?:\/\//.test(config.base)
      )
        throw new Error(
          `Unsupported Vite base for CoDS icon selection: ${config.base}`,
        );
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0];
        if (path !== `/${devPath}` && path !== `${config.base}${devPath}`)
          return next();
        response.setHeader('Content-Type', 'image/svg+xml');
        response.setHeader('Cache-Control', 'no-cache');
        response.end(library.sprite);
      });
    },
    resolveId(source) {
      if (source === spriteImport || source === `${spriteImport}?url`)
        return virtualId;
      if (source === `${spriteImport}?raw`)
        throw new Error(
          'Import the CoDS sprite as a URL, not ?raw, when using the icon selection plugin',
        );
    },
    load(id) {
      if (id !== virtualId) return;
      if (
        config.command !== 'serve' &&
        (config.base === './' || config.base === '')
      )
        return `export default new URL(/* @vite-ignore */ ${JSON.stringify(marker)}, import.meta.url).href;`;
      return `export default ${JSON.stringify(replacement())};`;
    },
    transform(contents, id) {
      if (id === virtualId) return;
      const ids = collect(contents, id);
      if (/\.(?:css|scss)(?:\?|$)/.test(id))
        collectStandaloneReferences(library, contents, id);
      const reference = contents.matchAll(spriteReference).next().value;
      const hasCanonicalUrl = Boolean(reference);
      if (reference) {
        const offset = reference.index + reference[1].length;
        const line = contents.slice(0, offset).split('\n').length;
        if (/\.(?:astro|[cm]?[jt]sx?|vue|svelte)(?:\?|$)/i.test(id))
          throw new Error(
            `${id}:${line}: canonical CoDS sprite URLs in application modules are not rewritten; import the sprite URL and use it in the rendered reference`,
          );
        if (/\.(?:css|scss|sass|less|styl)(?:\?|$)/i.test(id))
          throw new Error(
            `${id}:${line}: canonical CoDS sprite URLs in stylesheets are not rewritten; use a standalone CSS icon instead`,
          );
      }
      modules.set(id, { ids, hasCanonicalUrl });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        htmlPages.set(context.filename, {
          ids: collect(html, context.filename),
          hasCanonicalUrl: !html.matchAll(spriteReference).next().done,
        });
        return rewrite(html);
      },
    },
    renderStart() {
      const ids = new Set();
      let required = false;
      for (const id of this.getModuleIds()) {
        const html = htmlPages.get(id);
        if (html) {
          for (const icon of html.ids) ids.add(icon);
          required ||= html.hasCanonicalUrl;
        }
        if (id === virtualId) required = true;
        const entry = modules.get(id);
        if (!entry) continue;
        for (const icon of entry.ids) ids.add(icon);
        required ||= entry.hasCanonicalUrl;
      }
      if (required)
        asset = this.emitFile({
          type: 'asset',
          name: 'cods-sprite.svg',
          source:
            mode === 'full' ? library.sprite : createSubsetSprite(library, ids),
        });
      else asset = undefined;
    },
    renderChunk(code, chunk) {
      if (!code.includes(marker)) return;
      const url = outputUrl(this, chunk.fileName);
      chunk.viteMetadata ??= {
        importedAssets: new Set(),
        importedCss: new Set(),
      };
      chunk.viteMetadata.importedAssets.add(this.getFileName(asset));
      return code.replaceAll(marker, url);
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (
            output.type === 'asset' &&
            output.fileName.endsWith('.html') &&
            typeof output.source === 'string' &&
            output.source.includes(marker)
          )
            output.source = output.source.replaceAll(
              marker,
              outputUrl(this, output.fileName),
            );
        }
      },
    },
  };
}
