# CoDS Gate Approval Matrix

**Status:** Draft for G0 approval  
**Related backlog item:** [CODS-P0-001](../backlog/phase-0/CODS-P0-001-establish-ownership-and-decision-rights.md)

The responsible delivery lead assembles gate evidence and the required domain roles review it. Approval is recorded by the accountable role below. Silence or completion of implementation tasks does not constitute approval.

| Gate                   | Approval role                                                                  | Minimum evidence                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| G0 - Mobilization      | State product owners                                                           | Ownership and RACI, access, scope, dependencies, decision rights, and review cadence                                |
| G1 - Foundation        | State product owners, with State technology owner acceptance                   | Monorepo, token, component-contract, docs, Storybook, CI, package-build, and release workflow evidence              |
| G2 - Vertical slice    | State product owners, with State technology and accessibility owner acceptance | Static and interactive component evidence, tests, accessibility results, documentation, package, and archive        |
| G3 - Beta              | State product owners, with required domain-owner acceptance                    | Approved component inventory, implementation, documentation, accessibility, content, and beta artifacts             |
| G4 - Release candidate | State product owners, with State release owner acceptance                      | Scope freeze, full test and accessibility evidence, security review, content review, and verified release artifacts |
| G5 - Supported release | State release owner, with State product owner approval                         | Published packages and archive, deployed docs, support ownership, limitations, and launch record                    |

## Gate decision outcomes

The accountable approver records one of the following outcomes:

- **Approve:** Evidence satisfies the gate and the next phase may proceed.
- **Approve with conditions:** Proceeding is authorized with named conditions, owners, and due dates.
- **Hold:** Evidence is incomplete or a blocker must be resolved before proceeding.
- **Replan:** Scope, sequencing, capacity, or date must change and the resulting decision is recorded.

A gate decision must link its evidence, open risks, conditions, and follow-up backlog items.
