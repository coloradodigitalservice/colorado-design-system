# CoDS Escalation and Decision-Recording Procedure

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-001](../backlog/phase-0/CODS-P0-001-establish-ownership-and-decision-rights.md)

## Escalation procedure

1. The person who identifies a blocker, risk, defect, or disagreement records it in the backlog or risk register, names an owner, states the affected gate or delivery area, and proposes a next action.
2. The responsible role attempts resolution with the relevant domain roles. A decision request is posted to the project channel or issue and linked to the affected work item so the response clock is visible.
3. Escalate to the Aten delivery lead and State product owners when the issue affects approved component scope, a gate date, an external dependency, a release or accessibility risk, or an accepted architecture decision. Escalate immediately for a potential security, privacy, or production-impacting issue.
4. The State product owners decide, request evidence, assign a time-boxed investigation, or route the matter to the relevant domain approver. Work may not silently expand the capped release while an escalation is open.
5. If the issue changes accepted architecture, release progression, scope, or a gate outcome, record it as an ADR amendment or new ADR and create or update the related backlog task before implementation proceeds.
6. A blocked item is reviewed at the next weekly review at the latest. Items that could miss a gate are escalated as soon as the risk is known and include a recovery option, scope tradeoff, or date change.

## Decision-recording procedure

Every material decision is recorded in the project decision log, including decisions made during meetings or in chat. Each record includes:

- decision ID and date;
- concise question or problem statement;
- options considered and the selected option;
- rationale and evidence links;
- accountable approver and consulted roles;
- affected scope, gate, backlog items, risks, and dependencies;
- implementation owner and due date, if follow-up is required;
- status: proposed, approved, rejected, deferred, or superseded; and
- review date or trigger when the decision is time-boxed or conditional.

The Aten delivery lead maintains the log and links records from affected backlog items. The accountable approver confirms approval in the record, and the delivery lead communicates approved decisions in the next status update. A decision is not final until its status and approver are recorded.

## G0 decision-log entry

The G0 entry must record both State product owners as approvers, link this procedure and the companion governance deliverables, identify any delegated role ownership, and list open conditions with owners and due dates.
