# CoDS Release Rollback Runbook

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-004](../backlog/phase-0/CODS-P0-004-confirm-hosting-and-recovery.md)

## Purpose

Define how Colorado Design System documentation, Storybook, and release artifacts are restored after a production release problem. This runbook is provider-neutral until the State-approved hosting and CDN decision is recorded. It does not authorize a production change by itself.

## Preconditions to record at G0

- State-approved hosting and CDN provider, production URLs, and the provider-specific rollback command or console procedure.
- State release owner, named deployer, State technology owner, incident notification channel, and access-recovery contacts.
- Retention location and release identifier for at least one prior approved immutable build and its matching versioned assets.
- Recovery and communication targets agreed by the State technology, security, and release roles.
- Production smoke-check location covering HTTPS, redirects, primary documentation and Storybook assets, and release identifier verification.

## Rollback triggers

Begin the authorization path for a confirmed security or privacy exposure, unavailable or materially broken public documentation or Storybook, corrupted or missing production assets, an incorrect release or redirect, or an accessibility regression that prevents a core documented journey. The State release owner may authorize a precautionary rollback while investigation continues.

## Procedure

1. The deployer stops further production promotion and records the incident, affected URL or artifact, release identifier, and time in the backlog or risk register.
2. The Aten release lead notifies the State release owner and State technology owner. Potential security, privacy, or production-impacting incidents follow the [escalation procedure](escalation-and-decision-recording.md).
3. The State release owner authorizes rollback. The deployer promotes the last known-good, approved immutable build and its matching versioned assets. Do not rebuild or alter a released artifact during rollback.
4. The deployer invalidates or bypasses only the CDN paths required to remove the affected release, preserving immutable versioned assets where possible. DNS changes are not a normal rollback mechanism.
5. The deployer runs the recorded production smoke checks for the documentation site and Storybook, including HTTPS, redirects, primary assets, and the restored release identifier. Accessibility-critical or security-impacting regressions require review by the applicable State owner before the incident is closed.
6. The Aten release lead records the rollback result, restored release identifier, evidence, follow-up owner, and conditions for re-promoting the withdrawn release. The State release owner accepts closure.

## Exercise and evidence

In a non-production environment where available, promote a known-good prior immutable build, run the recorded smoke checks, and retain the evidence. Record the exercise date, participants, release identifiers, result, exceptions, and corrective actions. Link the evidence from the related backlog task or the release record.

## Scope boundaries

This runbook covers static documentation, Storybook, release archives, and their CDN delivery. It does not cover runtime servers, databases, CMS recovery, or remediation of the underlying defect. Defect correction and re-release require the normal review and release approval process.
