#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import {
  collectIconReferences,
  collectStandaloneReferences,
  createStandaloneSvg,
  createSubsetSprite,
  readIconLibrary,
} from './selection.mjs';

const usage = `Usage: cods-icons --input <file-or-directory> [--input <path> ...] --output <sprite.svg> [--css-output <directory>]
       cods-icons --input <file-or-directory> [--input <path> ...] --validate

Recognizes CoDS sprite references in source files and rejects unknown or
unresolved IDs. Use --full with --output for explicitly dynamic icon IDs.
Use --css-output to generate standalone SVGs referenced by CSS url()s.`;
const extensions = new Set([
  '.astro',
  '.cjs',
  '.css',
  '.hbs',
  '.htm',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.liquid',
  '.md',
  '.mdx',
  '.mjs',
  '.njk',
  '.scss',
  '.svelte',
  '.ts',
  '.tsx',
  '.vue',
]);
const excluded = new Set(['.git', '.astro', '.turbo', 'node_modules']);

function main(args) {
  if (args.includes('--help')) {
    console.log(usage);
    return;
  }
  const inputs = [];
  let output;
  let cssOutput;
  let validate = false;
  let full = false;
  for (let i = 0; i < args.length; i++) {
    const argument = args[i];
    if (
      argument === '--input' ||
      argument === '--output' ||
      argument === '--css-output'
    ) {
      const value = args[++i];
      if (!value || value.startsWith('--'))
        throw new Error(`${argument} requires a path\n${usage}`);
      if (argument === '--input') inputs.push(resolve(value));
      else if (argument === '--output') {
        if (output) throw new Error('--output may be specified only once');
        output = resolve(value);
      } else {
        if (cssOutput)
          throw new Error('--css-output may be specified only once');
        cssOutput = resolve(value);
      }
    } else if (argument === '--validate') validate = true;
    else if (argument === '--full') full = true;
    else throw new Error(`Unknown argument: ${argument}\n${usage}`);
  }
  if (!inputs.length || validate === Boolean(output))
    throw new Error(
      `Specify input and exactly one of --output or --validate\n${usage}`,
    );
  if (validate && cssOutput)
    throw new Error('--css-output cannot be combined with --validate');
  if (inputs.includes(output))
    throw new Error('The output sprite must not overwrite an input file');

  const library = readIconLibrary();
  const ids = new Set();
  const standalone = new Set();
  let files = 0;
  function visit(path, explicit = false) {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path, { withFileTypes: true }).sort(
        (a, b) => a.name.localeCompare(b.name),
      )) {
        if (entry.isSymbolicLink() || excluded.has(entry.name)) continue;
        visit(resolve(path, entry.name));
      }
    } else if (
      stat.isFile() &&
      path !== output &&
      (explicit || extensions.has(extname(path)))
    ) {
      files++;
      const contents = readFileSync(path, 'utf8');
      for (const id of collectIconReferences(library, contents, path, {
        allowDynamic: full,
      }))
        ids.add(id);
      for (const file of collectStandaloneReferences(library, contents, path))
        standalone.add(file);
    }
  }
  for (const input of inputs) visit(input, true);
  if (!files)
    throw new Error('No source files were found in the supplied inputs');
  if (cssOutput && standalone.size) {
    const notice = resolve(cssOutput, 'PHOSPHOR-LICENSE');
    if (existsSync(notice) && readFileSync(notice, 'utf8') !== library.license)
      throw new Error(
        `Refusing to overwrite a different license notice: ${notice}`,
      );
    for (const file of standalone)
      if (
        resolve(cssOutput, file) === output ||
        inputs.includes(resolve(cssOutput, file))
      )
        throw new Error(
          `Standalone CSS output would overwrite another input or output: ${file}`,
        );
  }
  if (output) {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(
      output,
      full ? library.sprite : createSubsetSprite(library, ids),
    );
  }
  if (cssOutput) {
    mkdirSync(cssOutput, { recursive: true });
    for (const file of standalone)
      writeFileSync(
        resolve(cssOutput, file),
        createStandaloneSvg(library, file.slice(0, -4)),
      );
    if (standalone.size)
      writeFileSync(resolve(cssOutput, 'PHOSPHOR-LICENSE'), library.license);
  } else if (output && standalone.size) {
    console.warn(
      `Found ${standalone.size} standalone CSS icon references; deploy those files separately or use --css-output.`,
    );
  }
  console.log(
    `${validate ? 'Validated' : 'Selected'} ${ids.size} Phosphor Regular sprite IDs and ${standalone.size} standalone CSS files from ${files} source files${full ? ' (full sprite mode)' : ''}.`,
  );
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
