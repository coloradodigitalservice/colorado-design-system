# Agent resources

Tool-agnostic home for agent guidance and repository-local skills. Any AI agent or IDE can read these files.

## Instructions

- [`../AGENTS.md`](../AGENTS.md) — authoritative repository conventions. It stays at the repository root because agent tools auto-discover `AGENTS.md` there.
- [`INSTRUCTIONS.md`](INSTRUCTIONS.md) — tool-agnostic entry point that points to `AGENTS.md` and this index.
- [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md) — stub so GitHub Copilot still loads the guidance; it links here.

## Skills

| Skill                                                                    | Purpose                                                                                                                                             |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`create-cods-component`](skills/create-cods-component/SKILL.md)         | Scaffold a new CoDS component that conforms to the canonical component contract.                                                                    |
| [`cods-browser-verification`](skills/cods-browser-verification/SKILL.md) | Verify built pages or Storybook stories with the pinned Playwright CLI and turn findings into tests.                                                |
| [`playwright-cli`](skills/playwright-cli/SKILL.md)                       | Upstream Playwright CLI skill, committed unmodified and excluded from Prettier. Refresh it with `pnpm exec playwright cli install --skills=agents`. |

## Adding a skill

Create `skills/<name>/SKILL.md` with `name` and `description` front matter, then add it to the table above. Do not add skills under `.github/skills/`.
