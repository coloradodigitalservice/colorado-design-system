# USWDS - Feature: Enhance authored in-page navigation links

**Status:** Draft for review; not submitted.

## Is your feature request related to a problem?

The in-page navigation JavaScript generates a navigation list from page
headings. Sites that already provide a list of anchor links cannot use the
scroll-tracking behavior to enhance that list: initializing the component
appends another navigation and inserts new anchors into the headings.

An authored list can work without JavaScript and can use concise link labels
that differ from the full section headings. Generating a second list introduces
duplicate navigation when JavaScript is enabled.

## Describe the solution you'd like

Provide a supported way to enhance an existing list of in-page links with the
current-section behavior, without generating a second list or replacing the
author's link text and targets. Preserve the existing generated-navigation
mode for sites that prefer it.

For example, the following authored links should remain the navigation after
enhancement, and should still work when JavaScript is disabled:

```html
<aside class="usa-in-page-nav" data-main-content-selector="#content">
  <nav aria-label="On this page">
    <ul class="usa-in-page-nav__list">
      <li>
        <a class="usa-in-page-nav__link" href="#eligibility">Eligibility</a>
      </li>
      <li><a class="usa-in-page-nav__link" href="#apply">Apply</a></li>
    </ul>
  </nav>
</aside>
<main id="content">
  <h2 id="eligibility">Who is eligible for the program?</h2>
  <h2 id="apply">How to apply for the program</h2>
</main>
```

Ideally, the implementation would resolve the existing fragment targets,
support shorter authored labels, and make the tracking behavior usable
independently of automatic markup generation. The precise API can be
determined by the USWDS team.

## Describe alternatives you've considered

We currently maintain a separate scroll tracker for authored links. Another
option would be to adapt or fork the upstream behavior, but the observer and
markup generation are coupled in the current implementation.

## Additional context

- Observed with `@uswds/uswds` 3.14.0. In a small DOM test, initialization
  retained the two authored links and appended a generated navigation with two
  more links and two heading anchors.
- The [3.14.0 implementation](https://github.com/uswds/uswds/blob/v3.14.0/packages/usa-in-page-navigation/src/index.js#L268)
  creates the navigation and observer together. The same source file was
  present on `develop` at commit
  [`029d6d7`](https://github.com/uswds/uswds/blob/029d6d792241b3b4107a630590a27ee951a152b5/packages/usa-in-page-navigation/src/index.js).
- Related prior issue: [uswds/uswds#5426](https://github.com/uswds/uswds/issues/5426)
  requested reuse of heading IDs. This request is broader: it concerns
  enhancing an authored navigation list and preserving its labels and targets.

Before submitting, recheck related open issues and complete the USWDS feature
request form's required confirmations.
