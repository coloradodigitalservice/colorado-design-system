#!/usr/bin/env node
// Scaffolds a new CoDS component directory that conforms to the canonical
// component contract (docs/governance/component-contract.md, CDS-27 /
// CODS-P1-004). See ../SKILL.md for usage.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(skillRoot, '../../..');
const componentsRoot = join(
  repoRoot,
  'packages/colorado-design-system/src/components',
);

function parseArgs(argv) {
  const args = {
    type: undefined,
    name: undefined,
    displayName: undefined,
    uswds: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--name') args.name = argv[++i];
    else if (arg === '--type') args.type = argv[++i];
    else if (arg === '--display-name') args.displayName = argv[++i];
    else if (arg === '--uswds') args.uswds = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printUsage() {
  console.log(
    [
      'Usage: node create-component.mjs --name <kebab-case-name> --type <static|interactive> [--display-name "Display Name"] [--uswds <uswds-component-id>]',
      '',
      'Scaffolds packages/colorado-design-system/src/components/<name>/ from the contract templates in ./assets.',
    ].join('\n'),
  );
}

function toDisplayName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toClassName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function applyPlaceholders(content, replacements) {
  let result = content;
  for (const [token, value] of Object.entries(replacements)) {
    result = result.split(token).join(value);
  }
  return result;
}

function copyTemplateDir(templateDir, targetDir, replacements) {
  for (const entry of readdirSync(templateDir)) {
    const templatePath = join(templateDir, entry);
    if (statSync(templatePath).isDirectory()) {
      const nestedTarget = join(
        targetDir,
        applyPlaceholders(entry, replacements),
      );
      mkdirSync(nestedTarget, { recursive: true });
      copyTemplateDir(templatePath, nestedTarget, replacements);
      continue;
    }

    if (!entry.endsWith('.template')) continue;
    const outputName = applyPlaceholders(
      entry.slice(0, -'.template'.length),
      replacements,
    );
    const outputPath = join(targetDir, outputName);
    const content = readFileSync(templatePath, 'utf8');
    writeFileSync(outputPath, applyPlaceholders(content, replacements));
    console.log(`created ${outputPath.slice(repoRoot.length + 1)}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }
  if (!args.name || !args.type) {
    printUsage();
    process.exitCode = 1;
    return;
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(args.name)) {
    console.error(
      `--name must be kebab-case (e.g. "site-alert"), got: ${args.name}`,
    );
    process.exitCode = 1;
    return;
  }
  if (args.type !== 'static' && args.type !== 'interactive') {
    console.error(
      `--type must be "static" or "interactive", got: ${args.type}`,
    );
    process.exitCode = 1;
    return;
  }

  const targetDir = join(componentsRoot, args.name);
  if (existsSync(targetDir)) {
    console.error(`${targetDir} already exists; choose a different --name.`);
    process.exitCode = 1;
    return;
  }

  const templateDir = join(skillRoot, 'assets', args.type);
  const replacements = {
    __NAME__: args.name,
    __DISPLAY_NAME__: args.displayName ?? toDisplayName(args.name),
    __CLASS_NAME__: toClassName(args.name),
    __USWDS__: args.uswds ? JSON.stringify(args.uswds) : 'null',
  };

  mkdirSync(targetDir, { recursive: true });
  copyTemplateDir(templateDir, targetDir, replacements);

  console.log('');
  console.log(`Scaffolded cods-${args.name} (${args.type}).`);
  console.log(
    'Next: fill in the TODOs, then satisfy every item in the contract checklist:',
  );
  console.log(
    '  docs/governance/component-contract.md#7-acceptance-criteria-checklist',
  );
}

main();
