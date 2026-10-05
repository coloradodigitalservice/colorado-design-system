# Shared development configuration

`typescript/tsconfig.base.json` defines the strict TypeScript baseline for repository tooling and future workspaces. ESLint, Stylelint, Prettier, and Vitest use root configuration files so their command-line tools discover them without extra flags. Sass compiles the core package's stylesheet entry; package build configuration lives in each package's `vite.config.ts` and is described in [BUILD.md](../docs/BUILD.md). This directory is not a publishable workspace.
