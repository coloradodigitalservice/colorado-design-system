---
title: In-Page Navigation
description: Links that help people jump to sections on the current page.
navLabel: In-Page Navigation
order: 14
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1859-713
---

## When to use

Use in-page navigation on long pages with several clearly labeled sections. Link to headings on the same page, and keep link labels short and descriptive. Do not use it for short pages, links to other pages, or lower-level subsections.

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

The controller sets `aria-current="location"` on the current link and emits `cods-in-page-navigation:change` with `detail.id` when that section changes. It listens for page scroll and resize while initialized, and removes those listeners on destroy. It does not intercept links, change focus, or request animated scrolling. Destroying an instance restores the authored current states. After changing links or section IDs, call `destroyInPageNavigation` for that navigation before initializing it again.

The component is experimental. It uses an explicit list of links instead of USWDS's generated list; design and accessibility review of this divergence is pending.
