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
// CODS_REPO_ROOT lets tests scaffold into a temporary tree.
const repoRoot = resolve(
  process.env.CODS_REPO_ROOT ?? join(skillRoot, '../../..'),
);
const designSystemRoot = join(repoRoot, 'packages/colorado-design-system');
const componentsRoot = join(designSystemRoot, 'src/components');
const storiesRoot = join(repoRoot, 'apps/storybook/src/stories');
const evidenceTemplatePath = join(
  repoRoot,
  'docs/governance/templates/accessibility-evidence-template.md',
);
const COMPONENT_TYPES = ['A', 'B', 'C'];

function parseArgs(argv) {
  const args = {
    type: undefined,
    name: undefined,
    displayName: undefined,
    uswds: null,
    componentType: undefined,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--name') args.name = argv[++i];
    else if (arg === '--type') args.type = argv[++i];
    else if (arg === '--display-name') args.displayName = argv[++i];
    else if (arg === '--uswds') args.uswds = argv[++i];
    else if (arg === '--component-type') args.componentType = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printUsage() {
  console.log(
    [
      'Usage: node create-component.mjs --name <kebab-case-name> --type <static|interactive> [--display-name "Display Name"] [--uswds <uswds-component-id>] [--component-type <A|B|C>]',
      '',
      'Scaffolds packages/colorado-design-system/src/components/<name>/ from the contract templates in ./assets,',
      'writes the Storybook story, and (interactive only) registers the controller in components/index.ts.',
      '',
      '--component-type follows docs/governance/component-ownership-matrix.md (A themed USWDS, B CoDS-authored,',
      'C divergent). It defaults to A when --uswds is given and B otherwise.',
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

function readUswdsVersion() {
  const manifest = JSON.parse(
    readFileSync(join(designSystemRoot, 'package.json'), 'utf8'),
  );
  const version = manifest.dependencies?.['@uswds/uswds'];
  if (!version)
    throw new Error('@uswds/uswds is not a design-system dependency');
  return version;
}

// The governance template is the single source for evidence checklists.
function writeEvidence(targetDir, name) {
  const template = readFileSync(evidenceTemplatePath, 'utf8');
  const content = template
    .replace('experimental | stable | deprecated', 'experimental')
    .replace(
      /^Copy this template into `[^`]+` for the component being reviewed\.\s*/m,
      '',
    )
    .split('<component-name>')
    .join(name);
  const evidenceDir = join(targetDir, 'accessibility');
  mkdirSync(evidenceDir, { recursive: true });
  const evidencePath = join(evidenceDir, `${name}.evidence.md`);
  writeFileSync(evidencePath, content);
  console.log(`created ${evidencePath.slice(repoRoot.length + 1)}`);
}

function writeStory(skillAssetsDir, type, storyPath, replacements) {
  const template = readFileSync(
    join(skillAssetsDir, 'story', `${type}.stories.ts.template`),
    'utf8',
  );
  mkdirSync(dirname(storyPath), { recursive: true });
  writeFileSync(storyPath, applyPlaceholders(template, replacements));
  console.log(`created ${storyPath.slice(repoRoot.length + 1)}`);
}

// Appends the controller export; the barrel is hand-maintained otherwise.
function registerExport(name, className) {
  const indexPath = join(componentsRoot, 'index.ts');
  if (!existsSync(indexPath)) {
    console.warn(`warning: ${indexPath} not found; register ${name} manually`);
    return;
  }
  const source = readFileSync(indexPath, 'utf8');
  const modulePath = `./${name}/${name}.js`;
  if (source.includes(modulePath)) return;
  const exportBlock = [
    'export {',
    `  init as init${className},`,
    `  initAll as initAll${className},`,
    `  destroy as destroy${className},`,
    `} from '${modulePath}';`,
    '',
  ].join('\n');
  const separator = source.endsWith('\n') ? '' : '\n';
  writeFileSync(indexPath, `${source}${separator}${exportBlock}`);
  console.log(`updated ${indexPath.slice(repoRoot.length + 1)}`);
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

  const componentType = args.componentType ?? (args.uswds ? 'A' : 'B');
  if (!COMPONENT_TYPES.includes(componentType)) {
    console.error(
      `--component-type must be one of ${COMPONENT_TYPES.join(', ')}, got: ${componentType}`,
    );
    process.exitCode = 1;
    return;
  }

  const displayName = args.displayName ?? toDisplayName(args.name);
  // A newline would end the `//` comments the templates put the name in.
  if ([...displayName].some((ch) => ch.charCodeAt(0) < 32 || ch === '\u007f')) {
    console.error('--display-name must not contain control characters.');
    process.exitCode = 1;
    return;
  }

  const targetDir = join(componentsRoot, args.name);
  const storyPath = join(storiesRoot, `${args.name}.stories.ts`);
  for (const existing of [targetDir, storyPath]) {
    if (existsSync(existing)) {
      console.error(`${existing} already exists; choose a different --name.`);
      process.exitCode = 1;
      return;
    }
  }

  const assetsDir = join(skillRoot, 'assets');
  const className = toClassName(args.name);
  const usesUswds = componentType !== 'B' || Boolean(args.uswds);
  const replacements = {
    __NAME__: args.name,
    __DISPLAY_NAME__: displayName,
    // Quoted JSON strings so apostrophes and quotes cannot break JSON or TypeScript.
    __DISPLAY_NAME_JSON__: JSON.stringify(displayName),
    __DESCRIPTION_JSON__: JSON.stringify(
      `TODO: one-sentence description of ${displayName}.`,
    ),
    __STORY_TITLE__: JSON.stringify(`Components/${displayName}`),
    __CLASS_NAME__: className,
    __USWDS__: args.uswds ? JSON.stringify(args.uswds) : 'null',
    __USWDS_VERSION__: usesUswds ? JSON.stringify(readUswdsVersion()) : 'null',
    __COMPONENT_TYPE__: componentType,
  };

  mkdirSync(targetDir, { recursive: true });
  copyTemplateDir(join(assetsDir, args.type), targetDir, replacements);
  writeEvidence(targetDir, args.name);
  writeStory(assetsDir, args.type, storyPath, replacements);
  if (args.type === 'interactive') registerExport(args.name, className);

  console.log('');
  console.log(
    `Scaffolded cods-${args.name} (${args.type}, component type ${componentType}).`,
  );
  console.log(
    'Next: fill in the TODOs, then satisfy every item in the contract checklist:',
  );
  console.log(
    '  docs/governance/component-contract.md#7-acceptance-criteria-checklist',
  );
  console.log(
    'Not automated: registering the Sass partial in the package stylesheet and the browser spec; see SKILL.md.',
  );
}

main();
