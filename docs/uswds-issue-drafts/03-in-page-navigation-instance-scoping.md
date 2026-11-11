# USWDS - Feature: Scope in-page navigation tracking to each instance

**Status:** Draft for review; not submitted.

## Is your feature request related to a problem?

The in-page navigation implementation uses document-wide selectors to collect
anchors and update current links. If a page has more than one in-page
navigation, one instance can clear the other instance's current state or
observe anchors outside its configured content region. Link lookup also
selects the first matching link in the document rather than a link in the
associated navigation.

This makes independently mounted navigation regions difficult to use. This
request does not assume that multiple instances are currently documented as
supported.

## Describe the solution you'd like

Support independent navigation instances by associating each observer,
content region, and active-link update with its own component root. Updating
one navigation should not clear or set current state in another. Removing one
instance should not affect the others.

For example, a page might contain two `.usa-in-page-nav` roots, each with a
different `data-main-content-selector` pointing to its own region with at
least two headings. Scrolling through one region should update the
corresponding navigation without changing the other navigation's state.

## Describe alternatives you've considered

Use one navigation per document, or implement a separate instance-scoped
tracker. A wrapper alone cannot change the internal document-wide selections
without adapting the behavior.

## Additional context

This is based on source inspection of `@uswds/uswds` 3.14.0:

- [Anchor collection](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L132)
  searches the document.
- [Active-link selection](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L32)
  clears matching links across the document and selects the first link
  matching the target fragment.

The in-page navigation source was identical on `develop` at commit
[`029d6d7`](https://github.com/uswds/uswds/blob/029d6d792241b3b4107a630590a27ee951a152b5/packages/usa-in-page-navigation/src/index.js).
A public browser reproduction should be prepared before filing.

Before submitting, recheck related open issues and complete the USWDS feature
request form's required confirmations.
