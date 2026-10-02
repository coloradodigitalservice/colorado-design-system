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
- CODS-P1-010 (under review, not yet merged) adds `@playwright/test` `^1.63.0` and `@axe-core/playwright`. The Playwright CLI ships inside `@playwright/test` (`npx playwright cli`, confirmed for 1.63.0), so adopting it needs no new dependency. Neither the CLI nor any Playwright skill is in the repository on `main`.
- Dependencies are exact-pinned; tooling that resolves `@latest` at start-up conflicts with that practice.
- Figma is a display surface only; approved token values are authored in Git (`AGENTS.md`).

## Decision

Per-candidate decisions. "Adopt now" means the capability is put in place. For Playwright CLI + Skills that happens in CODS-P1-010; it runs locally against built previews and sends nothing to a third-party service, so it is not gated on the security review below. No MCP configuration is committed by this ADR.

| Candidate                 | Decision                        | Rationale                                                                                                                                                                                  |
| ------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Playwright MCP            | Reject                          | Maintainers recommend CLI + Skills for coding agents; MCP's persistent-context advantage is not needed here.                                                                               |
| Playwright CLI + Skills   | Adopt now                       | Delivered in CODS-P1-010 via the existing `@playwright/test`. Covers console, network, tracing, and reduced-motion / forced-colors / contrast emulation needed for accessibility evidence. |
| Chrome DevTools MCP       | Reject (MCP)                    | Its own CLI wraps the same daemon and includes Lighthouse; MCP adds no capability. Usage statistics and CrUX lookups are on by default.                                                    |
| Context7                  | Adopt later (CLI + Skills mode) | `ctx7 library` / `ctx7 docs` work without MCP. Hosted third-party service with community-contributed content; needs security review first.                                                 |
| GitHub MCP server         | Adopt later                     | `gh` covers issues, PRs, Actions, and Dependabot. MCP's added value is capability scoping (toolsets, read-only, lockdown), a control rather than a capability.                             |
| Figma MCP server (remote) | Adopt later (not now)           | Only candidate with no CLI equivalent, but limited Figma seats make contributor access unreliable today. Not done now; a future option if seats and State security review allow.           |
| Storybook MCP addon       | Reject for now                  | The docs toolset needs a components manifest that HTML frameworks do not generate; the remaining toolsets duplicate the Storybook and Vitest CLIs. Feature is in preview.                  |
| ESLint MCP server         | Reject                          | Duplicates `pnpm lint`.                                                                                                                                                                    |
| Astro Docs MCP server     | Adopt later                     | Free hosted server useful only to `apps/web`; revisit if Astro API drift causes problems.                                                                                                  |

### 1. Playwright: CLI + Skills, not MCP

For interactive, agent-driven browser exploration, use the Playwright CLI (`npx playwright cli`) with its installed skill. The decision is recorded here separately from the test-runner setup, which CODS-P1-010 governs, but it is implemented in CODS-P1-010 because it builds on the same pinned Playwright version. CODS-P1-010 is expected to:

- Rely on the CLI bundled with `@playwright/test` rather than add a package or a global install.
- Commit the upstream `playwright-cli` skill unmodified (installed with `npx playwright cli install --skills=agents`) and re-install it whenever Playwright is upgraded.
- Add a small repo skill that links to `tests/README.md` instead of duplicating it, and states the local-only rules (build first, local previews only, never a deployed environment).
- Ignore the CLI's output directories (`.playwright-cli/`, which may contain credentials, and `.playwright/`).
- Add a short `AGENTS.md` note that interactive browser work uses the CLI, not Playwright MCP.

Playwright MCP is not adopted; revisit only if a long-running exploratory or self-healing workflow demonstrably needs persistent page context. `npx playwright init-agents` is also not adopted: its planner, generator, and healer agents are built on MCP tools and expect a `specs/` and `seed.spec.ts` layout that does not match `tests/browser/`.

### 2. Figma: not now, potential for the future

The Figma remote MCP server exposes `get_design_context`, `get_variable_defs`, `search_design_system`, and Code Connect mapping, and it is the only candidate whose capability a CLI tool cannot replace. The REST API is not a substitute:

- The Variables REST API requires a Full seat in an Enterprise organization.
- REST rate limits depend on seat type and plan; View/Collab seats are capped at 5–20 requests per minute or month depending on endpoint tier, and a personal access token against a Starter-plan file is limited to 6 requests per month.
- The remote MCP server is stated to be available on all seats and plans, but ADR-003 records it hitting a seat-tier rate limit in practice.

Because Figma seats are limited, contributors cannot be assured of enough access for agent use to be dependable. Figma MCP is therefore not adopted now, and no Figma configuration is added. It remains a future option, to be reconsidered if seat availability changes and the State security owner reviews it.

If it is adopted later, restrict it to read-oriented tools (design context, variables, library search) for CODS-P0-005 (inventory), CODS-P1-003 (token mapping), and the ADR-003 typography spot-check. The server also exposes write tools (for example `use_figma`) and no documented read-only switch was found, so write tools would need to be disabled per user in the MCP client. Write-scoped access would remain out of scope without an explicit State security review. Figma skills do not add capabilities beyond the MCP tools.

### 3. GitHub: `gh` first

Contributors use `gh` for issue, PR, Actions, and Dependabot work. If MCP is later adopted, use the hosted remote server with the narrowest toolsets (`repos,issues,pull_requests,actions,code_security,dependabot`) and read-only mode wherever the client supports it, and consider lockdown mode to reduce prompt-injection exposure from public issue and PR content.

### 4. Documentation retrieval: CLI mode only

If Context7 is adopted, install it in CLI + Skills mode rather than registering an MCP server. Library content is community-contributed and the backend is not open source, so retrieved text is treated as untrusted input.

### 5. Configuration approach (secret-free)

- Prefer a root `.mcp.json` over `.vscode/mcp.json`; current VS Code documentation lists `.vscode/mcp.json` as deprecated for new servers and Agent Host sessions skip servers that need `${input:...}` secrets from that file.
- Any remote server adopted later (for example Figma or GitHub) should use OAuth so no token is stored in the repository. Where a token is unavoidable, use a per-user input prompt or environment variable, never a committed value.
- Pin versions for any `npx`-launched server or CLI instead of `@latest`. The Playwright CLI is pinned through the `@playwright/test` version in the lockfile.
- Workspace MCP servers start automatically once a workspace is trusted, so any committed MCP file must be reviewed like executable code.
- This ADR does not add or commit any MCP configuration file.

## Consequences

### Benefits

1. A small default footprint: one CLI + skill (Playwright) delivered through CODS-P1-010 with no new dependency, no MCP server adopted now, and every other candidate deferred or rejected with a recorded reason.
2. Avoids loading large MCP tool schemas for capabilities a shell command already provides.
3. Keeps Figma out of the contributor workflow until seat limits are resolved, consistent with Git being authoritative for token values: no released token depends on Figma access.

### Costs and risks

1. **Security review not yet done.** Any later adoption of Figma, GitHub, or Context7 would send repository or design data to third-party services. None of them is approved for use until the State security owner reviews it.
2. **Figma verification stays open.** Without agent access to Figma, the ADR-003 typography spot-check and the CODS-P0-005 / CODS-P1-003 mapping work remain manual or depend on someone with a suitable seat.
3. **Vendor-sourced claims.** The CLI-versus-MCP token-efficiency advantage is asserted by Playwright and not measured on this repository.
4. **Fast-moving tools.** Playwright CLI, Context7, and the Figma MCP server are all at pre-1.0 or beta stages; decisions should be re-reviewed when any of them reach a stable release or change pricing (Figma notes the server will become a usage-based paid feature).
5. **Dependency on CODS-P1-010.** The Playwright CLI and skills are not in the repository until CODS-P1-010 merges. If that PR changes scope or stalls, the Playwright CLI decision still stands but is not yet in effect.
6. **Skill upkeep.** The committed upstream skill must be re-installed on each Playwright upgrade, or it drifts from the CLI; the Playwright upgrade step in CODS-P1-010 should include this.

## Alternatives considered

### A1. Adopt every candidate by default

- **Pros:** Maximum agent capability with no per-tool evaluation.
- **Cons:** Large tool-schema context cost, a wider data-sharing surface, and several servers duplicate commands the repository already runs (`pnpm lint`, Storybook and Vitest CLIs, `gh`).
- **Decision:** Rejected; CODS-P1-013 explicitly scopes this task to servers worth adopting.

### A2. Adopt no MCP servers at all

- **Pros:** Smallest security surface.
- **Cons:** Agents cannot read Figma variables or component context, so the Figma verification gap noted in ADR-003 stays open.
- **Decision:** Accepted for now. Figma is deferred, not rejected, and is revisited if seat limits change.

### A3. Use the Figma REST API from a script instead of MCP

- **Pros:** Scriptable and cache-friendly, no MCP client needed.
- **Cons:** Variables endpoints require Enterprise Full seats; file endpoints have low per-seat limits.
- **Decision:** Not adopted unless the State's Figma plan makes those endpoints available to contributors.

## Governance and approval

- **Responsible:** Aten technical lead
- **Accountable:** State technical owner
- **Consulted:** State security owner, design lead, accessibility lead
- **Informed:** Contributors

## Open questions

**Q: Before Figma, GitHub, or Context7 is adopted later, are they permitted under State security and data-handling policy?**
A: Not yet reviewed. Must be answered by the State security owner before any server is configured.

**Q: What Figma plan and seat type would contributors need for the MCP server to be dependable, and can additional seats be provided?**
A: Unknown. This is the reason Figma is deferred. Figma's MCP plans and rate-limit page could not be retrieved during research, so the limits for the MCP server specifically are unconfirmed.

**Q: Does the State use Figma for Government?**
A: Unknown. Figma documents that Figma for Government supports the desktop MCP server only, which would change the setup steps.

**Q: Does the remote GitHub MCP server support a read-only mode?**
A: Not verified. Only the local server's `--read-only` flag was confirmed.

**Q: Where should the Playwright skill live?**
A: The upstream installer only supports `.claude/skills` and `.agents/skills`, while the existing repo skill was in `.github/skills`. Resolved by CODS-P1-016 ([ADR-005](005-unified-agent-directory.md)): all skills now live in `.agents/skills`. Confirm that Copilot in VS Code discovers them.

## Acceptance criteria

- [ ] Each candidate has an adopt-now / adopt-later / reject decision with rationale (this document).
- [ ] Before any deferred server (Figma, GitHub, Context7, Astro Docs) is adopted, the State security owner has reviewed it.
- [ ] Playwright MCP versus CLI + Skills decision is recorded separately from the CODS-P1-010 test-runner setup (Decision section 1).
- [ ] CODS-P1-010 merges with the Playwright CLI skill, the repo skill, the ignore rules, and the `AGENTS.md` note listed in Decision section 1.
- [ ] A contributor can follow the Playwright CLI setup end to end. The secret-free MCP configuration approach applies when a deferred server is adopted.
- [ ] This ADR is signed by the State technical owner and Aten technical lead.
