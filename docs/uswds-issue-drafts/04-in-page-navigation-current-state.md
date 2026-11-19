# USWDS - Feature: Expose the current in-page navigation location semantically

**Status:** Draft for review; not submitted.

## Is your feature request related to a problem?

The in-page navigation scroll tracker currently indicates the active link
using the `usa-current` CSS class. Sites that want the current location
communicated programmatically must add their own state synchronization.

## Describe the solution you'd like

Consider exposing the active location on the corresponding navigation link
with an appropriate `aria-current` value, such as `location`, in addition to
the existing visual class. When the current section changes, update the
attribute consistently and remove it from the previously active link.

The USWDS accessibility team should evaluate the appropriate semantics and
verify the behavior with supported assistive technologies, including how the
state is conveyed during scroll and keyboard navigation. This request does
not assume that a visual class alone causes a particular screen-reader
failure.

## Describe alternatives you've considered

Observe class changes and synchronize `aria-current` in a wrapper, or maintain
an independent scroll tracker. Either approach duplicates state management
and needs to account for initialization, multiple instances, and teardown.

## Additional context

- In `@uswds/uswds` 3.14.0, the
  [active-state callback](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L32)
  updates the class but does not set `aria-current`.
- The in-page navigation source was identical on `develop` at commit
  [`029d6d7`](https://github.com/uswds/uswds/blob/029d6d792241b3b4107a630590a27ee951a152b5/packages/usa-in-page-navigation/src/index.js).
- The related open issue [uswds/uswds#6501](https://github.com/uswds/uswds/issues/6501)
  concerns landmark placement in the banner, not current-state semantics for
  in-page navigation.

Before submitting, recheck related open issues and complete the USWDS feature
request form's required confirmations.
