# Dependency Update Policy

## Overview

This document defines the review and merge policy for automated dependency updates in the Colorado Design System repository.

## Automated Update Configuration

Dependency updates are managed through **GitHub Dependabot**, configured to monitor:

- **npm/pnpm packages** across all workspaces (root, `packages/`, `apps/`, and `examples/`)
- **GitHub Actions** used in CI/CD workflows

## Update Schedule

| Ecosystem      | Interval | Day    | Time    | Timezone       |
| -------------- | -------- | ------ | ------- | -------------- |
| npm/pnpm       | Weekly   | Monday | 9:00 AM | America/Denver |
| GitHub Actions | Weekly   | Monday | 9:30 AM | America/Denver |

### Rationale for Weekly Cadence

- **Weekly updates** provide a manageable frequency for a small team
- **Monday morning** allows time for review before the week progresses
- **Grouped updates** reduce PR noise and make reviews more focused
- **Staggered start times** (npm at 9:00, Actions at 9:30) prevents simultaneous PRs

## Update Grouping Strategy

Dependabot's `groups` configuration matches on dependency name and dependency type, not on directory/workspace path. The pnpm workspace is monitored from its root directory, and Dependabot automatically discovers and updates dependencies across all workspace packages (`packages/`, `apps/`, `examples/`) from that single entry.

To keep PR volume low, updates within each ecosystem are grouped by dependency type:

- **Production dependencies** — one PR per update window covering all runtime dependency updates
- **Development dependencies** — one PR per update window covering all dev-only dependency updates

This keeps the noise low for a small team without relying on path-based grouping, which Dependabot does not support for npm dependency matching.

## Review and Merge Workflow

### Step 1: Automated Checks

All dependency update PRs must pass the existing CI suite before they can merge:

- Linting (`eslint`, `stylelint`)
- Type checking (`tsc`)
- Tests (`vitest`)
- Build validation
- Repository health checks

If CI checks fail, the PR is blocked from merging until the issues are resolved.

### Step 2: Code Review

**Reviewers**: Dependabot requests review from the `@coloradodigitalservice/technical-maintainers` GitHub team (currently mapped to Philip Stier, Aten technical lead). This team must exist in the GitHub organization for automatic review requests to be applied.  
**Approval**: At least one approval required before merge

Reviewers should check for:

- **Breaking changes**: Review changelogs and release notes to identify any breaking changes
- **Major version bumps**: Pay closer attention to major version updates
- **Security advisories**: Confirm if the update addresses known vulnerabilities
- **Compatibility**: Verify compatibility with the project's tech stack (TypeScript, Node.js, etc.)

### Step 3: Merge Strategy

- **Default merge strategy**: GitHub's default (squash and merge recommended for cleaner history)
- **Auto-merge**: Not enabled; all merges require manual approval
- **Branch protection**: The main branch requires passing CI checks before merge

## Dependency Types

### Security Updates

- **Priority**: High
- **Review timeline**: Within 24 hours if possible
- **Action**: Merge immediately after security advisory is confirmed and CI passes

### Major Version Updates

- **Priority**: Medium
- **Review timeline**: Within 2–3 business days
- **Action**: Review release notes carefully; may require code changes or configuration updates

### Minor/Patch Updates

- **Priority**: Low
- **Review timeline**: Weekly (as part of standard review cycle)
- **Action**: Merge if CI passes; changelogs are typically for informational purposes

## GitHub Security Advisories

All repository members should be aware that **GitHub Dependabot alerts** are enabled for this repository. These alerts:

- Notify maintainers of known vulnerabilities in dependencies
- Can be viewed in the repository's **Security** tab under "Dependabot alerts"
- Trigger corresponding Dependabot PRs when fixes are available

### Action on Security Alerts

1. Review the advisory details in the GitHub Security tab
2. Assess the severity and impact to the project
3. If a fix is available, merge the corresponding Dependabot PR
4. If no fix is available yet, open an issue to track the vulnerability
5. Document any workarounds if the update must be deferred

## Maintenance and Escalation

### Out-of-Band Updates

If a critical security vulnerability is discovered outside the regular weekly cycle:

1. **Assess urgency**: Determine if an emergency update is needed
2. **Create a patch PR**: Don't wait for the scheduled Dependabot cycle
3. **Fast-track review**: Request urgent review from team leads
4. **Communicate impact**: Notify relevant stakeholders if the vulnerability affects user data or systems

### Long-Term Deferred Updates

If an update cannot be merged due to breaking changes or compatibility issues:

1. Open a GitHub issue describing the blocking concern
2. Tag the issue with `dependencies` and `blocked`
3. Assign it to the responsible party for resolution
4. Re-evaluate after each new minor/patch release

## Responsibilities

| Role                             | Responsibility                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Aten Technical Lead (Philip)** | Review and approve dependency update PRs; assess security advisories; escalate blocking issues           |
| **State Security Owner**         | Review quarterly summaries of security updates merged; oversee high-risk dependency decisions            |
| **Contributors**                 | Report issues related to dependency changes; follow team conventions when manually updating dependencies |

## Related Documentation

- [Component Contract](./component-contract.md) — Design and delivery standards
- [Repository Access and CodeOwners](./repository-access-and-codeowners.md) — Permissions and code ownership
- [USWDS Upgrade Policy](./USWDS-UPGRADE-POLICY.md) — Specific policy for USWDS framework updates

## Revision History

| Date       | Version | Change                                           |
| ---------- | ------- | ------------------------------------------------ |
| 2026-09-23 | 1.0     | Initial policy; Dependabot configuration enabled |
