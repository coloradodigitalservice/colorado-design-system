# ADR-004: MCP servers for agent-assisted CoDS work

- **Status:** Proposed for State technical-owner acceptance
- **Date:** 2026-10-01
- **Related work:** CODS-P1-013 (Jira CDS-37), CODS-P1-010 (Playwright test runner; also delivers the Playwright CLI and skills decided here), CODS-P1-015 / ADR-003 (Figma verification gap)

## Context

CODS-P1-013 asks which Model Context Protocol (MCP) servers, if any, the team should standardize on for agent-assisted contributors. The working hypothesis was that CLI tools plus agent skills would cover most of the need, as Playwright's maintainers state for browser work, leaving little that only an MCP server can do.

Research on 2026-10-01 compared each candidate against its CLI/skill alternative, using vendor documentation. Token-cost claims below come from vendors and were not independently measured.

Repository facts relevant to the decision:

- `gh` is already installed and authenticated on contributor machines used so far; `AGENTS.md` already uses repo-local skills (now `.agents/skills/`, consolidated in CODS-P1-016) as the extension mechanism.
- `apps/storybook` uses `@storybook/html-vite` with `@storybook/addon-a11y`.
- CODS-P1-010 added `@playwright/test` and `@axe-core/playwright` (both exact-pinned in the root `package.json`). The Playwright CLI ships inside `@playwright/test` (`pnpm exec playwright cli`, confirmed for 1.63.0), so adopting it needed no new dependency. The upstream skill is committed at `.agents/skills/playwright-cli/`.
- Dependencies are exact-pinned; tooling that resolves `@latest` at start-up conflicts with that practice.
- Figma is a display surface only; approved token values are authored in Git (`AGENTS.md`).

## Decision

Per-candidate decisions. **No MCP server is used on this project for now, including Figma.** Reopening any of them requires a new ADR. "Adopt now" means the capability is put in place; the only such candidate is Playwright CLI + Skills, which is not an MCP server. It was done in CODS-P1-010 and runs locally against built previews, sending nothing to a third-party service. No MCP configuration is committed by this ADR.

| Candidate                 | Decision       | Rationale                                                                                                                                                                                  |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Playwright MCP            | Reject         | Maintainers recommend CLI + Skills for coding agents; MCP's persistent-context advantage is not needed here.                                                                               |
| Playwright CLI + Skills   | Adopt now      | Delivered in CODS-P1-010 via the existing `@playwright/test`. Covers console, network, tracing, and reduced-motion / forced-colors / contrast emulation needed for accessibility evidence. |
| Chrome DevTools MCP       | Reject (MCP)   | Its own CLI wraps the same daemon and includes Lighthouse; MCP adds no capability. Usage statistics and CrUX lookups are on by default.                                                    |
| Context7                  | Not adopted    | `ctx7 library` / `ctx7 docs` work without MCP. Hosted third-party service with community-contributed content; not needed now.                                                              |
| GitHub MCP server         | Not adopted    | `gh` covers issues, PRs, Actions, and Dependabot. MCP's added value is capability scoping (toolsets, read-only, lockdown), a control rather than a capability.                             |
| Figma MCP server (remote) | Not adopted    | Only candidate with no CLI equivalent, but limited Figma seats make contributor access unreliable. Not used on this project for now.                                                       |
| Storybook MCP addon       | Reject for now | The docs toolset needs a components manifest that HTML frameworks do not generate; the remaining toolsets duplicate the Storybook and Vitest CLIs. Feature is in preview.                  |
| ESLint MCP server         | Reject         | Duplicates `pnpm lint`.                                                                                                                                                                    |
| Astro Docs MCP server     | Not adopted    | Free hosted server useful only to `apps/web`; revisit if Astro API drift causes problems.                                                                                                  |

### 1. Playwright: CLI + Skills, not MCP

For interactive, agent-driven browser exploration, use the Playwright CLI (`pnpm exec playwright cli`) with its installed skill. The decision is recorded here separately from the test-runner setup, which CODS-P1-010 governs, and it was implemented in CODS-P1-010 because it builds on the same pinned Playwright version. CODS-P1-010 did the following:

- Relies on the CLI bundled with `@playwright/test` rather than adding a package or a global install.
- Commits the upstream `playwright-cli` skill unmodified (installed with `pnpm exec playwright cli install --skills=agents`); it is re-installed whenever Playwright is upgraded, as the [dependency update policy](../governance/dependency-update-policy.md#upgrade-coupling) requires.
- Adds a small repo skill, `cods-browser-verification`, that links to `tests/README.md` instead of duplicating it, and states the local-only rules (build first, local previews only, never a deployed environment).
- Ignores the CLI's output directories (`.playwright-cli/`, which may contain credentials, and `.playwright/`) in `.gitignore`.
- Adds a short `AGENTS.md` section stating that interactive browser work uses the CLI, not Playwright MCP.

Playwright MCP is not adopted; revisit only if a long-running exploratory or self-healing workflow demonstrably needs persistent page context. `npx playwright init-agents` is also not adopted: its planner, generator, and healer agents are built on MCP tools and expect a `specs/` and `seed.spec.ts` layout that does not match `tests/browser/`.

### 2. Figma: not used

The Figma remote MCP server exposes `get_design_context`, `get_variable_defs`, `search_design_system`, and Code Connect mapping, and it is the only candidate whose capability a CLI tool cannot replace. The REST API is not a substitute:

- The Variables REST API requires a Full seat in an Enterprise organization.
- REST rate limits depend on seat type and plan; View/Collab seats are capped at 5–20 requests per minute or month depending on endpoint tier, and a personal access token against a Starter-plan file is limited to 6 requests per month.
- The remote MCP server is stated to be available on all seats and plans, but ADR-003 records it hitting a seat-tier rate limit in practice.

Because Figma seats are limited, contributors cannot be assured of enough access for agent use to be dependable. Figma MCP is therefore not used, and no Figma configuration is added. A future ADR would reopen it if seat availability changes.

If it is reopened, restrict it to read-oriented tools (design context, variables, library search) for CODS-P0-005 (inventory), CODS-P1-003 (token mapping), and the ADR-003 typography spot-check. The server also exposes write tools (for example `use_figma`) and no documented read-only switch was found, so write tools would need to be disabled per user in the MCP client. Figma skills do not add capabilities beyond the MCP tools.

### 3. GitHub: `gh` first

Contributors use `gh` for issue, PR, Actions, and Dependabot work. If a future ADR adopts MCP, use the hosted remote server with the narrowest toolsets (`repos,issues,pull_requests,actions,code_security,dependabot`) and read-only mode wherever the client supports it, and consider lockdown mode to reduce prompt-injection exposure from public issue and PR content.

### 4. Documentation retrieval: not adopted

If Context7 is reopened, install it in CLI + Skills mode rather than registering an MCP server. Library content is community-contributed and the backend is not open source, so retrieved text is treated as untrusted input.

### 5. Configuration approach (secret-free)

- Prefer a root `.mcp.json` over `.vscode/mcp.json`; current VS Code documentation lists `.vscode/mcp.json` as deprecated for new servers and Agent Host sessions skip servers that need `${input:...}` secrets from that file.
- Any remote server adopted by a future ADR (for example Figma or GitHub) should use OAuth so no token is stored in the repository. Where a token is unavoidable, use a per-user input prompt or environment variable, never a committed value.
- Pin versions for any `npx`-launched server or CLI instead of `@latest`. The Playwright CLI is pinned through the `@playwright/test` version in the lockfile.
- Workspace MCP servers start automatically once a workspace is trusted, so any committed MCP file must be reviewed like executable code.
- This ADR does not add or commit any MCP configuration file.

## Consequences

### Benefits

1. A small default footprint: one CLI + skill (Playwright) delivered through CODS-P1-010 with no new dependency, no MCP server used, and every other candidate rejected or not adopted with a recorded reason.
2. Avoids loading large MCP tool schemas for capabilities a shell command already provides.
3. Keeps Figma out of the contributor workflow until seat limits are resolved, consistent with Git being authoritative for token values: no released token depends on Figma access.

### Costs and risks

1. **No third-party data sharing.** No MCP server is used, so no repository or design data is sent to MCP services. A future adoption needs its own ADR and a data-handling review.
2. **Figma verification stays open.** Without agent access to Figma, the ADR-003 typography spot-check and the CODS-P0-005 / CODS-P1-003 mapping work remain manual or depend on someone with a suitable seat.
3. **Vendor-sourced claims.** The CLI-versus-MCP token-efficiency advantage is asserted by Playwright and not measured on this repository.
4. **Fast-moving tools.** Playwright CLI, Context7, and the Figma MCP server are all at pre-1.0 or beta stages; decisions should be re-reviewed when any of them reach a stable release or change pricing (Figma notes the server will become a usage-based paid feature).
5. **Skill upkeep.** The committed upstream skill must be re-installed on each Playwright upgrade, or it drifts from the CLI; the Playwright row of the dependency update policy's upgrade-coupling table covers this.

## Alternatives considered

### A1. Adopt every candidate by default

- **Pros:** Maximum agent capability with no per-tool evaluation.
- **Cons:** Large tool-schema context cost, a wider data-sharing surface, and several servers duplicate commands the repository already runs (`pnpm lint`, Storybook and Vitest CLIs, `gh`).
- **Decision:** Rejected; CODS-P1-013 explicitly scopes this task to servers worth adopting.

### A2. Adopt no MCP servers at all

- **Pros:** Smallest security surface.
- **Cons:** Agents cannot read Figma variables or component context, so the Figma verification gap noted in ADR-003 stays open.
- **Decision:** Accepted. Figma is not used; a new ADR would reopen it if seat limits change.

### A3. Use the Figma REST API from a script instead of MCP

- **Pros:** Scriptable and cache-friendly, no MCP client needed.
- **Cons:** Variables endpoints require Enterprise Full seats; file endpoints have low per-seat limits.
- **Decision:** Not adopted unless the State's Figma plan makes those endpoints available to contributors.

## Governance and approval

- **Responsible:** Aten technical lead
- **Accountable:** State technical owner
- **Consulted:** Design lead, accessibility lead
- **Informed:** Contributors

## Resolved questions

**Q: Where should the Playwright skill live?**
A: The upstream installer only supports `.claude/skills` and `.agents/skills`, while the existing repo skill was in `.github/skills`. Resolved by CODS-P1-016 ([ADR-005](005-unified-agent-directory.md)): all skills now live in `.agents/skills`, and VS Code Copilot Chat discovers them there.
