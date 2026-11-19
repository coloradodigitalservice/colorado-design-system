# Agent resources

Tool-agnostic home for agent guidance and repository-local skills. Any AI agent or IDE can read these files.

## Instructions

- [`../AGENTS.md`](../AGENTS.md) — authoritative repository conventions. It stays at the repository root because agent tools auto-discover `AGENTS.md` there.
- [`INSTRUCTIONS.md`](INSTRUCTIONS.md) — tool-agnostic entry point that points to `AGENTS.md` and this index.
- [`../.github/copilot-instructions.md`](../.github/copilot-instructions.md) — stub so GitHub Copilot still loads the guidance; it links here.

## Skills

| Skill                                                                    | Purpose                                                                                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`create-cods-component`](skills/create-cods-component/SKILL.md)         | Scaffold a new CoDS component (fixture, Sass, controller, evidence file, Storybook story, export) and hand off the steps the script does not automate.  |
| [`cods-accessibility-review`](skills/cods-accessibility-review/SKILL.md) | Review a component's accessibility and record the evidence file. Prepares evidence only; screen-reader findings and `stable` sign-off stay with people. |
| [`cods-token-change`](skills/cods-token-change/SKILL.md)                 | Propose and implement a DTCG token change: classification, alias impact, contrast, reviewers, regeneration.                                             |
| [`cods-browser-verification`](skills/cods-browser-verification/SKILL.md) | Verify built pages or Storybook stories with the pinned Playwright CLI, turn findings into tests, and update visual baselines.                          |
| [`playwright-cli`](skills/playwright-cli/SKILL.md)                       | Upstream Playwright CLI skill, committed unmodified and excluded from Prettier. Refresh it with `pnpm exec playwright cli install --skills=agents`.     |

## Adding a skill

Create `skills/<name>/SKILL.md` with `name` and `description` front matter, then add it to the table above. Do not add skills under `.github/skills/`. `pnpm test` validates every skill against the [Agent Skills specification](https://agentskills.io/specification) and checks this index (`tests/agent-skills.test.ts`).

Skills are discovered by VS Code from `.agents/skills/`. The `name` must equal the directory name or the skill silently fails to load.
