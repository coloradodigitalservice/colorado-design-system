# USWDS - Bug: In-page navigation observer continues after teardown

**Status:** Draft for review; not submitted.

## Describe the bug

Calling `off(root)` removes the in-page navigation's delegated event listeners,
but its `IntersectionObserver` is not disconnected. The generated navigation,
heading anchors, and `data-enhanced` attribute also remain. This makes it
difficult for applications to unmount or reinitialize the component cleanly.

## Steps to reproduce the bug

1. In a browser application using `@uswds/uswds` 3.14.0, initialize an
   in-page navigation with at least two headings using
   `inPageNavigation.on(root)`.
2. Confirm that the generated navigation and heading anchors are present.
3. Call `inPageNavigation.off(root)` and inspect the generated markup and
   `data-enhanced` attribute.
4. Scroll the page or instrument `IntersectionObserver.disconnect()` to check
   whether the observer was disconnected.
5. Call `on(root)` again and check whether initialization can start from a
   clean state.

In a small DOM test with a stubbed observer, `off()` left the generated
markup and attribute in place and did not call `disconnect()`. The
`data-enhanced` guard also causes subsequent initialization to skip creation.
The browser scroll behavior and browser/version should be confirmed before
filing.

## Expected behavior

`off(root)` should stop observation and remove or otherwise restore
component-owned state so the component can be unmounted and initialized again
without retaining stale observers or generated markup. Cleanup should not
remove author-provided content or affect other component instances.

## Related code

- [Observer creation and enhanced flag in 3.14.0](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L365)
- [In-page navigation behavior definition](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L414):
  it supplies an initializer but no teardown.
- [Shared behavior `off()`](https://github.com/uswds/uswds/blob/v3.14.0/packages/uswds-core/src/js/utils/behavior.js#L108):
  it invokes a teardown if one is supplied and removes listeners.

The in-page navigation source was identical on `develop` at commit
[`029d6d7`](https://github.com/uswds/uswds/blob/029d6d792241b3b4107a630590a27ee951a152b5/packages/usa-in-page-navigation/src/index.js).

## System setup

- USWDS: 3.14.0
- Browser, version, operating system, and public browser reproduction: to
  verify before submission.

Before submitting, recheck related open issues and complete the USWDS bug
report form's required confirmations.
