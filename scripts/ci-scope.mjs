import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Unknown paths intentionally select every job, so new workspace areas are safe.
export function selectScope(paths) {
  const scope = { code: false, web: false, storybook: false };
  for (const path of paths) {
    if (path.startsWith('docs/governance/component-contract-samples/')) {
      scope.code = scope.web = scope.storybook = true;
    } else if (/^(docs\/|README\.md$|AGENTS\.md$|LICENSE$)/.test(path)) {
      continue;
    } else if (path.startsWith('apps/web/')) {
      scope.web = true;
    } else if (path.startsWith('apps/storybook/')) {
      scope.storybook = true;
    } else {
      scope.code = scope.web = scope.storybook = true;
    }
  }
  return scope;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const paths = execFileSync(
    'git',
    ['diff', '--name-only', '-z', process.argv[2], 'HEAD'],
    {
      encoding: 'utf8',
    },
  )
    .split('\0')
    .filter(Boolean);
  const scope = selectScope(paths);
  for (const [name, selected] of Object.entries(scope)) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${selected}\n`);
  }
}
