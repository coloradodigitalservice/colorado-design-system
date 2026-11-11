---
title: In-Page Navigation
description: Links that help people jump to sections on the current page.
navLabel: In-Page Navigation
order: 14
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1859-713
---

## When to use

Place in-page navigation near the top of a long page with several clearly labeled sections. Link to the page’s H2 sections, in the same order they appear. Do not use it for short pages, links to other pages, or lower-level subsections.

Use short, descriptive labels in sentence case. For example, use “Who can apply” and “Required documents,” rather than “WHO CAN APPLY” or “Click here.” Labels should clearly match their section headings.

On mobile, the navigation appears in the page flow and does not stick to the screen as people scroll. Hover styling is reserved for devices that support hover at desktop widths.

## Markup and behavior

Give each section a unique ID and use that ID in its corresponding link. Put the section heading inside the section. List sections in page order. The links work without JavaScript. Load the design system styles and tokens as described in [Getting started](../getting-started/).

The example above includes copyable markup from the component fixture.

To highlight the current section as the page scrolls, initialize the component:

```js
import {
  initAllInPageNavigation,
  destroyInPageNavigation,
} from '@coloradodigitalservice/colorado-design-system';

initAllInPageNavigation();
// Before removing a navigation from the page:
// destroyInPageNavigation(navigation);
```

The controller sets `aria-current="location"` on the current link and emits `cods-in-page-navigation:change` with `detail.id` when that section changes. It tracks scrolling of the page, not independently scrolling containers. It listens for page scroll and resize while initialized, and removes those listeners on destroy. It does not intercept links, change focus, or request animated scrolling. Destroying an instance restores the authored current states. After changing links or section IDs, call `destroyInPageNavigation` for that navigation before initializing it again.

The component is experimental. It uses an explicit list of links and a scroll tracker in place of USWDS JavaScript; the reason is recorded in the [component contract](https://github.com/coloradodigitalservice/colorado-design-system/blob/main/docs/governance/component-contract.md#46-in-page-navigation-exception). Design and accessibility review remain pending.
