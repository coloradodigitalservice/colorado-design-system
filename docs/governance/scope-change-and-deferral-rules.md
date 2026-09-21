# CoDS Scope-Change and Deferral Rules

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-008](../backlog/phase-0/CODS-P0-008-establish-delivery-backlog-and-review-cadence.md)  
**Related procedures:** [Escalation and Decision Recording](escalation-and-decision-recording.md), [Gate Approval Matrix](gate-approval-matrix.md), [Review Cadence and Response Expectations](review-cadence-and-response-expectations.md)

## Purpose

These rules define how CoDS scope is added, removed, deferred, split, or re-sequenced during the `1.0.x` delivery. They protect the approved release contract, make schedule and quality trade-offs explicit, and keep deferred work visible without treating it as a launch commitment.

These rules supplement the accepted proposal and ADR. They do not authorize a new architecture, release date, package identity, or implementation capability by themselves.

## Baseline scope

The approved release baseline is the scope accepted at the applicable gate and recorded in the decision log, including:

- the approved foundations and component inventory;
- the supported package, documentation, and workbench surfaces;
- required accessibility, security, content, test, and release evidence;
- the target gate dates and supported-release conditions; and
- explicit exclusions, known limitations, and deferred work.

The current expanded component inventory remains conditional on the capacity and schedule review described in the proposal. The team must not silently remove items from that inventory to preserve the November 30 date.

## What counts as a scope change

Treat any of the following as a scope change or a scope-affecting decision:

- adding a component, foundation, website section, supported recipe, package surface, or runtime dependency;
- removing or reducing an approved deliverable or its required evidence;
- changing a component's supported behavior, accessibility contract, browser contract, or customization boundary;
- changing an explicit exclusion, including Drupal, Web Components, Shadow DOM, or framework adapters;
- changing the supported release date, gate date, release channel, or stability claim;
- changing a dependency or ownership requirement that affects delivery risk; or
- re-sequencing work when it changes a gate, dependency, critical path, or review obligation.

Routine clarification, defect correction that preserves the approved contract, and implementation detail that does not change supported behavior are not scope changes. When classification is unclear, record a decision request and escalate under the [escalation procedure](escalation-and-decision-recording.md).

## Decision rights

- The **Aten delivery lead** maintains the baseline, backlog, change register, and decision-log links. The delivery lead may prepare options but cannot approve a material scope or date change.
- The **State product owners** approve product scope, priority, release outcomes, and date or scope trade-offs.
- The relevant **State domain owner** must accept changes to technology, design, accessibility, content, security, or release obligations before the change is approved.
- An **ADR amendment or new ADR** is required when the change affects accepted architecture, release progression, a formal exclusion, or a gate outcome. Approval follows the ADR and gate process; backlog status alone is not approval.
- Delegated approval authority must be recorded in the decision log with its limits and duration.

## Change rules

1. No material change enters implementation until its decision record identifies the affected baseline, rationale, options, approver, owner, dependencies, risks, and validation evidence.
2. Every proposed addition includes an explicit trade-off: capacity added, another item deferred or removed, reduced capability, or supported-release date moved. "Fit it in" is not a trade-off.
3. A change must preserve the minimum evidence required for accessibility, security, testing, documentation, content, packaging, and release approval. Evidence may be re-sequenced only with an owner and due date.
4. An approved change updates the affected backlog items, phase rollups, dependency and risk registers, gate evidence, and release notes or known limitations as applicable.
5. Changes discovered after a gate are evaluated against the next gate's baseline. They do not reopen an approved gate silently.
6. During release preparation and after scope freeze, new features and scope expansions are prohibited unless the State release owner and State product owners approve an explicit exception and its effect on the release decision.
7. No change may be represented as part of `1.0.x` until the required approver and evidence are recorded. Unapproved work remains development work in the `0.0.x` channel.

## Deferral rules

Deferral is a deliberate decision to move work out of the current supported release. It is not an unowned task status or a way to hide incomplete acceptance evidence.

A deferral record must include:

- the item and the release or gate from which it is deferred;
- the reason, affected users, and release risk;
- alternatives considered and the trade-off accepted;
- the next intended release or review trigger, if known;
- dependencies, owner, and conditions for reconsideration;
- any partial implementation, documentation, migration, or known limitation that remains; and
- State product-owner approval plus any required domain-owner approval.

Deferred work is moved to the follow-up backlog and labeled **Deferred**, with links from the original item and the decision log. It is not counted in supported-release completion, public API support, or launch communications. A deferred item may return to scope only through the same change process.

Deferral must not be used to bypass a blocking accessibility, security, legal, or release requirement for an item that is still advertised as supported. The item must instead be removed from the supported baseline or the release must be held or replanned.

## Gate-specific rules

| Point in delivery             | Rule                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Before G0                     | Establish the initial baseline, exclusions, decision rights, and deferral record format.                                                                      |
| G0 to G2                      | Additions require State product-owner approval and an updated capacity/dependency assessment. Architecture or exclusion changes also require an ADR decision. |
| G2 vertical-slice approval    | The architecture-proof baseline is recorded. Changes that invalidate the proof require rework, an ADR decision, or a replan before Phase 3 authorization.     |
| G3 beta approval              | The supported component, foundation, content, and evidence set is frozen for release hardening. Deferred work is added to the follow-up backlog.              |
| G4 release-candidate approval | Only release-blocking corrections that preserve the contract proceed. New scope requires an explicit exception and a new go/no-go assessment.                 |
| G5 supported release          | No new scope is accepted into the release after approval. Follow-up work is planned for a later release.                                                      |

## Required decision record

Each material change or deferral is recorded using the decision procedure and includes at least:

- decision ID, date, status, and affected gate;
- requestor and accountable approver;
- baseline item and proposed change or deferral;
- options, recommendation, rationale, and evidence links;
- scope, schedule, capacity, accessibility, security, content, and release impact;
- dependencies, risks, conditions, owner, and due date; and
- affected backlog items, registers, documentation, and review trigger.

The decision status must be **proposed**, **approved**, **rejected**, **deferred**, or **superseded**. Approval is effective only when the accountable approver is recorded.

## Minimum review checklist

Before approval, the delivery lead confirms that:

- [ ] The affected baseline and release claim are explicit.
- [ ] The proposal includes a capacity, schedule, or scope trade-off.
- [ ] Required domain reviewers have responded.
- [ ] Accessibility, security, content, test, documentation, package, and release impacts are addressed.
- [ ] Dependencies, risks, owner, and needed-by gate are recorded.
- [ ] The backlog, registers, gate evidence, and decision log are linked and updated.
- [ ] Deferred work has a follow-up record and is not presented as supported release scope.

## G0 approval

G0 approval accepts these rules as the operating process for the delivery. The approval record must identify any exceptions, delegated authorities, open conditions, or changes to the baseline.
