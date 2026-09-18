# Shared development configuration

`typescript/tsconfig.base.json` defines the strict TypeScript baseline for repository tooling and future workspaces. ESLint, Stylelint, Prettier, and Vitest use root configuration files so their command-line tools discover them without extra flags. Sass currently compiles the core package's layer-order entry; package build configuration expands in CODS-P1-009. This directory is not a publishable workspace.
