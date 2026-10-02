# ADR-005: Unified `.agents/` directory for agent skills and instructions

- **Status:** Proposed pending G0 approval
- **Date:** 2026-10-01
- **Related work:** CODS-P1-016 (Jira CDS-102), CODS-P1-010, ADR-004

## Context

Agent guidance was split across `.github/copilot-instructions.md`, `.github/skills/`, and `.agents/skills/`, organized by tool rather than purpose. CODS-P1-016 consolidates it.

## Decision

1. **Location:** the unified directory is `/.agents/` at the repository root, not `/.github/agents/`, to signal it is tool-agnostic. The upstream Playwright installer already writes `.agents/skills/`.
2. **Skills:** all skills live under `.agents/skills/<name>/`. `.github/skills/` is removed with no deprecation stubs; the skills moved without content changes.
3. **Instructions:** `copilot-instructions.md` becomes `.agents/INSTRUCTIONS.md`. A short stub stays at `.github/copilot-instructions.md` because GitHub Copilot loads that path automatically; it links to the new file.
4. **`AGENTS.md`:** stays at the repository root because agent tools auto-discover `AGENTS.md` there. `.agents/README.md` and `.agents/INSTRUCTIONS.md` cross-link to it, and its content is unchanged.
5. **Index:** `.agents/README.md` lists every skill and instruction file. New skills are added there.

## Consequences

- Skills have one home; contributors search one directory.
- The Copilot stub is the only tool-specific entry point and can be removed once Copilot no longer needs it.
- Path references in docs, tests, and skill scripts were updated to `.agents/skills/`.
- Whether Copilot in VS Code and the Playwright CLI resolve `.agents/skills/` is confirmed manually, as the ticket's validation plan requires.
