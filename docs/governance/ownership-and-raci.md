# CoDS Ownership and RACI

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-001](../backlog/phase-0/CODS-P0-001-establish-ownership-and-decision-rights.md)

## Product ownership

The State product owners are Greg Knaddison (greg.knaddison@state.co.us) and Zach Alcorn (zach.alcorn@state.co.us). They are jointly accountable for product priority, approved scope, release outcomes, and gate acceptance. They may delegate preparation or consultation, but any delegation of approval accountability must be recorded in the decision log.

## Delivery-area RACI

The responsible role prepares the work and evidence. The accountable role accepts the result. Consulted roles provide required review before acceptance; informed roles receive the result.

| Delivery area                                            | Responsible role                       | Accountable role          | Consulted roles                                                |
| -------------------------------------------------------- | -------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| Product scope, priorities, and release outcomes          | Aten delivery lead                     | State product owners      | State technology, content, design, and release roles           |
| Architecture, repository, packages, and browser contract | Aten technical lead                    | State technology owner    | State product owners, accessibility, and release roles         |
| Tokens, visual language, and component design intent     | Aten design lead                       | State design owner        | State product owners, technical, and accessibility roles       |
| Component behavior and documentation examples            | Aten component and documentation leads | Aten delivery lead        | State technology, design, accessibility, and content roles     |
| Accessibility requirements and evidence                  | Aten accessibility lead                | State accessibility owner | State product owners, technical, design, and content roles     |
| Website content, links, imagery, and approvals           | Aten documentation lead                | State content owner       | State product owners, design, accessibility, and domain owners |
| Security, dependency, and operational risk               | Aten technical lead                    | State security owner      | State technology, release, and product roles                   |
| Versioning, publishing, hosting, and release recovery    | Aten release lead                      | State release owner       | State product owners, technology, security, and hosting roles  |

## Working rules

- The accountable role is identified before work begins and is responsible for acceptance, not implementation by default.
- Accessibility participates in component, content, and release decisions, not only final review.
- A role owner may identify a delegate, but the delegation and its duration are recorded in the decision log.
- Unresolved ownership is an escalation, not an assumption that the Aten delivery lead can approve on behalf of the State.

## G0 approval

G0 approval records acceptance of this RACI and names any changes, delegations, or open ownership gaps. Approval is recorded by both State product owners in accordance with the [decision-recording procedure](escalation-and-decision-recording.md).
