# Repository Access and CODEOWNERS

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-002](../backlog/phase-0/CODS-P0-002-establish-repository-and-access.md)

## Purpose

This guide describes how repository access and review ownership should work for the Colorado Design System repository. It is a contributor reference and does not replace the approved access matrix, GitHub organization settings, branch protection rules, or recovery record.

The repository includes an illustrative [`.github/CODEOWNERS` example](../../.github/CODEOWNERS). Its team handles and paths must be approved and updated before the file is used as an enforceable review control.

## What CODEOWNERS is

`CODEOWNERS` is a GitHub configuration file that maps paths in a repository to the people or teams responsible for reviewing changes to those paths. When a pull request changes a matching path, GitHub can automatically request those owners as reviewers.

The file is usually stored at `.github/CODEOWNERS`. GitHub also supports `CODEOWNERS` in the repository root or `docs/`; the location selected for CoDS should be recorded in the repository setup record.

`CODEOWNERS` is about review ownership, not account access. It does not:

- create users or teams;
- grant repository permissions;
- protect a branch by itself; or
- guarantee that a pull request cannot merge without approval.

Branch protection or rulesets must explicitly require code-owner approval. The referenced teams must also exist and have access to the repository.

## How matching works

Each non-comment line has this shape:

```text
path-pattern  @owner
```

Patterns use GitHub's CODEOWNERS matching rules. Common examples include:

```text
# Default owner for files not covered below
* @coloradodigitalservice/technical-maintainers

# Component implementation and tests
packages/components/ @coloradodigitalservice/component-maintainers

# Design tokens and token build inputs
packages/tokens/ @coloradodigitalservice/design-system-maintainers

# Documentation and website content
apps/docs/ @coloradodigitalservice/documentation-maintainers

# Accessibility review for accessibility guidance and test fixtures
docs/accessibility/ @coloradodigitalservice/accessibility-reviewers
```

More specific rules should appear after broader rules when the ownership model depends on the last matching rule. Every owner must be written as a valid GitHub username or team handle, such as `@organization/team-name`.

## Recommended CoDS ownership areas

The initial file should cover the repository's meaningful review boundaries without assigning every individual file. At minimum, the setup review should consider:

- repository configuration, workflows, and release controls;
- tokens and visual foundations;
- component source, tests, and package metadata;
- Astro documentation and website content;
- Storybook examples and fixtures;
- accessibility guidance and evidence; and
- security, dependency, and release configuration.

The final paths and team handles are decisions for the State technology owner and the accountable domain owners. They should be recorded in the access matrix and reviewed when the monorepo structure is established.

## Review and merge behavior

For CODEOWNERS to provide an enforceable control:

1. The file must be present on the repository's default branch.
2. The owner teams must exist and have repository access.
3. Pull request rules or a ruleset must require approval from code owners for protected branches.
4. Dismissal, update-branch, and bypass permissions must be reviewed as part of branch protection.
5. A pull request test should change files in each ownership area and confirm that the expected review request and required approval behavior occur.

Code-owner review supplements normal technical, product, accessibility, content, security, and release review. It does not replace the RACI or the gate approval process.

## Maintenance and security

- Keep ownership assigned to recoverable State-controlled teams rather than personal accounts.
- Use least-privilege repository access for contributors and automation.
- Review the file whenever a package, application, workflow, or team changes.
- Keep sensitive implementation code and secrets out of this repository; `CODEOWNERS` is not a security boundary.
- Validate the file in pull requests so malformed patterns or unavailable teams are detected before release work depends on them.
- Document temporary ownership, delegation, and recovery contacts in the repository access record.

## Acceptance evidence for G0

The repository setup record should include:

- the approved `.github/CODEOWNERS` location and contents;
- the team-to-role mapping and repository permissions;
- branch protection or ruleset settings requiring code-owner review;
- a test pull request or equivalent evidence for each ownership area; and
- State-controlled recovery contacts and any approved delegations.
